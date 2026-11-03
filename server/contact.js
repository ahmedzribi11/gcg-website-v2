/**
 * Traitement du formulaire de contact, indépendant de l’hébergeur (Request/Response standard).
 * Utilisé par api/contact.js (Vercel) et functions/api/contact.js (Cloudflare Pages).
 *
 * - Validation côté serveur (SEC-05) ; nom + au moins un moyen de contact (CONV-05).
 * - Champ piège + délai minimal de saisie + limite de 5 envois par adresse IP et par 10 minutes.
 * - Retours à la ligne supprimés de toute valeur utilisée dans les en-têtes (injection d’en-têtes).
 * - Aucun fichier joint accepté (SEC-06) ; rien n’est stocké : la demande est envoyée par e-mail (Resend).
 * - Sans JavaScript : redirection vers la page de remerciement ou de nouveau vers le formulaire.
 * - Devis estimatif (champ kind = « devis », page /devis-estimatif) : mêmes protections, e-mail dédié
 *   avec les coordonnées, les surfaces, les options et la fourchette affichée au visiteur.
 *
 * Variables d’environnement : RESEND_API_KEY, CONTACT_TO (adresses séparées par des virgules),
 * CONTACT_FROM (ex. « Site GCG <site@gcg-ci.com> », domaine authentifié SPF/DKIM).
 */

import { PROJECT_TYPES, parseArea } from '../src/lib/estimate.js'

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

const ESTIMATE_TYPE_LABELS = { villa: 'Villa', immeuble: 'Immeuble', 'local-commercial': 'Local commercial', autre: 'Autre' }
const yes = (v) => v === 'oui' || v === true || v === 'on'
/** Montant envoyé par la page (entier positif, en FCFA) ; 0 si absent ou invalide. */
const amount = (v) => {
  const n = Number(String(v ?? '').replace(/[^\d]/g, ''))
  return Number.isSafeInteger(n) && n > 0 ? n : 0
}

/** Valide un devis estimatif ; retourne { data } ou { errors: { champ: code } }. */
export function validateEstimate(raw) {
  const terrain = parseArea(raw.terrain)
  const constructible = parseArea(raw.constructible)
  const data = {
    nom: oneLine(raw.nom, 60),
    prenom: oneLine(raw.prenom, 60),
    phone: oneLine(raw.phone, 30),
    email: oneLine(raw.email, 254).toLowerCase(),
    type: oneLine(raw.type, 20),
    terrain,
    constructible,
    piscine: yes(raw.piscine),
    cloture: yes(raw.cloture),
    etudes: yes(raw.etudes),
    low: amount(raw.low),
    high: amount(raw.high),
    lang: raw.lang === 'en' ? 'en' : 'fr',
  }
  const errors = {}
  if (!data.nom) errors.nom = 'required'
  if (!data.prenom) errors.prenom = 'required'
  if (!data.phone) errors.phone = 'required'
  else if (!/^\+?[\d\s().-]{8,30}$/.test(data.phone)) errors.phone = 'invalid'
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'invalid'
  if (!PROJECT_TYPES.includes(data.type)) errors.type = 'invalid'
  if (terrain === null) errors.terrain = 'required'
  else if (Number.isNaN(terrain)) errors.terrain = 'invalid'
  if (Number.isNaN(constructible)) errors.constructible = 'invalid'
  if (!data.low || !data.high || data.low > data.high) data.low = data.high = 0
  return Object.keys(errors).length ? { errors, data } : { data }
}

function estimateBody(d) {
  const m2 = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} m²`
  const fcfa = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`
  const ouiNon = (b) => (b ? 'Oui' : 'Non')
  return [
    'Nouvelle demande de devis estimatif reçue depuis le site de GCG.',
    '',
    `Nom : ${d.nom}`,
    `Prénom : ${d.prenom}`,
    `Téléphone / WhatsApp : ${d.phone}`,
    d.email ? `E-mail : ${d.email}` : '',
    '',
    `Type de projet : ${ESTIMATE_TYPE_LABELS[d.type]}`,
    `Surface du terrain : ${m2(d.terrain)}`,
    `Surface constructible : ${d.constructible ? m2(d.constructible) : 'non indiquée par le client'}`,
    `Piscine : ${ouiNon(d.piscine)}`,
    `Clôture : ${ouiNon(d.cloture)}`,
    `Études et permis de construire : ${ouiNon(d.etudes)}`,
    '',
    d.low ? `Estimation affichée au client : entre ${fcfa(d.low)} et ${fcfa(d.high)}` : 'Estimation : non calculée (navigateur sans JavaScript).',
    `Langue de la page : ${d.lang === 'en' ? 'anglais' : 'français'}`,
    '',
    '—',
    'Rappeler le client pour établir le devis détaillé.',
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n')
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

async function send(d, env, origin, estimate = false) {
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
      subject: estimate
        ? oneLine(`Devis estimatif — ${d.prenom} ${d.nom} (${ESTIMATE_TYPE_LABELS[d.type]})`, 150)
        : oneLine(`Demande de projet — ${d.name}${d.type ? ` (${d.type})` : ''}`, 150),
      text: estimate ? estimateBody(d) : emailBody(d, origin),
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

  const estimate = raw.kind === 'devis'
  const { data, errors } = estimate ? validateEstimate(raw) : validate(raw)
  if (errors) return reply(422, 'invalid', { errors })
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) return reply(503, 'unavailable')
  try {
    return (await send(data, env, origin, estimate)) ? reply(200, 'ok') : reply(502, 'failed')
  } catch {
    return reply(502, 'failed')
  }
}
