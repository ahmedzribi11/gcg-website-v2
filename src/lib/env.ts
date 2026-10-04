/**
 * Environnement de build. Seul le site de production est indexable :
 * les aperçus (Vercel preview, branches Cloudflare Pages) sont marqués noindex.
 */
const vercel = process.env.VERCEL_ENV
const cfBranch = process.env.CF_PAGES ? process.env.CF_PAGES_BRANCH : undefined

export const isPreview = vercel ? vercel !== 'production' : cfBranch ? cfBranch !== (process.env.PRODUCTION_BRANCH || 'main') : false

/** Identifiant Umami (mesure d’audience sans cookie), vide = pas de mesure. */
export const umamiId = process.env.PUBLIC_UMAMI_WEBSITE_ID || ''
export const umamiSrc = process.env.PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js'

/**
 * Mode lancement : n’affiche que les projets dont la publication est autorisée
 * (champ « permission »). À activer avant la mise en ligne publique (GCG_LAUNCH=1).
 */
export const launchMode = process.env.GCG_LAUNCH === '1'

/** Formulaire de contact actif : le service d’envoi d’e-mails est configuré (server/contact.js). */
export const contactFormEnabled = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO && process.env.CONTACT_FROM)

/** Chemin public d’une page (sans « .html » ni « /index », sans barre finale). */
export const pagePath = (pathname: string) =>
  pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '') || '/'
