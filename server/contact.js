/**
 * Traitement du formulaire de contact, indépendant de l’hébergeur (Request/Response standard).
 * Utilisé par api/contact.js (Vercel) et functions/api/contact.js (Cloudflare Pages).
 *
 * - Validation côté serveur (SEC-05) ; nom + au moins un moyen de contact (CONV-05).
 * - Champ piège + délai minimal de saisie (obligatoire pour l’envoi par JavaScript) + limite de 5 envois par
 *   adresse IP et par 10 minutes et par instance ; la limite globale est une règle de l’hébergeur (SEC-01,
 *   docs/exploitation.md).
 * - Envois d’un autre site refusés : en-tête Origin ou Sec-Fetch-Site obligatoire et de la même origine (SEC-01).
 * - Retours à la ligne supprimés de toute valeur utilisée dans les en-têtes (injection d’en-têtes).
 * - Aucun fichier joint accepté (SEC-06) ; rien n’est stocké : la demande est envoyée par e-mail (Resend).
 * - Corps limité à 20 Ko et forcément un objet ; appel à Resend abandonné après 8 s (SEC-02).
 * - Sans JavaScript : redirection vers la page de remerciement ou de nouveau vers le formulaire.
 * - E-mail lisible par l’équipe commerciale (OPS-06) : libellés des choix au lieu des codes, origine de la demande
 *   (campagne des QR codes, page précédente), lien vers le projet de référence seulement s’il existe.
 *
 * Variables d’environnement : RESEND_API_KEY, CONTACT_TO (adresses séparées par des virgules),
 * CONTACT_FROM (ex. « Site GCG <site@gcg-ci.com> », domaine authentifié SPF/DKIM).
 */
import { secure } from './headers.js'
import { PROFILES, PROJECT_TYPES } from '../src/data/contact-options.js'
// Adresses de projet déjà publiées (registre du contrôle du contenu) : seules celles-ci donnent un lien
import registry from '../src/data/published-slugs.json' with { type: 'json' }

const KNOWN_PROJECTS = new Set(registry)

/**
 * Pages d’arrivée sans JavaScript (mêmes adresses que src/i18n, routes thanks, formError, formRate, formFailed) :
 * une page par cause, pour donner le bon conseil (OPS-05). Toute autre erreur (envoi en échec, service non
 * configuré, format refusé, autre site) mène à « envoi impossible ».
 */
const RESULT_PAGES = {
  fr: { ok: '/contact/merci', invalid: '/contact/erreur', rate: '/contact/erreur/attente', other: '/contact/erreur/envoi' },
  en: { ok: '/en/contact/thanks', invalid: '/en/contact/error', rate: '/en/contact/error/wait', other: '/en/contact/error/sending' },
}
const LIMIT = 5
const WINDOW = 10 * 60 * 1000
const MIN_FILL_MS = 3000
const MAX_BODY = 20 * 1024
const RESEND_TIMEOUT_MS = 8000
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

/**
 * Envoi depuis une page du site : Sec-Fetch-Site, s’il est présent, vaut same-origin, et Origin, s’il est présent,
 * est l’origine de la requête ou celle de SITE_URL (domaine public). Une requête sans aucun des deux en-têtes,
 * que tout navigateur actuel envoie avec un POST, vient d’un script : refusée (SEC-01).
 */
function sameOrigin(request, env) {
  const own = [new URL(request.url).origin]
  try {
    if (env.SITE_URL) own.push(new URL(env.SITE_URL).origin)
  } catch {
    /* SITE_URL mal formée : seule l’origine de la requête compte */
  }
  const site = request.headers.get('sec-fetch-site')
  const origin = request.headers.get('origin')
  if (site && site !== 'same-origin') return false
  return origin ? own.includes(origin) : site === 'same-origin'
}

/**
 * Origine lue dans l’en-tête Referer (la page du formulaire), quand la page n’a pas pu la poser elle-même
 * (envoi sans JavaScript) : marquage de campagne et chemin de la page.
 */
