/**
 * État partagé entre la timeline GSAP (DOM) et la scène WebGL.
 * Objet mutable lu dans useFrame : aucune re-render React pendant l’animation.
 */
export const heroState = {
  ambient: 0, // 0 → 1 lumière ambiante
  particles: 0, // 0 → 1 opacité des particules
  fog: 0, // 0 → 1 densité du brouillard
  form: 0, // 0 → 1 particules → structure
  solid: 0, // 0 → 1 apparition des volumes
  dolly: 0, // 0 → 1 avance caméra (intro)
  scroll: 0, // 0 → 1 progression du scroll dans le hero
  pointerX: 0,
  pointerY: 0,
}
