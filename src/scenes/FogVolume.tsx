import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fogFragment, fogVertex } from './shaders'

interface Props {
  layers: number
  center?: [number, number, number]
  spread?: number
  read: () => { density: number; scroll: number; pointerX: number; pointerY: number }
}

/** Brouillard « volumétrique » : plans superposés à bruit fractal animé. */
export default function FogVolume({ layers, center = [0, 4, 0], spread = 12, read }: Props) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(30, 16, 1, 1), [])

  const materials = useMemo(
    () =>
      Array.from(
        { length: layers },
        (_, i) =>
          new THREE.ShaderMaterial({
            vertexShader: fogVertex,
            fragmentShader: fogFragment,
            transparent: true,
            depthWrite: false,
            uniforms: {
              uTime: { value: i * 13.7 },
              uDensity: { value: 0 },
              uSeed: { value: i * 3.17 },
              uScroll: { value: 0 },
              uPointer: { value: new THREE.Vector2(0.5, 0.5) },
              uColor: { value: new THREE.Color(i % 2 ? '#d6d6c2' : '#aeb7a2') },
            },
          }),
      ),
    [layers],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    },
    [geometry, materials],
  )

  useFrame((_, delta) => {
    const s = read()
    const dt = Math.min(delta, 0.05)
    materials.forEach((m, i) => {
      const u = m.uniforms
      u.uTime.value += dt * (1 + i * 0.15)
      u.uDensity.value = s.density * (0.55 - i * 0.03)
      u.uScroll.value = s.scroll * (1 + i * 0.2)
      ;(u.uPointer.value as THREE.Vector2).set(0.5 + s.pointerX * 0.32, 0.5 + s.pointerY * 0.3)
    })
  })

  return (
    <group position={center}>
      {materials.map((m, i) => {
        const t = layers === 1 ? 0.5 : i / (layers - 1)
        return (
          <mesh
            key={i}
            geometry={geometry}
            material={m}
            position={[(i % 2 ? 1 : -1) * 1.2 * t, (t - 0.5) * 1.6, (t - 0.5) * spread]}
            scale={1 + t * 0.4}
            renderOrder={-1 + i}
          />
        )
      })}
    </group>
  )
}
