// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import typography from './integrations/typography.mjs'

/**
 * URL publique du site (balises canoniques, Open Graph, sitemap, QR codes).
 * Ordre : SITE_URL (domaine définitif, ex. https://www.gcg-ci.com) → domaine
 * de production Vercel (fourni automatiquement au build) → aucune.
 */
const site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)

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
          sitemap({
            filter: (page) =>
              !/\/(admin|partager\/affiche|en\/share\/poster|contact\/merci|contact\/erreur|en\/contact\/thanks|en\/contact\/error|qr)(\/|$)/.test(page),
            i18n: { defaultLocale: 'fr', locales: { fr: 'fr-CI', en: 'en' } },
          }),
        ]
      : []),
    typography(),
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
  },
})
