import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { particleFragment, particleVertex } from './shaders'

interface Props {
  count: number
  /** Positions cibles (structure). Les particules au-delà restent libres. */
  targets?: Float32Array
  /** Volume de flottaison [demi-largeur, demi-hauteur, centre Y, demi-profondeur]. */
  volume?: [number, number, number, number]
  size?: number
  read: () => { opacity: number; form: number; scatter: number }
}

export default function Particles({ count, targets, volume = [14, 7, 4, 10], size = 1, read }: Props) {
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const tgt = new Float32Array(count * 3)
    const seed = new Float32Array(count * 4)
    const formed = targets ? targets.length / 3 : 0
    const [hx, hy, cy, hz] = volume
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2 * hx
      pos[i * 3 + 1] = cy + (Math.random() - 0.5) * 2 * hy
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2 * hz
      const isFormed = i < formed
      if (isFormed && targets) {
        tgt[i * 3] = targets[i * 3]
        tgt[i * 3 + 1] = targets[i * 3 + 1]
        tgt[i * 3 + 2] = targets[i * 3 + 2]
      }
      // Délai lié à la hauteur : la structure se forme du bas vers le haut
      const h = isFormed && targets ? targets[i * 3 + 1] / 12 : 0
      seed[i * 4] = Math.min(1, h * 0.75 + Math.random() * 0.25)
      seed[i * 4 + 1] = Math.random()
      seed[i * 4 + 2] = isFormed ? 0 : 1
      seed[i * 4 + 3] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aTarget', new THREE.BufferAttribute(tgt, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, cy, 0), Math.max(hx, hy, hz) * 2)
    return g
  }, [count, targets, volume])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uForm: { value: 0 },
          uOpacity: { value: 0 },
          uScatter: { value: 0 },
          uPixelRatio: { value: dpr },
          uSize: { value: 6 * size },
          uBounds: { value: new THREE.Vector3(volume[0], volume[1], volume[2]) },
        },
      }),
    [dpr, size, volume],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    const s = read()
    const u = material.uniforms
    u.uTime.value += Math.min(delta, 0.05)
    u.uOpacity.value = s.opacity
    u.uForm.value = s.form
    u.uScatter.value = s.scatter
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
