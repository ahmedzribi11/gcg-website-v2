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
  /** Études ou conception seulement, sans travaux (CONT-12). */
  designOnly: boolean
  location: string
  period: string
  /** Première année mentionnée dans la période (historique). */
  year: number
  surface?: string
  terrain?: string
  coveredSurface?: string
  /** Durée du chantier et effectif au plus fort (COPY-04). */
  duration?: string
  workforce?: number
  composition: string
  /** Récit : le besoin, ce que GCG a fait, le résultat (COPY-04) ; seuls les paragraphes remplis. */
  story: { need?: string; work?: string; result?: string }
  typologies?: { name: string; surface: string }[]
  typology?: string
  missions: string[]
  services: ProjectEntry['data']['services']
  types: ProjectEntry['data']['types']
  images: ProjectImageData[]
  /** Chiffre clé affiché sur l’accueil (CODE-03). */
  highlight?: ProjectHighlight
  seoTitle?: string
  seoDescription?: string
  /** La version de l’autre langue existe (EN relue ou page FR). */
  hasEn: boolean
}

export interface ProjectHighlight {
  value: string
  unit: string
  note?: string
  /** Rang dans la grille « À toutes les échelles » ; absent : pas dans la grille. */
  scaleOrder?: number
  /** Rang dans le bandeau défilant ; absent : pas dans le bandeau. */
  marqueeOrder?: number
  /** Nom affiché dans le bandeau (par défaut : le nom du projet). */
  marqueeName: string
  /** Texte du bandeau (par défaut : valeur et unité). */
  marqueeFigure: string
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
  const raw = en ? (d.period_en ?? d.period) : d.period
  // Chantier en cours avec la seule année de démarrage : « Depuis 2023 », pour que l’année ne se lise pas comme une livraison (CONT-11)
  const period = d.status === 'execution' && /^\d{4}$/.test(raw) ? `${en ? 'Since' : 'Depuis'} ${raw}` : raw
  const year = Number(/\d{4}/.exec(d.period)?.[0] ?? 0)
  const name = en ? (d.name_en ?? d.name) : d.name
  return {
    slug: entry.id,
    number: d.number,
    name,
    featured: d.featured,
    featuredOrder: d.featuredOrder ?? 99,
    sector: d.sector,
    city: d.city,
    status: d.status,
    designOnly: d.designOnly,
    location: en ? (d.location_en ?? d.location) : d.location,
    period,
    year,
    surface: num(lang, d.surface),
    terrain: num(lang, d.terrain),
    coveredSurface: num(lang, d.coveredSurface),
    duration: en ? d.duration_en : d.duration,
    workforce: d.workforce,
    composition: en ? d.composition_en! : d.composition,
    story: {
      need: en ? d.story?.need_en : d.story?.need,
      work: en ? d.story?.work_en : d.story?.work,
      result: en ? d.story?.result_en : d.story?.result,
    },
    typologies: d.typologies?.map((t) => ({ name: t.name, surface: num(lang, t.surface)! })),
    typology: en ? (d.typology_en ?? d.typology) : d.typology,
    missions: en ? d.missions_en! : d.missions,
    services: d.services,
    types: d.types,
    images: d.images.map((im) => ({ src: im.src, alt: en ? im.alt_en : im.alt, kind: im.kind, focus: im.focus })),
    highlight: localizeHighlight(d.highlight, lang, name),
    seoTitle: en ? d.seo_title_en : d.seo_title,
    seoDescription: en ? d.seo_description_en : d.seo_description,
    hasEn: d.en_status === 'valide',
  }
}

