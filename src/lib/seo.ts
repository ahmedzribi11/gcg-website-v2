import legal from '../data/legal.json'
import type { Lang } from '../i18n'
import { contact, socials } from './settings'

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
