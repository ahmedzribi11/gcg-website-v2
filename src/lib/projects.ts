import { getCollection, type CollectionEntry } from 'astro:content'
import type { ImageMetadata } from 'astro'
import { enNumber, frNumber, type Lang } from '../i18n'
import { launchMode } from './env'

export type ProjectEntry = CollectionEntry<'projects'>

export interface Project {
  slug: string
  number: number
  name: string
  featured: boolean
  featuredOrder: number
  sector: ProjectEntry['data']['sector']
  city: ProjectEntry['data']['city']
  status?: ProjectEntry['data']['status']
  location: string
  period: string
  /** Première année mentionnée dans la période (historique). */
  year: number
  surface?: string
  terrain?: string
  coveredSurface?: string
  composition: string
  typologies?: { name: string; surface: string }[]
  typology?: string
  missions: string[]
  services: ProjectEntry['data']['services']
  types: ProjectEntry['data']['types']
  images: ProjectImageData[]
  seoTitle?: string
  seoDescription?: string
  /** La version de l’autre langue existe (EN relue ou page FR). */
  hasEn: boolean
}

export interface ProjectImageData {
  src: ImageMetadata
  alt: string
  kind: 'photo' | 'render' | 'plan'
  focus?: string
}

const num = (lang: Lang, s?: string) => (s ? (lang === 'en' ? enNumber(s) : frNumber(s)) : s)

export function localize(entry: ProjectEntry, lang: Lang): Project {
  const d = entry.data
  const en = lang === 'en'
  const period = en ? (d.period_en ?? d.period) : d.period
  const year = Number(/\d{4}/.exec(d.period)?.[0] ?? 0)
  return {
    slug: entry.id,
    number: d.number,
    name: en ? (d.name_en ?? d.name) : d.name,
    featured: d.featured,
    featuredOrder: d.featuredOrder ?? 99,
    sector: d.sector,
    city: d.city,
    status: d.status,
    location: en ? (d.location_en ?? d.location) : d.location,
    period,
    year,
    surface: num(lang, d.surface),
    terrain: num(lang, d.terrain),
    coveredSurface: num(lang, d.coveredSurface),
    composition: en ? d.composition_en! : d.composition,
    typologies: d.typologies?.map((t) => ({ name: t.name, surface: num(lang, t.surface)! })),
    typology: en ? (d.typology_en ?? d.typology) : d.typology,
    missions: en ? d.missions_en! : d.missions,
    services: d.services,
    types: d.types,
    images: d.images.map((im) => ({ src: im.src, alt: en ? im.alt_en : im.alt, kind: im.kind, focus: im.focus })),
    seoTitle: en ? d.seo_title_en : d.seo_title,
    seoDescription: en ? d.seo_description_en : d.seo_description,
    hasEn: d.en_status === 'valide',
  }
}

/** Publié : autorisation obtenue (ou non requise) en mode lancement ; version anglaise relue pour /en. */
export function isPublished(entry: ProjectEntry, lang: Lang) {
  if (launchMode && entry.data.permission === 'en-attente') return false
  return lang === 'fr' || entry.data.en_status === 'valide'
}

/** Tous les projets, triés par numéro du portfolio. */
export async function getProjects(lang: Lang): Promise<Project[]> {
  const entries = await getCollection('projects', (e) => isPublished(e, lang))
  return entries.map((e) => localize(e, lang)).sort((a, b) => a.number - b.number)
}

export async function getFeatured(lang: Lang): Promise<Project[]> {
  return (await getProjects(lang)).filter((p) => p.featured).sort((a, b) => a.featuredOrder - b.featuredOrder)
}

export const pad = (n: number) => String(n).padStart(2, '0')

/** Image d’illustration d’un service ([projet, index]). */
export function coverImage(projects: Project[], [slug, i]: [string, number]) {
  const p = requireProject(projects, slug)
  return p.images[Math.min(i, p.images.length - 1)]
}

/** Projet utilisé comme illustration : erreur explicite au build s’il n’est plus publié. */
export function requireProject(projects: Project[], slug: string): Project {
  const p = projects.find((x) => x.slug === slug)
  if (!p) throw new Error(`Le projet « ${slug} » sert d’illustration mais n’est pas publié (ou introuvable). Choisissez une autre illustration dans src/data.`)
  return p
}
