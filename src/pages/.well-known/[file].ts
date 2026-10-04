import type { APIRoute } from 'astro'
import { contact } from '../../lib/settings'

/** /.well-known/security.txt (RFC 9116), publié dès qu’une adresse e-mail de contact est renseignée. */
export function getStaticPaths() {
  return contact.email ? [{ params: { file: 'security.txt' } }] : []
}

export const GET: APIRoute = ({ site }) => {
  const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, '.000Z')
  const lines = [`Contact: mailto:${contact.email}`, `Expires: ${expires}`, 'Preferred-Languages: fr, en']
  if (site) lines.push(`Canonical: ${new URL('/.well-known/security.txt', site).href}`)
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
