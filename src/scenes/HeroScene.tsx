import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Structure from './Structure'
import Particles from './Particles'
import FogVolume from './FogVolume'
import Ground from './Ground'
import AdaptiveQuality from './AdaptiveQuality'
import { buildArchitecture, sampleEdges } from './architecture'
import { heroState } from './state'
import { TIER_CONFIG, type Tier } from './device'

const damp = THREE.MathUtils.damp

function CameraRig() {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(0, 4, 0))
  useFrame((_, delta) => {
    const s = heroState
    const aspect = size.width / size.height
    const portrait = aspect < 1
    // Recul adapté au cadrage (portrait : structure entière visible)
    const fit = portrait ? 1.55 : aspect < 1.4 ? 1.15 : 1
    const z = (32 - 9 * s.dolly) * fit - 10 * s.scroll
    const y = 2.6 + s.dolly * 1.4 + s.scroll * 3.4 + s.pointerY * 0.35
    const x = (portrait ? 0 : -2.4) + s.pointerX * 0.9
    camera.position.x = damp(camera.position.x, x, 2, delta)
    camera.position.y = damp(camera.position.y, y, 2, delta)
    camera.position.z = damp(camera.position.z, z, 2, delta)
    look.current.set(portrait ? 0 : -1.2, 4.3 + s.scroll * 1.8, 0)
    camera.lookAt(look.current)
  })
  return null
}

function Lights() {
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.PointLight>(null)
  const cursor = useRef<THREE.PointLight>(null)
  useFrame((_, delta) => {
    const s = heroState
    if (ambient.current) ambient.current.intensity = 0.25 * s.ambient
    if (key.current) key.current.intensity = 2.4 * s.ambient
    if (rim.current) rim.current.intensity = 60 * s.ambient
    if (cursor.current) {
      cursor.current.intensity = 14 * s.solid
      cursor.current.position.x = damp(cursor.current.position.x, s.pointerX * 7, 3, delta)
      cursor.current.position.y = damp(cursor.current.position.y, 4.5 + s.pointerY * 4, 3, delta)
    }
  })
  return (
    <>
      <ambientLight ref={ambient} intensity={0} color="#cfd2d6" />
      <directionalLight ref={key} position={[-8, 14, 9]} color="#fff4e6" intensity={0} />
      <pointLight ref={rim} position={[3, 9, -7]} color="#e6ecf2" distance={30} decay={2} intensity={0} />
      <pointLight ref={cursor} position={[0, 4.5, 5]} color="#ffffff" distance={14} decay={2} intensity={0} />
    </>
  )
}

interface Props {
  tier: Exclude<Tier, 'none'>
  active: boolean
  onFallback: () => void
}

export default function HeroScene({ tier, active, onFallback }: Props) {
  const cfg = TIER_CONFIG[tier]
  const [dpr, setDpr] = useState(cfg.maxDpr)
  const arch = useMemo(() => buildArchitecture(), [])
  const formed = Math.floor(cfg.particles * 0.68)
  const targets = useMemo(() => sampleEdges(arch.edges, formed), [arch, formed])

  const readParticles = () => ({ opacity: heroState.particles, form: heroState.form, scatter: heroState.scroll })
  const readFog = () => ({
    density: heroState.fog,
    scroll: heroState.scroll,
    pointerX: heroState.pointerX,
    pointerY: heroState.pointerY,
  })

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: tier !== 'low', powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 35, near: 0.1, far: 120, position: [-2.4, 2.6, 31] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#070c09')
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.fog = new THREE.Fog('#070c09', 14, 46)
      }}
      aria-hidden
    >
      <AdaptiveQuality dpr={dpr} min={0.75} max={cfg.maxDpr} setDpr={setDpr} onFallback={onFallback} />
      <CameraRig />
      <Lights />
      <Ground read={() => heroState.ambient * 0.14 * (1 - heroState.scroll * 0.5)} />
      <Structure arch={arch} />
      <Particles count={cfg.particles} targets={targets} volume={[15, 8, 4.5, 11]} read={readParticles} />
      <FogVolume layers={cfg.fogLayers} center={[0, 3.6, 0]} read={readFog} />
    </Canvas>
  )
}
