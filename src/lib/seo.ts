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
  const width = Math.min(1200, src.width, Math.floor((src.height * 1200) / 630))
  const height = Math.round((width * 630) / 1200)
  const img = await getImage({ src, width, height, fit: 'cover', format: 'jpg', quality: 80 })
  return { src: img.src, width, height }
}

/**
 * Données structurées de l’entreprise (schema.org GeneralContractor, sous-type d’Organization).
 * Seules les informations renseignées et visibles sur le site sont publiées.
 */
export function organizationLd(lang: Lang, site: URL | undefined, extra: Record<string, unknown> = {}) {
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
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
