/**
 * Contrôles statiques du site construit (dist/) — exécutés en CI après le build (ENG-04).
 * SEO-01 titres et descriptions uniques, A11Y-03 un seul h1, SEO-04/05 canonique et hreflang réciproques,
 * I18N-03 bouton de langue vers une page existante, I18N-05 pas de français sur les pages anglaises,
 * EDIT-01 aucun texte de remplissage, A11Y-02 attribut alt sur toutes les images, liens internes valides,
 * SEO-02 sitemap identique aux pages indexables (ni brouillon, ni redirection, ni 404).
 *
 *   node scripts/audit-dist.mjs        (après npm run build ; avec SITE_URL pour tester hreflang/canonique)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = join(import.meta.dirname, '..', 'dist')
const SKIP = /^(admin|qr\/|qr\.html|404\.html|contact\/(merci|erreur)|en\/contact\/(thanks|error)|partager\/affiche|en\/share\/poster)/
const errors = []
const warnings = []

const pages = []
const walk = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith('.html') && pages.push(join(d, f))))
walk(DIST)

const urlOf = (file) =>
  '/' +
  relative(DIST, file)
    .replace(/\.html$/, '')
    .replace(/(^|\/)index$/, '')
const exists = (path) => {
  const p = decodeURIComponent(path.split(/[?#]/)[0]).replace(/\/$/, '') || '/'
  if (p === '/') return existsSync(join(DIST, 'index.html'))
  return existsSync(join(DIST, p + '.html')) || existsSync(join(DIST, p, 'index.html')) || (existsSync(join(DIST, p)) && statSync(join(DIST, p)).isFile())
}
const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')

const titles = new Map()
const descs = new Map()
// Noms propres qui restent en français sur les pages anglaises (charte rédactionnelle)
const PROPER_NAMES = /H[ôo]tel du Golf|Projet [ÉE]lan/gi
const FRENCH = /\b(le|la|les|des|du|une|pour|avec|nous|vous|votre|vos|est|sont|projets?|réalisations|découvrir|voir|depuis|chantier|études|tous|toutes)\b/gi
const PLACEHOLDER = /\b(lorem|ipsum|todo|tbd|xxx)\b|example\.(com|org)/i

for (const file of pages) {
  const rel = relative(DIST, file)
  if (SKIP.test(rel)) continue
  const html = readFileSync(file, 'utf8')
  const url = urlOf(file)
  const lang = /<html[^>]*lang="en"/.test(html) ? 'en' : 'fr'
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? ''
  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? ''
  if (!title) errors.push(`${url} : titre manquant`)
  if (title.length > 65) warnings.push(`${url} : titre de ${title.length} caractères (≈ 60 max) « ${title} »`)
  if (titles.has(title)) errors.push(`${url} : titre identique à ${titles.get(title)}`)
  titles.set(title, url)
  if (!desc) errors.push(`${url} : description manquante`)
  else if (descs.has(desc)) errors.push(`${url} : description identique à ${descs.get(desc)}`)
  descs.set(desc, url)

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length
  if (h1 !== 1) errors.push(`${url} : ${h1} titres h1`)

  for (const img of html.match(/<img\b[^>]*>/g) ?? []) if (!/\salt(=|\s|\/?>)/.test(img)) errors.push(`${url} : image sans attribut alt ${img.slice(0, 80)}`)

  const visible = text(html)
  if (PLACEHOLDER.test(visible)) errors.push(`${url} : texte de remplissage « ${PLACEHOLDER.exec(visible)?.[0]} »`)
  if (lang === 'en') {
    const hits = (visible.replace(PROPER_NAMES, ' ').match(FRENCH) ?? []).map((w) => w.toLowerCase())
    if (hits.length > 2) warnings.push(`${url} : mots français sur une page anglaise : ${[...new Set(hits)].join(', ')}`)
  }

  const sw = /<a[^>]*data-lang-switch[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*data-lang-switch/.exec(html)
  const target = sw?.[1] ?? sw?.[2]
  if (target && !exists(target)) errors.push(`${url} : le bouton de langue mène à ${target}, introuvable`)

  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1]
  if (canonical && new URL(canonical).pathname.replace(/\/$/, '') !== (url === '/' ? '' : url))
    errors.push(`${url} : canonique ${canonical} différente de la page`)
  for (const [, hl, href] of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) {
    if (hl === 'x-default') continue
    const path = new URL(href).pathname
    if (!exists(path)) {
      errors.push(`${url} : hreflang ${hl} vers ${path}, introuvable`)
      continue
    }
    const back = readFileSync(join(DIST, path === '/' ? 'index.html' : path.replace(/^\//, '') + '.html'), 'utf8')
    if (!back.includes(`href="${canonical}"`)) errors.push(`${url} : la page ${path} ne renvoie pas vers elle en hreflang`)
  }

  for (const [, href] of html.matchAll(/\shref="(\/[^"]*)"/g)) if (!href.startsWith('//') && !exists(href)) errors.push(`${url} : lien interne cassé ${href}`)
}

/* SEO-02 : le sitemap liste exactement les pages indexables */
const indexable = new Set()
let canonicalSeen = false
for (const file of pages) {
  const html = readFileSync(file, 'utf8')
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1]
  if (canonical) canonicalSeen = true
  if (canonical && !/<meta name="robots" content="[^"]*noindex/.test(html)) indexable.add(new URL(canonical).pathname.replace(/\/$/, '') || '/')
}
const maps = existsSync(DIST) ? readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f)) : []
if (!maps.length) {
  if (canonicalSeen) errors.push('sitemap absent alors que le site a des adresses canoniques (SITE_URL)')
} else {
  const listed = new Set(
    maps.flatMap((f) =>
      [...readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, u]) => new URL(u).pathname.replace(/\/$/, '') || '/'),
    ),
  )
  for (const u of listed) if (!indexable.has(u)) errors.push(`sitemap : ${u} n’est pas une page indexable (absente, redirigée ou noindex)`)
  for (const u of indexable) if (!listed.has(u)) errors.push(`sitemap : page indexable absente du sitemap ${u}`)
  if (!readFileSync(join(DIST, 'robots.txt'), 'utf8').includes('sitemap-index.xml')) errors.push('robots.txt ne mentionne pas le sitemap')
}

for (const w of warnings) console.warn(`  avertissement : ${w}`)
if (errors.length) {
  console.error(`\n${errors.length} erreur(s) :`)
  for (const e of [...new Set(errors)]) console.error(`  ✗ ${e}`)
  process.exit(1)
}
console.log(`Site vérifié : ${pages.length} fichiers HTML, ${warnings.length} avertissement(s), 0 erreur.`)