function refererSource(request) {
  try {
    const u = new URL(request.headers.get('referer') ?? '')
    const campaign = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => u.searchParams.get(k)).filter(Boolean)
    return oneLine([campaign.join(' / '), u.pathname].filter(Boolean).join(' · '), 200)
  } catch {
    return ''
  }
}

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
    src: oneLine(raw.src, 200),
    lang: raw.lang === 'en' ? 'en' : 'fr',
  }
  const errors = {}
  if (data.name.length < 2) errors.name = 'required'
  if (!data.phone && !data.email) errors.contact = 'required'
  if (data.phone && !/^\+?[\d\s().-]{8,30}$/.test(data.phone)) errors.phone = 'invalid'
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'invalid'
  if (data.type && !Object.hasOwn(PROJECT_TYPES, data.type)) errors.type = 'invalid'
  if (!Object.hasOwn(PROFILES, data.profile)) data.profile = ''
  if (!KNOWN_PROJECTS.has(data.ref)) data.ref = ''
  return Object.keys(errors).length ? { errors, data } : { data }
}

function emailBody(d, origin) {
  // Champ vide : ligne absente (null), sans laisser de ligne blanche au milieu des coordonnées
  const fr = (k, v) => (v ? `${k} : ${v}` : null)
  return [
    'Nouvelle demande reçue depuis le site de GCG.',
    '',
    fr('Nom', d.name),
    fr('Téléphone / WhatsApp', d.phone),
    fr('E-mail', d.email),
    fr('Profil', PROFILES[d.profile]?.fr),
    fr('Type de projet', PROJECT_TYPES[d.type]?.fr),
    fr('Localisation', d.location),
    d.ref ? `Projet de référence : ${origin}/realisations/${d.ref}` : null,
    fr('Langue de la page', d.lang === 'en' ? 'anglais' : 'français'),
    fr('Origine', d.src),
    '',
    d.message ? `Message :\n${d.message}` : null,
    '',
    '—',
    'Répondre directement à cet e-mail écrit au visiteur s’il a donné son adresse.',
  ]
    .filter((l) => l !== null)
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n')
}

async function send(d, env, origin) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    // Resend qui ne répond pas : la fonction s’arrête au lieu d’attendre la limite de l’hébergeur
    signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: String(env.CONTACT_TO)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ...(d.email ? { reply_to: d.email } : {}),
      subject: oneLine(`Demande de projet — ${d.name}${d.type ? ` (${PROJECT_TYPES[d.type].fr})` : ''}`, 150),
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
    if (wantsJson) return Response.json({ ok: status < 300, code, ...extra }, { status, headers: secure({ 'Cache-Control': 'no-store' }) })
    const pages = RESULT_PAGES[lang]
    const to = status < 300 ? pages.ok : `${pages[code] ?? pages.other}?code=${code}`
    return new Response(null, { status: 303, headers: secure({ Location: to, 'Cache-Control': 'no-store' }) })
  }

  if (!sameOrigin(request, env)) return reply(403, 'forbidden')
  if (ctype.includes('multipart/form-data')) return reply(415, 'unsupported')
  // Corps de plus de 20 Ko (annoncé ou réel) : refusé sans être interprété (SEC-02)
  if (Number(request.headers.get('content-length')) > MAX_BODY) return reply(413, 'invalid')
  const json = ctype.includes('application/json')
  let raw
  try {
    const body = await request.text()
    if (new TextEncoder().encode(body).length > MAX_BODY) return reply(413, 'invalid')
    raw = json ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body))
  } catch {
    return reply(400, 'invalid')
  }
  // JSON valide mais pas un objet (null, tableau, texte, nombre) : refusé au lieu d’une erreur 500
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return reply(400, 'invalid')
  lang = raw.lang === 'en' ? 'en' : 'fr'

  // Robots : champ piège rempli, envoi trop rapide, ou envoi JSON sans heure d’ouverture du formulaire (la page la
  // pose toujours ; sans JavaScript, le champ t reste vide) → réponse « succès » sans envoi (SEC-01)
  const started = Number(raw.t)
  const tooFast = started > 0 ? Date.now() - started < MIN_FILL_MS : json
  if (raw.website || tooFast) return reply(200, 'ok')
  if (rateLimited(ip || 'unknown')) return reply(429, 'rate')

  const { data, errors } = validate(raw)
  if (errors) return reply(422, 'invalid', { errors })
  if (!data.src) data.src = refererSource(request)
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) return reply(503, 'unavailable')
  try {
    return (await send(data, env, origin)) ? reply(200, 'ok') : reply(502, 'failed')
  } catch {
    return reply(502, 'failed')
  }
}
