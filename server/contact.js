/**
 * Traitement du formulaire de contact, indépendant de l’hébergeur (Request/Response standard).
 * Utilisé par api/contact.js (Vercel) et functions/api/contact.js (Cloudflare Pages).
 *
 * - Validation côté serveur (SEC-05) ; nom + au moins un moyen de contact (CONV-05).
 * - Champ piège + délai minimal de saisie + limite de 5 envois par adresse IP et par 10 minutes.
 * - Retours à la ligne supprimés de toute valeur utilisée dans les en-têtes (injection d’en-têtes).
 * - Aucun fichier joint accepté (SEC-06) ; rien n’est stocké : la demande est envoyée par e-mail (Resend).
 * - Sans JavaScript : redirection vers la page de remerciement ou de nouveau vers le formulaire.
 *
 * Variables d’environnement : RESEND_API_KEY, CONTACT_TO (adresses séparées par des virgules),
 * CONTACT_FROM (ex. « Site GCG <site@gcg-ci.com> », domaine authentifié SPF/DKIM).
 */

const TYPES = ['villa', 'residence', 'immeuble', 'hotel', 'commerce', 'industrie', 'equipement', 'vrd', 'renovation', 'etude', 'autre']
const PROFILES = ['particulier', 'diaspora', 'investisseur', 'hotelier', 'entreprise', 'autre', '']
const LIMIT = 5
const WINDOW = 10 * 60 * 1000
const MIN_FILL_MS = 3000
const hits = new Map()

const oneLine = (v, max) =>
  String(v ?? '')
    .replace(/[\r\n\t\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
const multiLine = (v, max) =>
  String(v ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max)

function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > LIMIT
}

/** Valide les champs ; retourne { data } ou { errors: { champ: code } }. */
export function validate(raw) {
  const data = {
    name: oneLine(raw.name, 100),
    phone: oneLine(raw.phone, 30),
    email: oneLine(raw.email, 254).toLowerCase(),
    type: oneLine(raw.type, 20),
    location: oneLine(raw.location, 120),
    message: multiLine(raw.message, 3000),
    profile: oneLine(raw.profile, 20),
    ref: oneLine(raw.ref, 80),
    lang: raw.lang === 'en' ? 'en' : 'fr',
  }
  const errors = {}
  if (data.name.length < 2) errors.name = 'required'
  if (!data.phone && !data.email) errors.contact = 'required'
  if (data.phone && !/^\+?[\d\s().-]{8,30}$/.test(data.phone)) errors.phone = 'invalid'
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'invalid'
  if (data.type && !TYPES.includes(data.type)) errors.type = 'invalid'
  if (!PROFILES.includes(data.profile)) data.profile = ''
  if (data.ref && !/^[a-z0-9-]+$/.test(data.ref)) data.ref = ''
  return Object.keys(errors).length ? { errors, data } : { data }
}

function emailBody(d, origin) {
  const fr = (k, v) => (v ? `${k} : ${v}` : '')
  return [
    'Nouvelle demande reçue depuis le site de GCG.',
    '',
    fr('Nom', d.name),
    fr('Téléphone / WhatsApp', d.phone),
    fr('E-mail', d.email),
    fr('Profil', d.profile),
    fr('Type de projet', d.type),
    fr('Localisation', d.location),
    d.ref ? `Projet de référence : ${origin}/realisations/${d.ref}` : '',
    fr('Langue de la page', d.lang === 'en' ? 'anglais' : 'français'),
    '',
    d.message ? `Message :\n${d.message}` : '',
    '',
    '—',
    'Répondre directement à cet e-mail écrit au visiteur s’il a donné son adresse.',
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n')
}

async function send(d, env, origin) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: String(env.CONTACT_TO)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ...(d.email ? { reply_to: d.email } : {}),
      subject: oneLine(`Demande de projet — ${d.name}${d.type ? ` (${d.type})` : ''}`, 150),
      text: emailBody(d, origin),
    }),
  })
  return res.ok
}

/**
 * @param {Request} request
 * @param {Record<string, string | undefined>} env
 * @param {string} ip
 */
export async function handleContact(request, env, ip) {
  const origin = new URL(request.url).origin
  const ctype = request.headers.get('content-type') ?? ''
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json')
  let lang = 'fr'

  const reply = (status, code, extra = {}) => {
    if (wantsJson) return Response.json({ ok: status < 300, code, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } })
    const to =
      status < 300 ? (lang === 'en' ? '/en/contact/thanks' : '/contact/merci') : `${lang === 'en' ? '/en/contact/error' : '/contact/erreur'}?code=${code}`
    return new Response(null, { status: 303, headers: { Location: to, 'Cache-Control': 'no-store' } })
  }

  if (ctype.includes('multipart/form-data')) return reply(415, 'unsupported')
  let raw
  try {
    raw = ctype.includes('application/json') ? await request.json() : Object.fromEntries(new URLSearchParams(await request.text()))
  } catch {
    return reply(400, 'invalid')
  }
  lang = raw.lang === 'en' ? 'en' : 'fr'

  // Robots : champ piège rempli ou envoi trop rapide → réponse « succès » sans envoi
  const started = Number(raw.t)
  if (raw.website || (started && Date.now() - started < MIN_FILL_MS)) return reply(200, 'ok')
  if (rateLimited(ip || 'unknown')) return reply(429, 'rate')

  const { data, errors } = validate(raw)
  if (errors) return reply(422, 'invalid', { errors })
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) return reply(503, 'unavailable')
  try {
    return (await send(data, env, origin)) ? reply(200, 'ok') : reply(502, 'failed')
  } catch {
    return reply(502, 'failed')
  }
}
