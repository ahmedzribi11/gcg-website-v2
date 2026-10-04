export type Tier = 'high' | 'medium' | 'low' | 'none'

export const prefersReducedMotion = (): boolean => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = (): boolean => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

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

export const TIER_CONFIG: Record<Exclude<Tier, 'none'>, { particles: number; dpr: [number, number]; fogLayers: number }> = {
  high: { particles: 9000, dpr: [1, 1.75], fogLayers: 7 },
  medium: { particles: 5000, dpr: [1, 1.5], fogLayers: 5 },
  low: { particles: 2200, dpr: [1, 1.25], fogLayers: 3 },
}
