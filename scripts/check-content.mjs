/**
 * Contrôle du contenu avant chaque build (MODEL-05/07/13, PERF-17, MEDIA-07/11, SEC-19, CMS-04).
 * Les photos HEIC/HEIF (iPhone) sont d’abord converties en JPG et la fiche du projet mise à jour.
 * Le build échoue avec un message en français si une règle bloquante n’est pas respectée ;
 * les avertissements n’arrêtent pas le build.
 *
 *   node scripts/check-content.mjs            contrôle
 *   node scripts/check-content.mjs --update   ajoute les nouveaux projets au registre des adresses publiées
 */
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import sharp from 'sharp'
import heicConvert from 'heic-convert'

const ROOT = resolve(import.meta.dirname, '..')
const PROJECTS = join(ROOT, 'src/content/projects')
const REGISTRY = join(ROOT, 'src/data/published-slugs.json')
const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
const MIN_WIDTH = 500
const HERO_WIDTH = 2400
const MAX_PDF = 10 * 1024 * 1024

/* ─── Photos iPhone (HEIC/HEIF) : conversion en JPG (CMS-04) ───────────── */
// Les navigateurs n’affichent pas le HEIC et l’optimiseur d’images ne le lit pas : la photo est convertie
// à côté de l’original, la fiche pointe vers le JPG ; les métadonnées (GPS) disparaissent à l’optimisation.
const HEIC = ['.heic', '.heif']
for (const file of readdirSync(PROJECTS).filter((f) => f.endsWith('.json'))) {
  const jsonPath = join(PROJECTS, file)
  let data
  try {
    data = JSON.parse(readFileSync(jsonPath, 'utf8'))
  } catch {
    continue // signalé plus bas
  }
  let changed = false
  for (const im of Array.isArray(data.images) ? data.images : []) {
    if (!im || typeof im.src !== 'string' || !HEIC.includes(extname(im.src).toLowerCase())) continue
    const from = resolve(PROJECTS, im.src)
    if (!existsSync(from)) continue // signalé plus bas
    const src = im.src.replace(/\.hei[cf]$/i, '.jpg')
    const to = resolve(PROJECTS, src)
    if (!existsSync(to)) writeFileSync(to, Buffer.from(await heicConvert({ buffer: readFileSync(from), format: 'JPEG', quality: 0.92 })))
    im.src = src
    changed = true
    warn(`${file} : photo HEIC convertie en JPG (${src.split('/').pop()}).`)
  }
  if (changed) writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
}

/* ─── Projets ─────────────────────────────────────────────────────────── */
const files = readdirSync(PROJECTS).filter((f) => f.endsWith('.json'))
const numbers = new Map()
const slugs = []
const untranslated = []
for (const file of files) {
  const slug = file.replace(/\.json$/, '')
  slugs.push(slug)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) err(`${file} : l’adresse « ${slug} » doit être en minuscules sans accents ni espaces (ex. villa-palmeras).`)
  let data
  try {
    data = JSON.parse(readFileSync(join(PROJECTS, file), 'utf8'))
  } catch (e) {
    err(`${file} : fichier JSON illisible (${e.message}).`)
    continue
  }
  if (data.en_status === 'a-traduire') untranslated.push(slug)
  if (numbers.has(data.number)) err(`${file} : le N° ${data.number} est déjà utilisé par ${numbers.get(data.number)}.`)
  else numbers.set(data.number, file)

  const images = Array.isArray(data.images) ? data.images : []
  if (!images.length) err(`${file} : au moins une photo est requise.`)
  if (images.length < 3) warn(`${file} : ${images.length} photo(s) ; 3 minimum recommandées (CONV-07).`)
  for (const [i, im] of images.entries()) {
    const src = typeof im === 'string' ? im : im?.src
    const where = `${file}, photo ${i + 1}`
    if (!src) {
      err(`${where} : chemin de l’image manquant.`)
      continue
    }
    if (typeof im === 'string' || !im.alt || !im.alt_en) err(`${where} : texte alternatif français et anglais requis.`)
    const path = resolve(PROJECTS, src)
    const ext = extname(path).toLowerCase()
    if (!SUPPORTED.includes(ext)) {
      err(`${where} : format « ${ext} » non pris en charge. Formats acceptés : JPG, PNG, WebP, AVIF ou HEIC (iPhone).`)
      continue
    }
    if (!existsSync(path)) {
      err(`${where} : fichier introuvable (${src}).`)
      continue
    }
    const meta = await sharp(path).metadata()
    if ((meta.width ?? 0) < MIN_WIDTH) err(`${where} : image trop petite (${meta.width} px de large, ${MIN_WIDTH} px minimum).`)
    if (i === 0 && (meta.width ?? 0) < HERO_WIDTH)
      warn(`${where} : utilisée en grand format, ${meta.width} px de large (${HERO_WIDTH} px recommandés, MEDIA-11).`)
    if (meta.exif && meta.exif.includes(Buffer.from('GPS')))
      warn(`${where} : l’original contient des métadonnées GPS (elles sont retirées des images publiées, mais restent dans le dépôt).`)
  }
}

