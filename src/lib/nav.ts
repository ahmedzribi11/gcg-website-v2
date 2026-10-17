import { route, useT, type Lang } from '../i18n'

const MAIN = ['services', 'projects', 'about', 'invest', 'contact'] as const

/** Menu principal, le même dans l’en-tête, le menu plein écran et le pied de page (CODE-06). */
export const mainNav = (lang: Lang) => {
  const t = useT(lang)
  return MAIN.map((key) => ({ href: route(key, lang), label: t(`nav.${key}`) }))
}
