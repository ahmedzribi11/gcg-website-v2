import type { APIRoute, GetStaticPaths } from 'astro'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { getProjects, showcasePhoto, SHOWCASE } from '../../lib/projects'
import { ogSize } from '../../lib/seo'

/**
 * Aperçu de lien par défaut (SHR-09) : la photo réelle du projet vitrine réceptionné (Hôtel Calao Korhogo), au
 * rapport 1,91:1 sans agrandissement, le logo GCG en bas à gauche. Le sujet reste au centre : la vignette carrée
 * de WhatsApp le garde. Rien n’est produit si le projet n’est pas publié (mode lancement) ; Base.astro reprend alors
 * /og-image.jpg.
 */
export const getStaticPaths = (async () => {
  const showcase = showcasePhoto(await getProjects('fr'))
  if (!showcase) return []
  // Fichier source de la photo, lu dans la fiche (même rang que l’image retenue)
  const entry = JSON.parse(await readFile(resolve('src/content/projects', `${SHOWCASE}.json`), 'utf8')) as { images: { src: string }[] }
  const file = resolve('src/content/projects', entry.images[showcase.project.images.indexOf(showcase.image)].src)
  return [{ params: { name: 'accueil' }, props: { file, ...ogSize(showcase.image.src) } }]
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const { file, width, height } = props as { file: string; width: number; height: number }
  const logoWidth = Math.round(width * 0.24)
  const logo = await sharp(resolve('public/brand/gcg-logo-white.png')).resize({ width: logoWidth }).png().toBuffer()
  const logoHeight = (await sharp(logo).metadata()).height ?? 0
  const margin = Math.round(width * 0.035)
  // Dégradé sombre sous le logo, pour qu’il reste lisible sur une photo claire
  const shade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#070c09" stop-opacity="0"/><stop offset="1" stop-color="#070c09" stop-opacity="0.78"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  )
  const jpg = await sharp(await readFile(file))
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .composite([
      { input: shade, top: 0, left: 0 },
      { input: logo, top: height - margin - logoHeight, left: margin },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer()
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } })
}
