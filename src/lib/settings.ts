import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import raw from '../data/settings.json'

/**
 * Paramètres du site (coordonnées, réseaux, médias), modifiables dans
 * l’espace de gestion (/admin) ou directement dans src/data/settings.json.
 * Tout champ vide est simplement masqué sur le site.
 */
export const settings = raw

/** Un champ supprimé ou vidé dans l’espace de gestion devient une chaîne vide. */
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const c: Record<string, unknown> = settings.contact ?? {}
const digits = (s: string) => s.replace(/[^\d+]/g, '').replace(/^00/, '+')

/** Numéro au format international E.164 (+225XXXXXXXXXX) ; un numéro ivoirien à 10 chiffres reçoit +225. */
export function toE164(raw: string) {
  const d = digits(raw)
  if (!d) return ''
  if (d.startsWith('+')) return d
  if (/^0\d{9}$/.test(d)) return `+225${d}`
  return `+${d}`
}

/** Affichage : « +225 07 00 00 00 00 » pour la Côte d’Ivoire, sinon le numéro tel que saisi. */
export function displayPhone(raw: string) {
  const e = toE164(raw)
  const ci = /^\+225(\d{10})$/.exec(e)
  return (ci ? `+225 ${ci[1].replace(/(\d{2})(?=\d)/g, '$1 ')}` : raw.trim().replace(/\s+/g, ' ')).replace(/ /g, '\u00a0')
}

const phone = str(c.phone)
const phone2 = str(c.phone2)
const whatsapp = str(c.whatsapp)
const tz = { fr: ' (GMT, heure d’Abidjan)', en: ' (GMT, Abidjan time)' }
const withTz = (h: string, lang: 'fr' | 'en') => (h && !/GMT|UTC/i.test(h) ? h + tz[lang] : h)

export const contact = {
  phone: phone ? displayPhone(phone) : '',
  phoneE164: toE164(phone),
  phoneHref: phone ? `tel:${toE164(phone)}` : '',
  /** Second numéro (ex. bureau en Tunisie), affiché au pied de page, sur Contact et dans les mentions légales. */
  phone2: phone2 ? displayPhone(phone2) : '',
  phone2E164: toE164(phone2),
  phone2Href: phone2 ? `tel:${toE164(phone2)}` : '',
  whatsapp: whatsapp ? displayPhone(whatsapp) : '',
  /** Numéro au format international sans « + » pour wa.me. */
  whatsappNumber: toE164(whatsapp).replace('+', ''),
  email: str(c.email),
  address: str(c.address),
  mapsUrl: str(c.mapsUrl),
  hours: withTz(str(c.hours), 'fr'),
  hours_en: withTz(str(c.hours_en) || str(c.hours), 'en'),
}

const m: Record<string, unknown> = settings.media ?? {}
export const media = {
  videoUrl: str(m.videoUrl),
}

export interface DocumentFile {
  title: string
  title_en: string
  lang: 'fr' | 'en'
  date: string
  href: string
  /** Nom de fichier proposé au téléchargement : GCG-CI_Portfolio_FR_2026-10.pdf */
  downloadName: string
  bytes: number
}

const ascii = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Documents téléchargeables (PDF dans public/documents) ; taille lue au build. */
export const documents: DocumentFile[] = ((settings as { documents?: unknown[] }).documents ?? [])
  .map((d) => d as Record<string, unknown>)
  .filter((d) => str(d.file))
  .map((d) => {
    const href = str(d.file)
    const path = join(process.cwd(), 'public', href)
    const lang = d.lang === 'en' ? 'en' : 'fr'
    return {
      title: str(d.title),
      title_en: str(d.title_en) || str(d.title),
      lang,
      date: str(d.date),
      href,
      downloadName: `GCG-CI_${ascii(str(d.title_en) || str(d.title))}_${lang.toUpperCase()}_${str(d.date)}.pdf`,
      bytes: existsSync(path) ? statSync(path).size : 0,
    } satisfies DocumentFile
  })

/** « PDF · FR · 2,4 Mo · octobre 2026 » */
export function documentLabel(d: DocumentFile, lang: 'fr' | 'en') {
  const mb = d.bytes / 1048576
  const size = lang === 'fr' ? `${mb.toFixed(1).replace('.', ',')}\u00a0Mo` : `${mb.toFixed(1)}\u00a0MB`
  const [y, mo] = d.date.split('-').map(Number)
  const when = y && mo ? new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'long', year: 'numeric' }).format(new Date(y, mo - 1, 1)) : ''
  const language = lang === 'fr' ? (d.lang === 'fr' ? 'français' : 'anglais') : d.lang === 'fr' ? 'French' : 'English'
  return ['PDF', language, size, when].filter(Boolean).join(' · ')
}

export const hasContact = Boolean(contact.phone || contact.phone2 || contact.whatsapp || contact.email)

export const whatsappLink = (text?: string) =>
  contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}` : ''

export const SOCIAL_NAMES = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube' } as const
export type SocialKey = keyof typeof SOCIAL_NAMES

export const socials = (Object.keys(SOCIAL_NAMES) as SocialKey[])
  .map((key) => ({ key, name: SOCIAL_NAMES[key], url: str((settings.social as Record<string, unknown> | undefined)?.[key]) }))
  .filter((s) => s.url)

/** URL d’intégration d’une vidéo YouTube / Vimeo, ou fichier vidéo direct. */
export function videoEmbed(url: string): { kind: 'iframe' | 'file'; src: string } | null {
  if (!url) return null
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url)
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` }
  const vm = /vimeo\.com\/(\d+)/.exec(url)
  if (vm) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` }
  return { kind: 'file', src: url }
}

/** Lien WhatsApp avec un message prérempli qui nomme la page d’origine (FR ou EN). */
export function pageWhatsApp(lang: 'fr' | 'en', pageTitle?: string) {
  const page = pageTitle ?? (lang === 'fr' ? 'Accueil' : 'Home')
  const text =
    lang === 'fr'
      ? `Bonjour GCG, je vous contacte depuis la page « ${page} » de votre site.`
      : `Hello GCG, I am contacting you from the “${page}” page of your website.`
  return whatsappLink(text.replace(/« /g, '« ').replace(/ »/g, ' »'))
}
