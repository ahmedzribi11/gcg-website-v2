/**
 * Connexion GitHub de l’espace de gestion (Decap CMS), indépendante de l’hébergeur.
 * Utilisée par api/auth.js + api/callback.js (Vercel) et functions/api/*.js (Cloudflare Pages).
 * Variables d’environnement : GITHUB_OAUTH_ID, GITHUB_OAUTH_SECRET
 * (OAuth App GitHub, callback : https://<domaine>/api/callback).
 */
const SCOPES = new Set(['repo', 'public_repo', 'repo,user', 'public_repo,user'])
const COOKIE = 'gcg_oauth_state'

/** Étape 1 : redirection vers GitHub avec un état anti-falsification (cookie HttpOnly). */
export function authStart(request, env) {
  if (!env.GITHUB_OAUTH_ID) return new Response('GITHUB_OAUTH_ID manquant dans les variables d’environnement.', { status: 500 })
  const url = new URL(request.url)
  const scope = SCOPES.has(url.searchParams.get('scope') ?? '') ? url.searchParams.get('scope') : 'repo'
  const state = crypto.randomUUID().replace(/-/g, '')
  const params = new URLSearchParams({ client_id: env.GITHUB_OAUTH_ID, redirect_uri: `${url.origin}/api/callback`, scope, state })
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `${COOKIE}=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  })
}

/** Étape 2 : échange du code contre un jeton, transmis uniquement à /admin du même domaine. */
export async function authCallback(request, env) {
  const url = new URL(request.url)
  const origin = url.origin
  const cookie = new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`).exec(request.headers.get('cookie') ?? '')?.[1]
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state || state !== cookie) return page(origin, 'error', { message: 'Session de connexion expirée ou invalide. Réessayez depuis /admin.' })
  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_OAUTH_ID, client_secret: env.GITHUB_OAUTH_SECRET, code, redirect_uri: `${origin}/api/callback` }),
    })
    const data = await r.json()
    if (!data.access_token) return page(origin, 'error', { message: data.error_description || data.error || 'Connexion GitHub refusée.' })
    return page(origin, 'success', { token: data.access_token, provider: 'github' })
  } catch {
    return page(origin, 'error', { message: 'GitHub injoignable. Réessayez dans un instant.' })
  }
}

function page(origin, status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`
  const js = (v) => JSON.stringify(v).replace(/</g, '\\u003c')
  const fallback = status === 'success' ? 'Connecté. Vous pouvez fermer cette fenêtre.' : content.message || 'Erreur'
  const html = `<!doctype html><meta charset="utf-8"><title>GCG — connexion</title><p style="font-family:sans-serif">Connexion en cours…</p>
<script>
(function () {
  var origin = ${js(origin)}
  var message = ${js(message)}
  if (!window.opener) { document.body.textContent = ${js(fallback)}; return }
  function receive(e) {
    if (e.origin !== origin) return
    window.removeEventListener('message', receive)
    window.opener.postMessage(message, origin)
  }
  window.addEventListener('message', receive)
  window.opener.postMessage('authorizing:github', origin)
})()
</script>`
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  })
}
