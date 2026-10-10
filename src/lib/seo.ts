import { getImage } from 'astro:assets'
import type { ImageMetadata } from 'astro'
import legal from '../data/legal.json'
import type { Lang } from '../i18n'
import { contact, socials } from './settings'

/**
 * Image de partage (Open Graph) au rapport 1,91:1 des aperçus de liens (SHR-08) : 1 200 × 630 quand la source le
 * permet, sinon le plus grand recadrage à ce rapport qu’elle contient, car Astro n’agrandit jamais une image.
 * Les dimensions renvoyées sont celles du fichier produit, annoncées telles quelles dans og:image:width/height.
 */
export async function ogImage(src: ImageMetadata) {
  const { width, height } = ogSize(src)
  const img = await getImage({ src, width, height, fit: 'cover', format: 'jpg', quality: 80 })
  return { src: img.src, width, height }
}

/** Taille d’une image de partage tirée de `src` : 1 200 × 630 au plus, au rapport 1,91:1, sans agrandissement. */
export function ogSize(src: { width: number; height: number }) {
  const width = Math.min(1200, src.width, Math.floor((src.height * 1200) / 630))
  return { width, height: Math.round((width * 630) / 1200) }
}

/**
 * Aperçu de lien par défaut (accueil, contact, listes…) : la photo du projet vitrine réceptionné avec le logo dans un
 * coin (SHR-09), produite par src/pages/og/[name].jpg.ts. Projet non publié : l’ancienne carte au logo, /og-image.jpg.
 */
export const SHOWCASE_OG = '/og/accueil.jpg'
export function defaultOgImage(showcase: { image: { src: ImageMetadata } } | undefined) {
  return showcase ? { src: SHOWCASE_OG, ...ogSize(showcase.image.src) } : { src: '/og-image.jpg', width: 1200, height: 630 }
}

/** Identifiant de l’entreprise dans les données structurées, le même sur toutes les pages (SEO-03). */
export const orgId = (site: URL) => new URL('/#org', site).href

/**
 * Données structurées de l’entreprise (schema.org GeneralContractor, sous-type d’Organization).
 * Seules les informations renseignées et visibles sur le site sont publiées. Elles doivent rester identiques à
 * la fiche Google Business Profile (nom, adresse, téléphone, horaires : SEO-02, SEO-03).
 * `extra.image` : photo réelle d’un projet livré (Base.astro).
 */
export function organizationLd(lang: Lang, site: URL | undefined, extra: Record<string, unknown> = {}) {
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    ...(site ? { '@id': orgId(site) } : {}),
    name: legal.tradeName,
    alternateName: [legal.shortName, 'General Constructor Group'],
    foundingDate: '2016',
    areaServed: { '@type': 'Country', name: 'Côte d’Ivoire' },
    address: { '@type': 'PostalAddress', addressCountry: 'CI', ...(contact.address ? { streetAddress: contact.address, addressLocality: 'Abidjan' } : {}) },
  }
  if (legal.legalName) o.legalName = legal.legalName
  if (site) {
    o.url = new URL(lang === 'fr' ? '/' : '/en', site).href
    o.logo = new URL('/brand/gcg-logo-green.png', site).href
  }
  if (contact.phoneE164) o.telephone = contact.phoneE164
  if (contact.mapsUrl) o.hasMap = contact.mapsUrl
  if (contact.geo) o.geo = { '@type': 'GeoCoordinates', ...contact.geo }
  if (contact.openingHours) {
    const { days, opens, closes } = contact.openingHours
    o.openingHoursSpecification = { '@type': 'OpeningHoursSpecification', dayOfWeek: days.map((d) => `https://schema.org/${d}`), opens, closes }
  }
  if (contact.email) o.email = contact.email
  if (contact.phoneE164 || contact.email) {
    o.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'CI',
      availableLanguage: ['French', 'English'],
      ...(contact.phoneE164 ? { telephone: contact.phoneE164 } : {}),
      ...(contact.email ? { email: contact.email } : {}),
    }
  }
  if (socials.length) o.sameAs = socials.map((s) => s.url)
  return { ...o, ...extra }
}

/** Page d’un projet (schema.org WebPage), publiée par l’entreprise, désignée par son identifiant (SEO-03). */
export function webPageLd(page: { path: string; name: string; description: string; image: string; lang: Lang }, site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': new URL(page.path, site).href,
    url: new URL(page.path, site).href,
    name: page.name,
    description: page.description,
    inLanguage: page.lang,
    image: new URL(page.image, site).href,
    publisher: { '@type': 'GeneralContractor', '@id': orgId(site), name: legal.tradeName },
  }
}

export function breadcrumbLd(items: { name: string; path: string }[], site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(site ? { item: new URL(it.path, site).href } : {}),
    })),
  }
}