/* ─── Adresses stables : un projet publié ne disparaît pas sans redirection ─── */
const registry = existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, 'utf8')) : []
const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'))
const redirected = new Set((vercel.redirects ?? []).map((r) => r.source))
for (const slug of registry) {
  if (slugs.includes(slug)) continue
  for (const path of [`/realisations/${slug}`, `/en/projects/${slug}`]) {
    if (!redirected.has(path))
      err(`Le projet « ${slug} » a été publié puis retiré : ajoutez une redirection 301 de ${path} (vercel.json et public/_redirects).`)
  }
}
const fresh = slugs.filter((s) => !registry.includes(s))
if (process.argv.includes('--update')) {
  writeFileSync(REGISTRY, JSON.stringify([...registry, ...fresh].sort(), null, 2) + '\n')
  if (fresh.length) console.log(`Registre mis à jour : ${fresh.join(', ')}`)
} else if (fresh.length) {
  warn(`Nouveaux projets à ajouter au registre des adresses publiées (npm run content:register) : ${fresh.join(', ')}`)
}

/* ─── Documents téléchargeables ───────────────────────────────────────── */
const settings = JSON.parse(readFileSync(join(ROOT, 'src/data/settings.json'), 'utf8'))
for (const [i, d] of (settings.documents ?? []).entries()) {
  const where = `Document ${i + 1} (${d.title || 'sans titre'})`
  if (!d.file) {
    err(`${where} : fichier manquant.`)
    continue
  }
  const path = join(ROOT, 'public', d.file)
  if (!existsSync(path)) err(`${where} : fichier introuvable (public${d.file}).`)
  else if (statSync(path).size > MAX_PDF)
    err(`${where} : ${(statSync(path).size / 1048576).toFixed(1)} Mo ; 10 Mo maximum (PERF-17). Compressez le PDF avant de le publier.`)
  if (extname(path).toLowerCase() !== '.pdf') err(`${where} : seuls les PDF sont acceptés.`)
  if (!['fr', 'en'].includes(d.lang)) err(`${where} : langue « fr » ou « en » requise.`)
  if (!/^\d{4}-\d{2}$/.test(d.date ?? '')) err(`${where} : date de version au format AAAA-MM requise.`)
}

/* ─── Fichiers téléversés depuis l’espace de gestion (SEC-19) ─────────── */
// Seuls des images et des PDF authentiques (vérifiés par leur signature, pas par leur extension)
// sont acceptés : un fichier HTML ou SVG renommé ne peut jamais être publié tel quel sur le domaine.
const MAX_UPLOAD = 20 * 1024 * 1024
const SIGNATURES = {
  '.jpg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.webp': (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
  '.avif': (b) => b.toString('latin1', 4, 8) === 'ftyp' && /avi[fs]/.test(b.toString('latin1', 8, 12)),
  '.pdf': (b) => b.toString('latin1', 0, 5) === '%PDF-',
  '.heic': (b) => b.toString('latin1', 4, 8) === 'ftyp' && /hei[cxms]|hev[cx]|mif1|msf1/.test(b.toString('latin1', 8, 12)),
  '.heif': (b) => b.toString('latin1', 4, 8) === 'ftyp' && /hei[cxms]|hev[cx]|mif1|msf1/.test(b.toString('latin1', 8, 12)),
}
const UPLOAD_DIRS = [
  ['src/assets/projects', [...SUPPORTED, ...HEIC]],
  ['public/uploads', SUPPORTED],
  ['public/documents', ['.pdf']],
]
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
for (const [dir, allowed] of UPLOAD_DIRS) {
  const abs = join(ROOT, dir)
  if (!existsSync(abs)) continue
  for (const path of walk(abs)) {
    const rel = relative(ROOT, path)
    const name = path.split(/[\\/]/).pop()
    if (name === '.gitkeep' || name === '.DS_Store') continue
    const ext = extname(path).toLowerCase()
    if (!allowed.includes(ext)) {
      err(`${rel} : type de fichier refusé (${ext || 'sans extension'}). Acceptés ici : ${allowed.join(', ')}.`)
      continue
    }
    const size = statSync(path).size
    if (size > (ext === '.pdf' ? MAX_PDF : MAX_UPLOAD)) err(`${rel} : ${(size / 1048576).toFixed(1)} Mo ; ${ext === '.pdf' ? 10 : 20} Mo maximum.`)
    const head = Buffer.alloc(16)
    const fd = openSync(path, 'r')
    readSync(fd, head, 0, 16, 0)
    closeSync(fd)
    if (!SIGNATURES[ext](head)) err(`${rel} : le contenu ne correspond pas à un fichier ${ext} (fichier renommé ou endommagé).`)
  }
}

/* ─── Rapport ─────────────────────────────────────────────────────────── */
// Projets sans version anglaise publiée (MODEL-09) : leur page anglaise n’existe pas encore
if (untranslated.length) console.log(`À traduire (page anglaise non publiée) : ${untranslated.join(', ')}`)
for (const w of warnings) console.warn(`  avertissement : ${w}`)
if (errors.length) {
  console.error(`\n${errors.length} erreur(s) bloquante(s) dans le contenu :`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}
console.log(`Contenu vérifié : ${files.length} projets, ${warnings.length} avertissement(s), 0 erreur.`)
