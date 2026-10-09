/**
 * En-têtes de sécurité des réponses des fonctions (/api/*), mêmes valeurs que public/_headers et vercel.json.
 * Cloudflare Pages n’applique pas _headers aux réponses des Pages Functions (OPS-08) : les fonctions les posent elles-mêmes.
 */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  'X-Robots-Tag': 'noindex',
}

/** En-têtes d’une réponse de fonction : sécurité + en-têtes propres à la réponse. */
export const secure = (headers = {}) => ({ ...SECURITY_HEADERS, ...headers })
