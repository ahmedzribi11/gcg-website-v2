/**
 * Exporte, à partir du contenu du site, les deux registres à faire valider par GCG :
 * - docs/fiche-de-faits.csv     : faits de chaque projet (GOV-01, EDIT-07)
 * - docs/registre-des-droits.csv: une ligne par image publiée (MEDIA-01 à MEDIA-09)
 * Format : CSV séparé par des points-virgules, UTF-8 avec BOM (ouverture directe dans Excel).
 * Les colonnes remplies à la main (validation, droits, crédits) sont reprises du fichier existant.
 *   node scripts/export-registers.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const DIR = join(ROOT, 'src/content/projects')
const flags = JSON.parse(readFileSync(join(ROOT, 'docs/.image-flags.json'), 'utf8'))
const cell = (v) => {
  const s = Array.isArray(v) ? v.join(' | ') : String(v ?? '')
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csv = (rows) => '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n') + '\r\n'

/** Lit un registre existant : Map clé → { colonne: valeur } (guillemets et retours à la ligne gérés). */
function previous(path, keyColumn) {
  if (!existsSync(path)) return new Map()
  const text = readFileSync(path, 'utf8').replace(/^\ufeff/, '')
  const rows = [[]]
  let cur = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') quoted = false
      else cur += c
    } else if (c === '"') quoted = true
    else if (c === ';') {
      rows.at(-1).push(cur)
      cur = ''
    } else if (c === '\n') {
      rows.at(-1).push(cur.replace(/\r$/, ''))
      cur = ''
      rows.push([])
    } else cur += c
  }
  const [head, ...body] = rows.filter((r) => r.length > 1)
  return new Map(body.map((r) => [r[head.indexOf(keyColumn)], Object.fromEntries(head.map((h, i) => [h, r[i] ?? '']))]))
}
/** Valeur saisie à la main si elle existe, sinon valeur par défaut. */
const keep = (old, column, fallback) => (old?.[column] ? old[column] : fallback)

const projects = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ slug: f.slice(0, -5), ...JSON.parse(readFileSync(join(DIR, f), 'utf8')) }))
  .sort((a, b) => a.number - b.number)

const facts = [
  [
    'N°',
    'Projet',
    'Adresse web',
    'Secteur',
    'Ville',
    'Lieu affiché',
    'Période',
    'Statut',
    'Surface',
    'Terrain',
    'Surface couverte',
    'Résumé',
    'Missions GCG',
    'Typologies',
    'Autorisation client',
    'Validé par GCG (oui / correction)',
  ],
]
const oldFacts = previous(join(ROOT, 'docs/fiche-de-faits.csv'), 'Adresse web')
for (const p of projects) {
  const old = oldFacts.get(`/realisations/${p.slug}`)
  facts.push([
    p.number,
    p.name,
    `/realisations/${p.slug}`,
    p.sector,
    p.city,
    p.location,
    p.period,
    p.status ?? 'à confirmer',
    p.surface ?? '',
    p.terrain ?? '',
    p.coveredSurface ?? '',
    p.composition,
    p.missions,
    (p.typologies ?? []).map((t) => `${t.name} ${t.surface}`),
    p.permission,
    keep(old, facts[0][15], ''),
  ])
}
writeFileSync(join(ROOT, 'docs/fiche-de-faits.csv'), csv(facts))

const rights = [
  [
    'Projet',
    'Fichier',
    'Nature',
    'Description',
    'Source',
    'Auteur / détenteur des droits',
    'Licence ou autorisation (preuve)',
    'Architecte (si tiers) et autorisation',
    'Autorisation client final',
    'Points à vérifier',
    'Crédit à afficher',
  ],
]
const oldRights = previous(join(ROOT, 'docs/registre-des-droits.csv'), 'Fichier')
for (const p of projects) {
  for (const im of p.images) {
    const file = basename(im.src)
    const path = `src/assets/projects/${p.slug}/${file}`
    const f = flags[`${p.slug}/${file}`] ?? []
    const old = oldRights.get(path)
    const [, , , , source, author, licence, architect, , , credit] = rights[0]
    rights.push([
      p.name,
      path,
      { photo: 'Photo', render: 'Perspective 3D', plan: 'Plan' }[im.kind] ?? im.kind,
      im.alt,
      keep(old, source, 'Portfolio GCG_CI.pdf (extrait)'),
      keep(old, author, 'à confirmer'),
      keep(old, licence, 'à fournir'),
      keep(old, architect, 'à confirmer'),
      p.permission,
      f.join(', '),
      keep(old, credit, ''),
    ])
  }
}
writeFileSync(join(ROOT, 'docs/registre-des-droits.csv'), csv(rights))
console.log(`fiche-de-faits.csv : ${projects.length} projets ; registre-des-droits.csv : ${rights.length - 1} images`)
