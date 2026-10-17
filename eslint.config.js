// Analyse statique (ENG-02) : JavaScript, TypeScript et composants Astro.
import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * Échelle typographique (SLOP-05) : seules les 8 tailles de global.css (@theme --text-*) sont permises.
 * Refuse les tailles libres text-[…] (rem, px, clamp, calc…) ; les couleurs text-[#…] restent possibles.
 */
const typeScale = {
  rules: {
    'no-arbitrary-font-size': {
      meta: { type: 'problem', schema: [], messages: { size: 'Taille libre « {{value}} » : utiliser text-xs … text-4xl (échelle de global.css, SLOP-05).' } },
      create(context) {
        return {
          Program() {
            const { sourceCode } = context
            for (const m of sourceCode.text.matchAll(/text-\[(?:length:)?(?:[\d.]|clamp\(|min\(|max\(|calc\(|var\()[^\]\s]*\]/g)) {
              context.report({
                loc: { start: sourceCode.getLocFromIndex(m.index), end: sourceCode.getLocFromIndex(m.index + m[0].length) },
                messageId: 'size',
                data: { value: m[0] },
              })
            }
          },
        }
      },
    },
  },
}

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', '.lighthouseci/', 'public/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Affiche et liste de références : documents imprimés, cotés en mm et px pour le papier
    files: ['src/**/*.{astro,ts,js,mjs}'],
    ignores: ['src/views/Poster.astro', 'src/views/References.astro'],
    plugins: { 'type-scale': typeScale },
    rules: { 'type-scale/no-arbitrary-font-size': 'error' },
  },
]
