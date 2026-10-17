import { getCollection } from 'astro:content'
import { projectPath, route, type Lang } from '../i18n'
import { getProjects } from './projects'
import registry from '../data/published-slugs.json'

/** Marquage de campagne des adresses de QR codes (ANA-03). */
export const utm = (medium: string, campaign: string) => `utm_source=qr&utm_medium=${medium}&utm_campaign=${campaign}`

/**
 * Projets ayant une adresse de QR code imprimé, avec la page où elle mène dans cette langue.
 * Un code imprimé ne doit jamais mener à une page introuvable : une adresse par fiche, publiée ou non, et par projet retiré.
 *   projet publié → sa page ; non publié (autorisation en attente, anglais non relu) → liste des réalisations (SHR-03) ;
 *   retiré (dans le registre src/data/published-slugs.json, fiche supprimée) → son ancienne adresse, que la redirection
 *   exigée par scripts/check-content.mjs envoie vers la bonne page.
 */
export async function qrProjects(lang: Lang): Promise<{ slug: string; to: string }[]> {
  const entries = (await getCollection('projects')).map((e) => e.id)
  const slugs = [...new Set([...entries, ...registry])].sort()
  const published = new Set((await getProjects(lang)).map((p) => p.slug))
  return slugs.map((slug) => {
    const page = published.has(slug) || !entries.includes(slug) ? projectPath(slug, lang) : route('projects', lang)
    return { slug, to: `${page}?${utm('panneau', 'projet')}` }
  })
}
