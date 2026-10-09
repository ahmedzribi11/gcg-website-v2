import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { heroState } from '../../scenes/state'
import { isTouch, type Tier } from '../../scenes/device'

gsap.registerPlugin(ScrollTrigger)

const HeroScene = lazy(() => import('../../scenes/HeroScene'))

/**
 * Scène 3D du hero : particules → plan → structure. Montée par le script du hero
 * (mount.tsx) une fois la page utilisable ; la page reste complète sans elle (repli CSS).
 */
export default function HeroIsland({ sectionId, tier: detected }: { sectionId: string; tier: Exclude<Tier, 'none'> }) {
  const [tier, setTier] = useState<Tier>(detected)
  const [active, setActive] = useState(true)
  const [shown, setShown] = useState(false)
  const timeline = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const section = document.getElementById(sectionId)
    const s = heroState
    Object.assign(s, { ambient: 0, particles: 0, fog: 0, form: 0, solid: 0, dolly: 0, scroll: 0 })

    const tl = gsap.timeline({ defaults: { ease: 'sine.inOut' }, delay: 0.2 })
    tl.to(s, { ambient: 0.4, duration: 1.4 }, 0)
      .to(s, { particles: 1, duration: 1.6 }, 0)
      .to(s, { fog: 1, duration: 2.4 }, 0.6)
      .to(s, { form: 1, duration: 2.8, ease: 'power2.inOut' }, 1.3)
      .to(s, { solid: 1, duration: 2.6, ease: 'power2.inOut' }, 2.6)
      .to(s, { ambient: 1, duration: 2 }, 2.8)
      .to(s, { dolly: 1, duration: 4, ease: 'power3.inOut' }, 2.8)
    tl.timeScale(isTouch() ? 1.35 : 1)
    timeline.current = tl

    const st = section
      ? ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => (s.scroll = self.progress),
        })
      : null

    const io = section ? new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '100px' }) : null
    if (section) io!.observe(section)

    const onPointer = (e: PointerEvent) => {
      s.pointerX = (e.clientX / innerWidth) * 2 - 1
      s.pointerY = -((e.clientY / innerHeight) * 2 - 1)
    }
    addEventListener('pointermove', onPointer, { passive: true })

    // Toute interaction accélère l’intro
    const speed = () => tl.isActive() && tl.timeScale(4)
    addEventListener('wheel', speed, { passive: true, once: true })
    addEventListener('touchstart', speed, { passive: true, once: true })
    addEventListener('keydown', speed, { once: true })

    return () => {
      tl.kill()
      st?.kill()
      io?.disconnect()
      removeEventListener('pointermove', onPointer)
    }
  }, [sectionId])

  if (tier === 'none') return null

  return (
    <div
      className="absolute inset-0 transition-opacity duration-[2000ms]"
      style={{ opacity: shown ? 1 : 0 }}
      ref={() => {
        if (!shown) requestAnimationFrame(() => setShown(true))
      }}
    >
      <Suspense fallback={null}>
        <HeroScene tier={tier} active={active} onFallback={() => setTier('none')} />
      </Suspense>
    </div>
  )
}