function localizeHighlight(h: ProjectEntry['data']['highlight'], lang: Lang, name: string): ProjectHighlight | undefined {
  if (!h) return undefined
  const en = lang === 'en'
  const value = num(lang, h.value) ?? h.value
  const unit = en ? (h.unit_en ?? h.unit) : h.unit
  return {
    value,
    unit,
    note: en ? h.note_en : h.note,
    scaleOrder: h.scaleOrder,
    marqueeOrder: h.marqueeOrder,
    marqueeName: (en ? (h.marqueeName_en ?? h.marqueeName) : h.marqueeName) ?? name,
    marqueeFigure: (en ? h.marqueeFigure_en : h.marqueeFigure) ?? `${value} ${unit}`,
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

/** Projets publiés ayant un chiffre clé pour la grille (scaleOrder) ou le bandeau (marqueeOrder) de l’accueil, dans l’ordre choisi. */
export function highlights(projects: Project[], order: 'scaleOrder' | 'marqueeOrder') {
  return projects
    .flatMap((p) => {
      const rank = p.highlight?.[order]
      return p.highlight && rank ? [{ p, h: p.highlight, rank }] : []
    })
    .sort((a, b) => a.rank - b.rank || a.p.number - b.p.number)
}

export const pad = (n: number) => String(n).padStart(2, '0')

/** Fiches de tous les projets, publiés ou non : secteur, types et expertises servent à choisir une illustration de remplacement. */
type Catalogue = Pick<ProjectEntry['data'], 'number' | 'sector'> & { types?: string[]; services?: string[] }
const catalogue = import.meta.glob<Catalogue>('../content/projects/*.json', { eager: true, import: 'default' })
const facts = (slug: string): Catalogue | undefined => catalogue[`../content/projects/${slug}.json`]

const warned = new Set<string>()
const warnOnce = (msg: string) => {
  if (warned.has(msg)) return
  warned.add(msg)
  console.warn(`  avertissement : ${msg}`)
}

/**
 * Projet utilisé comme illustration (photo d’une section, d’une expertise, d’un public).
 * S’il n’est pas publié (autorisation en attente en mode lancement, version anglaise non relue, fiche supprimée),
 * le build ne s’arrête pas : on prend le projet publié suivant du même secteur, puis d’un même type,
 * puis d’une même expertise, puis le suivant tout court, et le build affiche un avertissement (OPS-02).
 * Renvoie undefined seulement si aucun projet n’est publié.
 */
export function illustration(projects: Project[], slug: string): Project | undefined {
  const found = projects.find((x) => x.slug === slug)
  if (found) return found
  const f = facts(slug)
  // Ordre « suivant » : numéros du portfolio après celui du projet manquant, puis retour au début
  const n = f?.number ?? 0
  const ordered = [...projects].sort((a, b) => ((a.number - n + 1000) % 1000) - ((b.number - n + 1000) % 1000))
  const shares = (list: readonly string[] | undefined, other: readonly string[]) => (list ?? []).some((x) => other.includes(x))
  const pick =
    ordered.find((p) => f && p.sector === f.sector) ??
    ordered.find((p) => shares(f?.types, p.types)) ??
    ordered.find((p) => shares(f?.services, p.services)) ??
    ordered[0]
  warnOnce(
    pick
      ? `le projet « ${slug} » sert d’illustration mais n’est pas publié : remplacé par « ${pick.slug} ». Choisissez une autre illustration dans src/data ou src/components si ce remplacement ne convient pas.`
      : `le projet « ${slug} » sert d’illustration mais aucun projet n’est publié : l’image est omise.`,
  )
  return pick
}

/**
 * Projets cités nommément (preuves, chiffres) : les projets non publiés sont retirés de la liste,
 * jamais remplacés, car le texte qui les accompagne leur est propre.
 */
export function publishedOnly(projects: Project[], slugs: string[]): Project[] {
  return slugs.flatMap((slug) => {
    const p = projects.find((x) => x.slug === slug)
    if (!p) warnOnce(`le projet « ${slug} » est cité sur le site mais n’est pas publié : il est retiré de la liste.`)
    return p ? [p] : []
  })
}

/**
 * Projet réceptionné montré en photo dans l’ouverture de l’accueil sur téléphone et dans l’aperçu de lien par
 * défaut (VIS-01, PERF-01, SHR-09) : Hôtel Calao Korhogo, seul projet au statut « réceptionné » aujourd’hui.
 */
export const SHOWCASE = 'hotel-calao-korhogo'

/**
 * Photo réelle (jamais une perspective ni un plan, UX-02) du projet vitrine, s’il est publié et réceptionné.
 * Projet cité nommément (la légende donne son nom) : pas de remplacement s’il manque, l’ouverture garde alors
 * son fond sans photo et les aperçus de liens l’image par défaut.
 */
export function showcasePhoto(projects: Project[]): { project: Project; image: ProjectImageData } | undefined {
  const [project] = publishedOnly(projects, [SHOWCASE])
  const image = project?.status === 'receptionne' ? project.images.find((im) => im.kind === 'photo') : undefined
  return project && image ? { project, image } : undefined
}

/** Image d’illustration ([projet, rang de la photo]) : expertise, section, public, avec remplacement si besoin. */
export function coverImage(projects: Project[], [slug, i]: [string, number]): ProjectImageData | undefined {
  const p = illustration(projects, slug)
  // Le rang de photo choisi vaut pour le projet prévu ; pour un remplaçant, sa première photo
  return p?.images[p.slug === slug ? Math.min(i, p.images.length - 1) : 0]
}
