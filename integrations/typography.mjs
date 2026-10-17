/**
 * Typographie française appliquée à toutes les pages construites (EDIT-04, I18N-07) :
 * - espace insécable avant « : » et espace fine insécable avant ; ! ? et à l’intérieur des guillemets « » ;
 * - apostrophe typographique ’ ; espace fine insécable entre milliers ; insécable avant les unités et après N° ;
 * - dans le texte, l’espace manquante est ajoutée (« Statut: » → « Statut : », « Pourquoi? » → « Pourquoi ? ») (CONT-08).
 * Seuls le texte visible et les attributs lisibles (alt, title, aria-label, placeholder, content) sont modifiés ;
 * scripts, styles et zones de saisie sont laissés intacts. L’apostrophe est aussi corrigée sur les pages anglaises.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const NBSP = '\u00a0'
const NNBSP = '\u202f'

function fr(text) {
  return text
    .replace(/(\p{L})'(?=\p{L})/gu, '$1’')
    .replace(/[ \u00a0\u202f]+:(?=\s|$|<)/g, `${NBSP}:`)
    .replace(/[ \u00a0\u202f]+([;!?])/g, `${NNBSP}$1`)
    .replace(/«[ \u00a0\u202f]*/g, `«${NBSP}`)
    .replace(/[ \u00a0\u202f]*»/g, `${NBSP}»`)
    .replace(/(\d)[ \u00a0](?=\d{3}(?!\d))/g, `$1${NNBSP}`)
    .replace(/(\d)[ ](?=(m²|hectares?|ha|km|m|kVA|kW|t|FCFA|%)(?![\p{L}\d]))/gu, `$1${NBSP}`)
    .replace(/N° /g, `N°${NBSP}`)
}
/**
 * Texte visible seulement : espace ajoutée quand elle manque avant « : » (après une lettre, « » » ou « ) ») ou avant
 * « ; ! ? » (après une lettre, un chiffre, « » » ou « ) »), la ponctuation étant suivie d’un blanc ou de la fin du texte. Les heures (17:30), les adresses (https://, ?q=) et
 * les entités HTML (&amp;) ne sont pas touchées (CONT-08).
 */
function frText(text) {
  return fr(text)
    .replace(/(?<=[\p{L}»)])(?<!&#?[\da-z]+):(?=\s|$)/giu, `${NBSP}:`)
    .replace(/(?<=[\p{L}\d»)])(?<!&#?[\da-z]+)([;!?])(?=\s|$)/giu, `${NNBSP}$1`)
}
function en(text) {
  return text.replace(/(\p{L})'(?=\p{L})/gu, '$1’')
}

const ATTRS = /(\s(?:alt|title|aria-label|placeholder|content|data-copied|data-title)=")([^"]*)(")/g
const SKIP = /^<(script|style|textarea|pre|code)\b/i

export function typeset(html, lang) {
  const fix = lang === 'fr' ? fr : en
  const fixText = lang === 'fr' ? frText : en
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<textarea[\s\S]*?<\/textarea>|<[^>]+>)/i)
  return parts
    .map((part, i) => {
      if (i % 2 === 0) return fixText(part)
      if (SKIP.test(part) || part.startsWith('<!')) return part
      if (/^<meta\b/i.test(part) && !/(name|property)="(description|og:title|og:description|twitter:title|twitter:description)"/.test(part)) return part
      return part.replace(ATTRS, (_, a, v, b) => a + fix(v) + b)
    })
    .join('')
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (e.name.endsWith('.html')) yield p
  }
}

export default function typography() {
  return {
    name: 'gcg-typography',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let n = 0
        for await (const file of walk(fileURLToPath(dir))) {
          const html = await readFile(file, 'utf8')
          const lang = /<html[^>]*\slang="en"/.test(html) ? 'en' : 'fr'
          if (/[\\/]admin\.html$/.test(file)) continue
          const out = typeset(html, lang)
          if (out !== html) {
            await writeFile(file, out)
            n++
          }
        }
        logger.info(`typographie appliquée à ${n} pages`)
      },
    },
  }
}
