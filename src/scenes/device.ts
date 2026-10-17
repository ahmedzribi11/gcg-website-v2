export type Tier = 'high' | 'medium' | 'low' | 'none'

export const prefersReducedMotion = (): boolean => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = (): boolean => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

/**
 * Seul appareil qui reçoit la scène 3D de l’accueil : un ordinateur à souris d’au moins 768 px de large.
 * Tout le reste est traité en téléphone (PERF-01 : écran tactile ou de moins de 768 px) : pas de 3D, rien de
 * la scène n’est téléchargé, et le hero montre une photo réelle d’un projet réceptionné (VIS-01).
 * La même requête choisit l’image du hero (Hero.astro, <source media>) et l’affiche (règle CSS du hero).
 */
export const DESKTOP_3D = '(min-width: 768px) and (hover: hover) and (pointer: fine)'

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    const ok = Boolean(gl)
    ;(gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

/** Détermine le niveau de rendu 3D adapté à l’appareil. */
export function detectTier(): Tier {
  if (typeof window === 'undefined' || !hasWebGL()) return 'none'
  const w = window.innerWidth
  const cores = navigator.hardwareConcurrency ?? 4
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  if (w < 768 || cores <= 4 || mem <= 4) return 'low'
  if (w < 1200 || cores <= 6) return 'medium'
  return 'high'
}

/** Densité de pixels maximale par niveau ; le minimum (0,75) est fixé par AdaptiveQuality dans HeroScene. */
export const TIER_CONFIG: Record<Exclude<Tier, 'none'>, { particles: number; maxDpr: number; fogLayers: number }> = {
  high: { particles: 9000, maxDpr: 1.75, fogLayers: 7 },
  medium: { particles: 5000, maxDpr: 1.5, fogLayers: 5 },
  low: { particles: 2200, maxDpr: 1.25, fogLayers: 3 },
}
