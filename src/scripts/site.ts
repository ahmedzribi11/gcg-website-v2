const html = document.documentElement
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

/* Défilement natif du navigateur (molette, clavier, ancres) : plus de défilement fluide simulé (SLOP-12) */
export function scrollToEl(target: Element | number) {
  if (typeof target === 'number') scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' })
  else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
}

export function lockScroll(locked: boolean) {
  html.style.overflow = locked ? 'hidden' : ''
}

document.addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
  if (!a) return
  const id = a.getAttribute('href')!.slice(1)
  const el = id ? document.getElementById(id) : null
  if (!el) return
  e.preventDefault()
  scrollToEl(el)
})

/* ─── En-tête, barre mobile ───────────────────────────────────────────── */
const header = document.getElementById('site-header')
let lastY = scrollY
const onScroll = () => {
  const y = scrollY
  if (header) {
    header.toggleAttribute('data-scrolled', y > 40)
    const menuOpen = header.hasAttribute('data-menu')
    header.toggleAttribute('data-hidden', !menuOpen && y > 400 && y > lastY + 2)
    if (y < lastY - 2) header.removeAttribute('data-hidden')
    // Pour la barre de filtres collante (global.css), sans :has() (BRW-13)
    document.body.classList.toggle('header-hidden', header.hasAttribute('data-hidden'))
  }
  lastY = y
}
addEventListener('scroll', onScroll, { passive: true })
onScroll()

/*
 * Barre mobile : affichée une fois sortis de l’écran les boutons de l’ouverture (accueil, data-bar-after)
 * ou l’en-tête de la page, ou après un écran de défilement, pour ne pas couvrir le premier écran (MOB-03).
 * Recalculée à chaque défilement : un observateur d’intersection ne voit pas un saut direct du bas vers le haut.
 */
const bar = document.getElementById('mobile-bar')
const barAfter = document.querySelector('[data-bar-after]') ?? document.querySelector('main :is(header, section)')
const onScrollBar = () => bar?.toggleAttribute('data-visible', !barAfter || scrollY > innerHeight || barAfter.getBoundingClientRect().bottom < 0)
addEventListener('scroll', onScrollBar, { passive: true })
onScrollBar()

/* ─── Menu mobile ─────────────────────────────────────────────────────── */
const toggle = document.getElementById('menu-toggle')
const menu = document.getElementById('mobile-menu')
if (header && toggle && menu) {
  const links = () => menu.querySelectorAll<HTMLElement>('a, button')
  /*
   * Menu ouvert : le reste de la page (lien d’évitement, main, pied de page, barre mobile…) devient inerte,
   * la tabulation reste dans l’en-tête et le menu, et les lecteurs d’écran ne lisent plus la page cachée (A11Y-01).
   * Pas de role="dialog" aria-modal sur le menu : le bouton Fermer est dans l’en-tête, il serait masqué.
   */
  const behind = () => Array.from(document.body.children).filter((el) => el !== header && el !== menu && el.tagName !== 'SCRIPT')
  const setOpen = (open: boolean) => {
    behind().forEach((el) => el.toggleAttribute('inert', open))
    header.toggleAttribute('data-menu', open)
    header.removeAttribute('data-hidden')
    document.body.classList.remove('header-hidden')
    toggle.setAttribute('aria-expanded', String(open))
    menu.setAttribute('aria-hidden', String(!open))
    toggle.querySelector('[data-label-open]')?.toggleAttribute('hidden', open)
    toggle.querySelector('[data-label-close]')?.toggleAttribute('hidden', !open)
    links().forEach((l) => (l.tabIndex = open ? 0 : -1))
    lockScroll(open)
    if (open) links()[0]?.focus()
  }
  toggle.addEventListener('click', () => setOpen(!header.hasAttribute('data-menu')))
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.hasAttribute('data-menu')) {
      setOpen(false)
      toggle.focus()
    }
  })
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false)
  })
}

/* ─── Impression (pas de onclick en ligne : bloqué par la CSP) ────────── */
document.querySelectorAll('[data-print]').forEach((b) => b.addEventListener('click', () => print()))

/* ─── Apparition au défilement ───────────────────────────────────────── */
/*
 * Un seul fondu (global.css), pour les images et les cartes [data-reveal] situées sous le premier écran au
 * chargement. Celles déjà à l’écran ne sont jamais masquées (PERF-03) ; pas de découpage des titres en mots,
 * qui cassait les espaces insécables (CONT-07), pas de compteurs ni de parallaxe (SLOP-13).
 */
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      e.target.classList.add('is-in')
      io.unobserve(e.target)
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
)
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
  if (reducedMotion || el.getBoundingClientRect().top < innerHeight) return el.classList.add('is-in')
  el.classList.add('reveal-wait')
  io.observe(el)
})

/* ─── Mode clair / sombre ─────────────────────────────────────────────── */
// Deux boutons : dans l’en-tête (tablette, ordinateur) et dans le menu plein écran (téléphone)
const themeBtns = document.querySelectorAll<HTMLElement>('[data-theme-toggle]')
const applyThemeUi = () => {
  const light = document.documentElement.dataset.theme === 'light'
  // Bouton de l’en-tête : libellé fixe « Mode clair », l’état est porté par aria-pressed (A11Y-02)
  document.getElementById('theme-toggle')?.setAttribute('aria-pressed', String(light))
}
const toggleTheme = () => {
  const light = document.documentElement.dataset.theme !== 'light'
  if (light) document.documentElement.dataset.theme = 'light'
  else delete document.documentElement.dataset.theme
  try {
    localStorage.setItem('gcg-theme', light ? 'light' : 'dark')
  } catch {
    /* stockage indisponible : le choix vaut pour cette page */
  }
  applyThemeUi()
}
// Sans color-mix() (iOS 16.0–16.1), le mode clair serait illisible : pas de bouton (même test que Base.astro, BRW-11)
if (CSS.supports('color', 'color-mix(in srgb, red, red)')) themeBtns.forEach((b) => b.addEventListener('click', toggleTheme))
else themeBtns.forEach((b) => b.remove())
applyThemeUi()

// Fin du script principal : le minuteur de Base.astro ne retire plus la classe js (CODE-01)
;(window as unknown as { __gcgReady?: boolean }).__gcgReady = true
