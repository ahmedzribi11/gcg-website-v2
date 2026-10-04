import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Architecture, SolidKind } from './architecture'
import { lineFragment, lineVertex } from './shaders'
import { heroState } from './state'

/** Injecte une coupe horizontale (construction du bas vers le haut) dans un matériau standard. */
function withBuildCut(material: THREE.MeshStandardMaterial, uniforms: { uCut: { value: number }; uOpacity: { value: number } }) {
  material.transparent = true
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCut = uniforms.uCut
    shader.uniforms.uOpacity = uniforms.uOpacity
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBuildPos;').replace(
      '#include <project_vertex>',
      `#include <project_vertex>
        vec4 bp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          bp = instanceMatrix * bp;
        #endif
        vBuildPos = (modelMatrix * bp).xyz;`,
    )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uCut;\nuniform float uOpacity;\nvarying vec3 vBuildPos;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vBuildPos.y > uCut) discard;')
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        float edgeGlow = smoothstep(0.35, 0.0, uCut - vBuildPos.y);
        gl_FragColor.rgb += vec3(1.0, 0.95, 0.88) * edgeGlow * 0.55;
        gl_FragColor.a *= uOpacity;`,
      )
  }
  return material
}

interface Props {
  arch: Architecture
}

const MAX_H = 12

export default function Structure({ arch }: Props) {
  const group = useRef<THREE.Group>(null)
  const uniforms = useMemo(() => ({ uCut: { value: -1 }, uOpacity: { value: 0 } }), [])
  const lineUniforms = useMemo(() => ({ uCut: { value: -1 }, uOpacity: { value: 0 } }), [])

  const { concrete, steel, boxGeo, lineGeo, lineMat, counts } = useMemo(() => {
    const concrete = withBuildCut(new THREE.MeshStandardMaterial({ color: '#8d8a84', roughness: 0.92, metalness: 0.05 }), uniforms)
    const steel = withBuildCut(new THREE.MeshStandardMaterial({ color: '#b9bcc0', roughness: 0.35, metalness: 0.85 }), uniforms)
    const boxGeo = new THREE.BoxGeometry(1, 1, 1)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(arch.edges, 3))
    const lineMat = new THREE.ShaderMaterial({
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      uniforms: lineUniforms,
      transparent: true,
      depthWrite: false,
    })
    const counts: Record<SolidKind, number> = { concrete: 0, steel: 0 }
    arch.solids.forEach((s) => counts[s.kind]++)
    return { concrete, steel, boxGeo, lineGeo, lineMat, counts }
  }, [arch, uniforms, lineUniforms])

  const concreteRef = useRef<THREE.InstancedMesh>(null)
  const steelRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    const idx: Record<SolidKind, number> = { concrete: 0, steel: 0 }
    arch.solids.forEach((s) => {
      const mesh = s.kind === 'concrete' ? concreteRef.current : steelRef.current
      if (!mesh) return
      q.setFromAxisAngle(up, s.rotY)
      m.compose(s.pos, q, s.size)
      mesh.setMatrixAt(idx[s.kind]++, m)
    })
    if (concreteRef.current) concreteRef.current.instanceMatrix.needsUpdate = true
    if (steelRef.current) steelRef.current.instanceMatrix.needsUpdate = true
  }, [arch])

  useEffect(
    () => () => {
      concrete.dispose()
      steel.dispose()
      boxGeo.dispose()
      lineGeo.dispose()
      lineMat.dispose()
    },
    [concrete, steel, boxGeo, lineGeo, lineMat],
  )

  useFrame((state, delta) => {
    const s = heroState
    // Plan technique : les arêtes se dessinent pendant la formation des particules
    lineUniforms.uCut.value = -0.5 + Math.min(1, s.form * 1.15) * (MAX_H + 1)
    lineUniforms.uOpacity.value = 0.32 * Math.min(1, s.form * 1.6) * (1 - s.scroll * 0.6)
    // Volumes : construction du bas vers le haut
    uniforms.uCut.value = -0.4 + s.solid * (arch.height + 1.2)
    uniforms.uOpacity.value = Math.min(1, s.solid * 2.2)

    if (group.current) {
      const t = state.clock.elapsedTime
      const target = -0.55 + s.dolly * 0.3 + s.scroll * 1.2 + t * 0.012 + s.pointerX * 0.06
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target, 2.2, delta)
    }
  })

  return (
    <group ref={group}>
      <instancedMesh ref={concreteRef} args={[boxGeo, concrete, counts.concrete]} castShadow={false} receiveShadow={false} />
      <instancedMesh ref={steelRef} args={[boxGeo, steel, counts.steel]} />
      <lineSegments geometry={lineGeo} material={lineMat} />
    </group>
  )
}
