import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const html = document.documentElement
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
export const touch = matchMedia('(hover: none), (pointer: coarse)').matches

/* ─── Défilement fluide (desktop) ─────────────────────────────────────── */
let lenis: Lenis | null = null
if (!reducedMotion && !touch) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}
;(window as unknown as { __lenis?: Lenis | null }).__lenis = lenis

export function scrollToEl(target: Element | number) {
  if (lenis) lenis.scrollTo(target as HTMLElement, { duration: 1.6, offset: typeof target === 'number' ? 0 : -80 })
  else if (typeof target === 'number') scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' })
  else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
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
const bar = document.getElementById('mobile-bar')
let lastY = scrollY
const onScroll = () => {
  const y = scrollY
  if (header) {
    header.toggleAttribute('data-scrolled', y > 40)
    const menuOpen = header.hasAttribute('data-menu')
    header.toggleAttribute('data-hidden', !menuOpen && y > 400 && y > lastY + 2)
    if (y < lastY - 2) header.removeAttribute('data-hidden')
  }
  bar?.setAttribute('data-visible', '') // barre mobile toujours visible
  lastY = y
}
addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* ─── Menu mobile ─────────────────────────────────────────────────────── */
const toggle = document.getElementById('menu-toggle')
const menu = document.getElementById('mobile-menu')
if (header && toggle && menu) {
  const links = () => menu.querySelectorAll<HTMLElement>('a')
  const setOpen = (open: boolean) => {
    header.toggleAttribute('data-menu', open)
    header.removeAttribute('data-hidden')
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

/* ─── Découpage des titres en mots ────────────────────────────────────── */
function splitWords(root: HTMLElement) {
  let i = 0
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent!.split(/(\s+)/)
      const frag = document.createDocumentFragment()
      for (const part of parts) {
        if (!part) continue
        if (/^\s+$/.test(part)) {
          frag.append(document.createTextNode(part))
          continue
        }
        const w = document.createElement('span')
        w.className = 'w'
        const inner = document.createElement('span')
        inner.textContent = part
        inner.style.setProperty('--i', String(i++))
        w.append(inner)
        frag.append(w)
      }
      node.parentNode!.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE && !(node as Element).classList.contains('w')) {
      Array.from(node.childNodes).forEach(walk)
    }
  }
  Array.from(root.childNodes).forEach(walk)
}
document.querySelectorAll<HTMLElement>('[data-split]').forEach(splitWords)

/* ─── Révélations, compteurs ──────────────────────────────────────────── */
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count)
  if (reducedMotion || Number.isNaN(target)) {
    el.textContent = String(target)
    return
  }
  const state = { v: 0 }
  gsap.to(state, {
    v: target,
    duration: 2,
    ease: 'power2.out',
    onUpdate: () => (el.textContent = String(Math.round(state.v))),
  })
}

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const el = e.target as HTMLElement
      el.classList.add('is-in')
      if (el.dataset.count !== undefined) countUp(el)
      io.unobserve(el)
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
)
document.querySelectorAll<HTMLElement>('[data-reveal], [data-split], [data-count]').forEach((el) => {
  if (reducedMotion) {
    el.classList.add('is-in')
    if (el.dataset.count !== undefined) el.textContent = el.dataset.count!
  } else {
    if (el.dataset.count !== undefined) el.textContent = '0'
    io.observe(el)
  }
})

/* ─── Parallaxe ───────────────────────────────────────────────────────── */
if (!reducedMotion) {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 10)
    gsap.fromTo(
      el,
      { yPercent: -amount },
      { yPercent: amount, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  })
}

