/**
 * Préchargement de la police d’accent (Instrument Serif italique) seulement sur les pages qui l’affichent (SLOP-21) :
 * Base.astro la précharge partout ; après le build, la balise est retirée des pages sans élément de classe
 * « serif » ou « font-serif ». Les autres pages ne téléchargent plus ses 22 Ko.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PRELOAD = /<link\b[^>]*rel="preload"[^>]*instrument-serif[^>]*>/g
const USES_SERIF = /\bclass="[^"]*\b(?:font-)?serif\b[^"]*"/

export function prunePreload(html) {
  return USES_SERIF.test(html) ? html : html.replace(PRELOAD, '')
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (e.name.endsWith('.html')) yield p
  }
}

export default function fontPreload() {
  return {
    name: 'gcg-font-preload',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let n = 0
        for await (const file of walk(fileURLToPath(dir))) {
          const html = await readFile(file, 'utf8')
          const out = prunePreload(html)
          if (out !== html) {
            await writeFile(file, out)
            n++
          }
        }
        logger.info(`police d’accent non préchargée sur ${n} pages qui ne l’affichent pas`)
      },
    },
  }
}
