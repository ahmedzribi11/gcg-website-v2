/**
 * Contrôles dans un vrai navigateur (CI) : erreurs console et requêtes en échec (ENG-09),
 * accessibilité axe-core WCAG 2.2 AA sans violation grave ou critique (A11Y-01),
 * aucun débordement horizontal à 320 px et 1440 px (A11Y-05, UX-05),
 * politique de sécurité (CSP) réellement appliquée : aucune violation, aucun gestionnaire
 * d’événement en ligne (bloqué par la CSP) et boutons d’impression fonctionnels (SEC-04).
 *
 *   npx astro preview --port 4321 &  puis  node scripts/browser-checks.mjs
 * Dépendances (CI uniquement) : npm i --no-save playwright axe-core && npx playwright install chromium
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321'
const PAGES = [
  '/',
  '/en',
  '/realisations',
  '/en/projects',
  '/realisations/green-city',
  '/en/projects/villa-palmeras',
  '/expertises',
  '/en/services',
  '/expertises/architecture-et-conception',
  '/a-propos',
  '/en/about',
  '/investir',
  '/en/invest',
  '/contact',
  '/en/contact',
  '/partager',
  '/en/share',
  '/references',
  '/partager/affiche',
  '/mentions-legales',
  '/confidentialite',
  '/en/privacy',
  '/contact/merci',
  '/page-inexistante',
]
const problems = []
const browser = await chromium.launch()
for (const [mode, viewport] of [
  ['mobile', { width: 320, height: 720 }],
  ['desktop', { width: 1440, height: 900 }],
  ['clair', { width: 1440, height: 900 }],
]) {
  // Animations coupées (état final des apparitions GSAP) pour mesurer les contrastes réels
  // CSP active (pas de bypassCSP) : une ressource ou un script bloqué doit faire échouer le contrôle
  const ctx = await browser.newContext({ viewport, isMobile: mode === 'mobile', hasTouch: mode === 'mobile', reducedMotion: 'reduce' })
  await ctx.addInitScript(() => {
    const w = window
    w.__csp = []
    w.__printed = 0
    w.print = () => w.__printed++
    document.addEventListener('securitypolicyviolation', (e) => w.__csp.push(`${e.violatedDirective} ${e.blockedURI || ''}`.trim()))
  })
  // Mode clair : choix enregistré par le bouton soleil/lune
  if (mode === 'clair') await ctx.addInitScript(() => localStorage.setItem('gcg-theme', 'light'))
  const page = await ctx.newPage()
  for (const path of PAGES) {
    const errs = []
    const onConsole = (m) => m.type() === 'error' && !/status of 404/.test(m.text()) && errs.push(m.text().slice(0, 160))
    const onError = (e) => errs.push(`exception : ${e.message}`)
    const onResponse = (r) => r.status() >= 400 && r.url() !== BASE + path && errs.push(`HTTP ${r.status()} ${r.url()}`)
    page.on('console', onConsole)
    page.on('pageerror', onError)
    page.on('response', onResponse)
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.querySelectorAll('[data-reveal],[data-split]').forEach((e) => e.classList.add('is-in')))
    await page.waitForTimeout(1200) // fin des transitions
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    if (overflow > 0) errs.push(`débordement horizontal de ${overflow} px`)
    // Gestionnaires en ligne (onclick…) : interdits par la CSP, donc sans effet
    const inline = await page.evaluate(() =>
      [...document.querySelectorAll('*')].flatMap((el) =>
        [...el.attributes].filter((a) => /^on/i.test(a.name)).map((a) => `<${el.tagName.toLowerCase()} ${a.name}>`),
      ),
    )
    errs.push(...inline.map((h) => `gestionnaire en ligne bloqué par la CSP : ${h}`))
    // Boutons d’impression : un clic doit ouvrir la boîte d’impression
    for (const btn of await page.$$('[data-print]')) {
      const before = await page.evaluate(() => window.__printed)
      await btn.click()
      if ((await page.evaluate(() => window.__printed)) === before) errs.push('bouton d’impression sans effet')
    }
    errs.push(...(await page.evaluate(() => window.__csp)).map((v) => `violation CSP : ${v}`))
    // Injection par le protocole DevTools : non soumise à la CSP de la page
    await page.evaluate(axe)
    const violations = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })
      return r.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`)
    })
    errs.push(...violations.map((v) => `axe : ${v}`))
    for (const e of errs) problems.push(`${mode} ${path} : ${e}`)
    page.off('console', onConsole)
    page.off('pageerror', onError)
    page.off('response', onResponse)
  }
  await ctx.close()
}
await browser.close()

if (problems.length) {
  console.error(`${problems.length} problème(s) :`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exit(1)
}
console.log(
  `Contrôles navigateur réussis : ${PAGES.length} pages × 3 (mobile, ordinateur, mode clair), 0 erreur console, 0 violation axe grave, 0 débordement.`,
)
