/**
 * Decap CMS servi par le site lui-même (SEC-04) : /admin ne charge plus de code depuis un CDN, script-src 'self'
 * suffit, morceaux chargés à la demande compris. Lancé avant le build et le serveur de dev (package.json).
 *
 * Le paquet npm decap-cms, à la version exacte ci-dessous, est téléchargé par npm pack (registre et proxy
 * de npm, cache local), son empreinte est vérifiée, puis decap-cms.js, ses morceaux, ses fichiers wasm et sa
 * licence sont copiés dans public/admin/decap/ (non versionné). Pas de dépendance npm : decap-cms y entraînerait
 * 645 paquets dont le site n’exécute aucun.
 *
 * Mise à jour : changer VERSION et INTEGRITY (npm view decap-cms@<version> dist.integrity), puis vérifier /admin.
 *
 *   node scripts/copy-decap.mjs
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const VERSION = '3.16.3'
const INTEGRITY = 'sha512-hf+dPlCh7TJmWl8+6VRzHYOWhri5xgUknrZbDewaWe4s9B7xJ8PQugp2QHeSldMUKzav6+z0oIpwUYhUJDYtYw=='

const root = join(import.meta.dirname, '..')
const cache = join(root, 'node_modules', '.cache', 'decap-cms')
const tgz = join(cache, `decap-cms-${VERSION}.tgz`)
const to = join(root, 'public', 'admin', 'decap')
const sri = (file) => 'sha512-' + createHash('sha512').update(readFileSync(file)).digest('base64')

if (!existsSync(tgz) || sri(tgz) !== INTEGRITY) {
  mkdirSync(cache, { recursive: true })
  // npm de la commande en cours (npm run …), sinon celui du PATH
  const npm = process.env.npm_execpath ? [process.execPath, [process.env.npm_execpath]] : ['npm', []]
  execFileSync(npm[0], [...npm[1], 'pack', `decap-cms@${VERSION}`, '--pack-destination', cache, '--silent'], {
    stdio: ['ignore', 'ignore', 'inherit'],
    shell: !process.env.npm_execpath && process.platform === 'win32',
  })
}
if (sri(tgz) !== INTEGRITY) {
  rmSync(tgz, { force: true })
  console.error(`decap-cms ${VERSION} : empreinte différente de celle attendue, fichier refusé.`)
  process.exit(1)
}

const tmp = mkdtempSync(join(tmpdir(), 'decap-'))
execFileSync('tar', ['-xzf', tgz, '-C', tmp, 'package/dist'])
const from = join(tmp, 'package', 'dist')
// Seulement ce que charge decap-cms.js : lui-même, ses morceaux, ses fichiers wasm et sa licence (ni cartes .map, ni la variante cms.js)
const keep = (f) => /^(\d+\.)?decap-cms\.js$|\.wasm$|^decap-cms\.js\.LICENSE\.txt$/.test(f)
rmSync(to, { recursive: true, force: true })
mkdirSync(to, { recursive: true })
const files = readdirSync(from).filter(keep)
for (const f of files) copyFileSync(join(from, f), join(to, f))
rmSync(tmp, { recursive: true, force: true })
console.log(`Decap CMS ${VERSION} : ${files.length} fichiers copiés dans public/admin/decap/ (empreinte vérifiée)`)
