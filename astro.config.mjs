// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import typography from './integrations/typography.mjs'
import fontPreload from './integrations/font-preload.mjs'

/**
 * URL publique du site (balises canoniques, Open Graph, sitemap, QR codes).
 * Ordre : SITE_URL (domaine définitif, ex. https://www.gcg-ci.com) → domaine
 * de production Vercel (fourni automatiquement au build) → adresse de l’aperçu
 * Cloudflare Pages (branches autres que la production) → aucune (build local).
 * Sur un serveur de build (CI, Cloudflare Pages) sans aucune de ces adresses, le build
 * s’arrête : il publierait des aperçus de liens sans image, sans canonique ni sitemap (SHR-10, OPS-08).
 */
const cfPreview = process.env.CF_PAGES && process.env.CF_PAGES_BRANCH !== (process.env.PRODUCTION_BRANCH || 'main')
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
  (cfPreview && process.env.CF_PAGES_URL) ||
  undefined
if (!site && (process.env.CI || process.env.CF_PAGES))
  throw new Error('SITE_URL manquant : définissez SITE_URL=https://www.gcg-ci.com (sans barre finale) dans les variables de build de production.')

/**
 * Origine encodée dans les QR codes et les liens partagés (SHR-02) : le domaine définitif dès que SITE_URL
 * est renseigné, quel que soit l’hôte qui affiche la page ; sinon l’adresse de la page (src/scripts/qr.ts).
 */
const qrOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : ''

/** Mesure d’audience sans cookie (facultative) : origines à autoriser dans la CSP. */
const umami = process.env.PUBLIC_UMAMI_WEBSITE_ID ? new URL(process.env.PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js').origin : ''
const umamiApi = process.env.PUBLIC_UMAMI_WEBSITE_ID ? 'https://api-gateway.umami.dev' : ''

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    ...(site
      ? [
          // Pas d’option i18n : elle n’apparie que les adresses identiques après /en (6 sur 104) et annonce fr-CI,
          // quand les pages annoncent fr. Les équivalences de langue passent par les balises hreflang des pages (SEO-05).
          sitemap({
            filter: (page) =>
              !/\/(admin|partager\/affiche|en\/share\/poster|contact\/merci|contact\/erreur|en\/contact\/thanks|en\/contact\/error|qr|q)(\/|$)/.test(page),
          }),
        ]
      : []),
    typography(),
    fontPreload(),
  ],
  image: {
    responsiveStyles: false,
  },
  /**
   * Politique de sécurité du contenu (SEC-04) : scripts et styles autorisés par empreinte,
   * aucune source tierce hormis la vidéo (après clic) et la mesure d’audience si elle est activée.
   * L’en-tête frame-ancestors (non disponible en balise meta) est envoyé par l’hébergeur.
   */
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        `connect-src 'self'${umamiApi ? ' ' + umamiApi : ''}`,
        'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: { resources: ["'self'", ...(umami ? [umami] : [])] },
      styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }] },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    define: { 'import.meta.env.PUBLIC_QR_ORIGIN': JSON.stringify(qrOrigin) },
  },
})
