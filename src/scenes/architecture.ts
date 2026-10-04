import * as THREE from 'three'

/**
 * Générateur procédural de la structure architecturale du hero :
 * une tour de dalles béton décalées, poteaux acier, noyau vertical,
 * et des niveaux supérieurs « en cours » (ossature seule).
 */

export type SolidKind = 'concrete' | 'steel'

export interface BoxSpec {
  pos: THREE.Vector3
  size: THREE.Vector3
  rotY: number
  kind: SolidKind
}

export interface Architecture {
  solids: BoxSpec[]
  /** Paires de points (segments) pour le rendu « plan technique ». */
  edges: Float32Array
  height: number
}

const FLOORS = 11
const SOLID_FLOORS = 7
const H = 0.82
const W = 4.0
const D = 2.8

const tmp = new THREE.Vector3()

function boxCorners(b: BoxSpec): THREE.Vector3[] {
  const { x: sx, y: sy, z: sz } = b.size
  const c = Math.cos(b.rotY)
  const s = Math.sin(b.rotY)
  const out: THREE.Vector3[] = []
  for (const dy of [-0.5, 0.5])
    for (const [dx, dz] of [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.5],
      [-0.5, 0.5],
    ] as const) {
      const lx = dx * sx
      const lz = dz * sz
      out.push(new THREE.Vector3(b.pos.x + lx * c + lz * s, b.pos.y + dy * sy, b.pos.z - lx * s + lz * c))
    }
  return out
}

function pushBoxEdges(target: number[], b: BoxSpec) {
  const k = boxCorners(b)
  const pairs = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]
  for (const [a, z] of pairs) target.push(k[a].x, k[a].y, k[a].z, k[z].x, k[z].y, k[z].z)
}

function floorTransform(i: number) {
  return { rot: -0.18 + i * 0.045, ox: Math.sin(i * 0.75) * 0.38 }
}

function local(i: number, x: number, z: number, y: number) {
  const { rot, ox } = floorTransform(i)
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  return tmp.set(ox + x * c + z * s, y, -x * s + z * c).clone()
}

export function buildArchitecture(): Architecture {
  const solids: BoxSpec[] = []
  const edges: number[] = []

  // Socle
  const base: BoxSpec = { pos: new THREE.Vector3(0, -0.12, 0), size: new THREE.Vector3(W + 3.2, 0.24, D + 3.2), rotY: -0.18, kind: 'concrete' }
  solids.push(base)
  pushBoxEdges(edges, base)

  // Noyau vertical (béton)
  const coreH = FLOORS * H + 0.9
  const core: BoxSpec = { pos: new THREE.Vector3(-W / 2 + 0.55, coreH / 2, 0.15), size: new THREE.Vector3(1.0, coreH, 1.15), rotY: 0.04, kind: 'concrete' }
  solids.push(core)
  pushBoxEdges(edges, core)

  const colX = [-W / 2 + 0.22, 0, W / 2 - 0.22]
  const colZ = [-D / 2 + 0.22, D / 2 - 0.22]

  for (let i = 0; i < FLOORS; i++) {
    const { rot, ox } = floorTransform(i)
    const y = (i + 1) * H
    const cantilever = i % 3 === 1 ? 0.9 : 0
    const slab: BoxSpec = {
      pos: new THREE.Vector3(ox + cantilever * 0.5 * Math.cos(rot), y, -cantilever * 0.5 * Math.sin(rot)),
      size: new THREE.Vector3(W + cantilever, 0.13, D),
      rotY: rot,
      kind: 'concrete',
    }
    if (i < SOLID_FLOORS) solids.push(slab)
    pushBoxEdges(edges, slab)

    // Poteaux entre le niveau i et i+1 (ou socle → niveau 0)
    for (const cx of colX)
      for (const cz of colZ) {
        const bottom = local(i, cx, cz, y - H)
        const top = local(i, cx, cz, y)
        if (i < SOLID_FLOORS) {
          solids.push({
            pos: bottom.clone().add(top).multiplyScalar(0.5),
            size: new THREE.Vector3(0.09, H, 0.09),
            rotY: rot,
            kind: 'steel',
          })
        }
        edges.push(bottom.x, bottom.y, bottom.z, top.x, top.y, top.z)
      }

    // Niveaux supérieurs : poutres acier en porte-à-faux + contreventement
    if (i >= SOLID_FLOORS) {
      const a = local(i, -W / 2, -D / 2, y)
      const b = local(i, W / 2 + 1.4, -D / 2, y)
      const c = local(i, W / 2 + 1.4, D / 2, y)
      edges.push(a.x, a.y, a.z, b.x, b.y, b.z, b.x, b.y, b.z, c.x, c.y, c.z)
      const d0 = local(i, colX[0], colZ[1], y - H)
      const d1 = local(i, colX[1], colZ[1], y)
      const d2 = local(i, colX[2], colZ[1], y - H)
      edges.push(d0.x, d0.y, d0.z, d1.x, d1.y, d1.z, d1.x, d1.y, d1.z, d2.x, d2.y, d2.z)
    }
  }

  // Mât vertical fin (acier) au sommet
  const top = FLOORS * H
  edges.push(-W / 2 + 0.55, top, 0.15, -W / 2 + 0.55, top + 2.4, 0.15)

  return { solids, edges: new Float32Array(edges), height: top }
}

/** Échantillonne des points le long des segments, pondérés par leur longueur. */
export function sampleEdges(edges: Float32Array, count: number, jitter = 0.025): Float32Array {
  const segs = edges.length / 6
  const cum = new Float32Array(segs)
  let total = 0
  for (let i = 0; i < segs; i++) {
    const o = i * 6
    total += Math.hypot(edges[o + 3] - edges[o], edges[o + 4] - edges[o + 1], edges[o + 5] - edges[o + 2])
    cum[i] = total
  }
  const out = new Float32Array(count * 3)
  for (let n = 0; n < count; n++) {
    const r = Math.random() * total
    let lo = 0
    let hi = segs - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cum[mid] < r) lo = mid + 1
      else hi = mid
    }
    const o = lo * 6
    const t = Math.random()
    out[n * 3] = edges[o] + (edges[o + 3] - edges[o]) * t + (Math.random() - 0.5) * jitter
    out[n * 3 + 1] = edges[o + 1] + (edges[o + 4] - edges[o + 1]) * t + (Math.random() - 0.5) * jitter
    out[n * 3 + 2] = edges[o + 2] + (edges[o + 5] - edges[o + 2]) * t + (Math.random() - 0.5) * jitter
  }
  return out
}
