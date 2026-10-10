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
  '/contact/erreur/envoi',
  '/en/contact/error/wait',
  '/page-inexistante',
]
const problems = []
const browser = await chromium.launch()
for (const [mode, viewport] of [
  ['mobile', { width: 320, height: 720 }],
  ['desktop', { width: 1440, height: 900 }],
  ['clair', { width: 1440, height: 900 }],
]) {
  // Animations coupées (état final des apparitions) pour mesurer les contrastes réels
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
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')))
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

/*
 * Mise en page aux largeurs intermédiaires et en paysage (MOB-01, MOB-02, DESK-02, BRW-02, BRW-06, MOB-03).
 * html coupe le débordement horizontal (overflow-x: clip) : scrollWidth ne voit pas un texte ou un bouton coupé
 * par le bord de l’écran. On mesure donc chaque texte et chaque contrôle par rapport à la largeur configurée
 * (l’émulation mobile élargit innerWidth jusqu’au contenu). Zones qui défilent et décor aria-hidden exclus.
 */
const LAYOUTS = [
  { id: '320', viewport: { width: 320, height: 568 }, mobile: true },
  { id: '768', viewport: { width: 768, height: 1024 } },
  { id: '900', viewport: { width: 900, height: 900 } },
  { id: '1024', viewport: { width: 1024, height: 768 } },
  { id: 'paysage-667', viewport: { width: 667, height: 375 }, mobile: true, landscape: true },
  { id: 'paysage-844', viewport: { width: 844, height: 390 }, mobile: true, landscape: true },
]
for (const { id, viewport, mobile = false, landscape = false } of LAYOUTS) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'load' })
    await page.waitForTimeout(150)
    const errs = await page.evaluate((W) => {
      const res = []
      // Zone qui défile horizontalement (tableaux des références) : le contenu reste atteignable
      const scroller = (el) => {
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (/auto|scroll/.test(getComputedStyle(a).overflowX)) return true
        return false
      }
      const skip = (el) => el.closest('[aria-hidden="true"],.sr-only,#mobile-menu,[hidden],.print-only,.no-scrollbar') || scroller(el)
      const shown = (el) => {
        const s = getComputedStyle(el)
        return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05
      }
      const out = (b) => b.width > 1 && (b.right > W + 1 || b.left < -1)
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent.trim()
        const el = n.parentElement
        if (!text || !el || skip(el) || !shown(el)) continue
        const r = document.createRange()
        r.selectNodeContents(n)
        const b = [...r.getClientRects()].find(out)
        if (b) res.push(`texte coupé « ${text.slice(0, 40)} » (x ${Math.round(b.left)} à ${Math.round(b.right)})`)
      }
      for (const el of document.querySelectorAll('a,button,input,select,textarea')) {
        if (skip(el) || !shown(el)) continue
        const b = el.getBoundingClientRect()
        if (out(b))
          res.push(
            `contrôle coupé « ${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)} » (x ${Math.round(b.left)} à ${Math.round(b.right)})`,
          )
      }
      const sw = document.documentElement.scrollWidth
      if (sw > W + 1) res.unshift(`mise en page de ${sw} px pour un écran de ${W} px`)
      // Projets à la une, en grille depuis SLOP-14 : chaque projet doit rester dans l’écran (DESK-01)
      for (const s of document.querySelectorAll('[data-slide]')) {
        const b = s.getBoundingClientRect()
        if (b.width && (b.left < -1 || b.right > W + 1)) res.push(`projet à la une hors de l’écran (x ${Math.round(b.left)} à ${Math.round(b.right)})`)
      }
      // Barre d’actions mobile : ne doit rien couvrir à l’ouverture de la page (MOB-03, BRW-06)
      const bar = document.getElementById('mobile-bar')
      if (bar && getComputedStyle(bar).display !== 'none') {
        const br = bar.getBoundingClientRect()
        if (br.top < innerHeight - 1) {
          const hit = [...document.querySelectorAll('main :is(a,button,h1,h2,p,li)')].find((el) => {
            if (skip(el) || !shown(el)) return false
            const b = el.getBoundingClientRect()
            return b.width > 0 && b.height > 0 && b.bottom > br.top + 1 && b.top < br.bottom - 1 && b.right > br.left && b.left < br.right
          })
          if (hit) res.push(`barre mobile sur « ${hit.textContent.trim().slice(0, 40)} » à l’ouverture`)
        }
      }
      return res
    }, viewport.width)
    // Menu plein écran en paysage : chaque lien doit pouvoir être amené à l’écran (BRW-02)
    if (landscape && (await page.locator('#menu-toggle').isVisible())) {
      await page.click('#menu-toggle')
      await page.waitForTimeout(400)
      const unreachable = await page.evaluate(() =>
        [...document.querySelectorAll('#mobile-menu a')]
          .filter((a) => {
            a.scrollIntoView({ block: 'nearest' })
            const b = a.getBoundingClientRect()
            return b.top < -1 || b.bottom > innerHeight + 1
          })
          .map((a) => a.textContent.trim().slice(0, 30)),
      )
      errs.push(...unreachable.map((l) => `menu : « ${l} » inatteignable`))
      await page.click('#menu-toggle')
    }
    for (const e of errs) problems.push(`${id} ${path} : ${e}`)
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
  `Contrôles navigateur réussis : ${PAGES.length} pages × 3 (mobile, ordinateur, mode clair), 0 erreur console, 0 violation axe grave, 0 débordement ; ${LAYOUTS.length} formats (320, 768, 900, 1024, paysage) sans contenu coupé.`,
)