/* ─── Curseur & boutons magnétiques (desktop) ─────────────────────────── */
const cursor = document.getElementById('cursor')
if (cursor && !touch && !reducedMotion) {
  cursor.classList.remove('hidden')
  html.classList.add('has-cursor')
  cursor.innerHTML =
    '<div data-ring class="fixed left-0 top-0"><div class="cursor-ring"><span>' +
    (document.body.dataset.lang === 'en' ? 'VIEW' : 'VOIR') +
    '</span></div></div><div data-dot class="fixed left-0 top-0"><div class="cursor-dot"></div></div>'
  const ring = cursor.querySelector<HTMLElement>('[data-ring]')!
  const dot = cursor.querySelector<HTMLElement>('[data-dot]')!
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' })
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' })
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })

  /*
   * Teinte du curseur selon le fond sous le pointeur : or sur fond sombre, vert foncé sur fond clair
   * (sections claires, mode clair, boutons or). Fond = premier ancêtre au fond opaque à 50 % ou plus ;
   * une photo, une vidéo ou la 3D comptent comme sombres (le curseur or y garde un léger contour).
   */
  const light = (c: string) => {
    const n = c.match(/-?[\d.]+%?/g)?.map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : +v))
    if (!n || n.length < 3) return null
    if ((n[3] ?? 1) < 0.5) return null
    if (/^ok(lab|lch)/.test(c)) return n[0] > 0.75
    if (/^(lab|lch)/.test(c)) return n[0] > 75
    const k = c.startsWith('color(') ? 1 : 255
    return (0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2]) / k > 0.6
  }
  const lightUnder = (el: Element | null) => {
    for (let n = el; n; n = n.parentElement) {
      if (n instanceof HTMLImageElement || n instanceof HTMLVideoElement || n instanceof HTMLCanvasElement) return false
      const l = light(getComputedStyle(n).backgroundColor.replace(/^color\(srgb/, 'color('))
      if (l !== null) return l
    }
    return false
  }
  let px = -1
  let py = -1
  let queued = false
  const retint = () => {
    queued = false
    if (px < 0) return
    cursor.dataset.tone = lightUnder(document.elementFromPoint(px, py)) ? 'dark' : ''
  }
  const queueTint = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(retint)
  }
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return
      cursor.style.opacity = '1'
      rx(e.clientX)
      ry(e.clientY)
      dx(e.clientX)
      dy(e.clientY)
      px = e.clientX
      py = e.clientY
      queueTint()
      const t = (e.target as Element | null)?.closest?.('[data-cursor], a, button, summary, input, select, textarea, label')
      cursor.dataset.mode = t?.getAttribute('data-cursor') === 'view' ? 'view' : t ? 'link' : ''
    },
    { passive: true },
  )
  // Le fond change sous un pointeur immobile : défilement, survol qui colore un bouton, bascule du thème
  addEventListener('scroll', queueTint, { passive: true })
  addEventListener('transitionend', queueTint, { passive: true })
  new MutationObserver(queueTint).observe(html, { attributes: true, attributeFilter: ['data-theme'] })
  document.documentElement.addEventListener('pointerleave', () => (cursor.style.opacity = '0'))

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3)
    })
    el.addEventListener('pointerleave', () => {
      xTo(0)
      yTo(0)
    })
  })
}

/* Recalcul après chargement des polices et images */
document.fonts?.ready.then(() => ScrollTrigger.refresh())
addEventListener('load', () => ScrollTrigger.refresh())

export { gsap, ScrollTrigger }

/* ─── Mode clair / sombre ─────────────────────────────────────────────── */
const themeBtn = document.getElementById('theme-toggle')
const applyThemeUi = () => {
  const light = document.documentElement.dataset.theme === 'light'
  const fr = document.documentElement.lang === 'fr'
  themeBtn?.setAttribute('aria-pressed', String(light))
  themeBtn?.setAttribute('aria-label', light ? (fr ? 'Mode sombre' : 'Dark mode') : fr ? 'Mode clair' : 'Light mode')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f0e6' : '#070c09')
}
themeBtn?.addEventListener('click', () => {
  const light = document.documentElement.dataset.theme !== 'light'
  if (light) document.documentElement.dataset.theme = 'light'
  else delete document.documentElement.dataset.theme
  try {
    localStorage.setItem('gcg-theme', light ? 'light' : 'dark')
  } catch {
    /* stockage indisponible : le choix vaut pour cette page */
  }
  applyThemeUi()
})
applyThemeUi()
