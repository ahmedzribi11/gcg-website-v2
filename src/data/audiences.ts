type L<T> = { fr: T; en: T }

export interface Audience {
  id: 'investisseurs' | 'hotellerie' | 'diaspora' | 'entreprises'
  title: L<string>
  text: L<string>
  points: L<string[]>
  /** Projets cités en preuve (identifiants de fichiers). */
  proof: string[]
  /** Projet dont la photo illustre le panneau. */
  image: string
}

/**
 * Publics prioritaires (réunion de cadrage du 2 octobre 2026) : investisseurs et
 * promoteurs immobiliers, grands projets hôteliers, diaspora, entreprises.
 */
export const audiences: Audience[] = [
  {
    id: 'investisseurs',
    title: { fr: 'Investisseurs & promoteurs', en: 'Investors & developers' },
    text: {
      fr: 'Lotissements, cités résidentielles, tours, immeubles de rapport : GCG conçoit et construit à l’échelle de votre programme immobilier.',
      en: 'Estates, gated communities, towers, rental buildings: GCG designs and builds at the scale of your real-estate programme.',
    },
    points: {
      fr: ['Études de faisabilité et conception', 'Programmes de plusieurs dizaines de villas', 'Voirie et réseaux du site (VRD)'],
      en: ['Feasibility studies and design', 'Programmes of dozens of villas', 'Site roads and utilities'],
    },
    proof: ['villa-palmeras', 'green-city', 'projet-elan', 'residence-abatta'],
    image: 'villa-palmeras',
  },
  {
    id: 'hotellerie',
    title: { fr: 'Hôtellerie & tourisme', en: 'Hospitality & tourism' },
    text: {
      fr: 'Hôtels, resorts, villas touristiques, bars de plage et spas : de l’étude d’un nouveau complexe à la mise à niveau d’un établissement existant.',
      en: 'Hotels, resorts, holiday villas, beach bars and spas: from the study of a new resort to the upgrade of an existing hotel.',
    },
    points: {
      fr: ['Hôtels clé en main', 'Rénovation et modernisation', 'Mise en conformité technique et incendie'],
      en: ['Turnkey hotels', 'Renovation and modernisation', 'Technical and fire-safety compliance'],
    },
    proof: ['hotel-calao-korhogo', 'palm-resort-movenpick', 'hotel-akwabeach', 'royal-palm'],
    image: 'hotel-calao-korhogo',
  },
  {
    id: 'diaspora',
    title: { fr: 'Particuliers & diaspora', en: 'Private owners & diaspora' },
    text: {
      fr: 'Vous vivez à Abidjan, à Paris ou ailleurs et voulez construire en Côte d’Ivoire : villa, résidence familiale, immeuble de rapport. Un seul interlocuteur, de l’étude à la remise des clés.',
      en: 'You live in Abidjan, Paris or elsewhere and want to build in Côte d’Ivoire: a villa, a family residence, a rental building. One partner, from the first study to the keys.',
    },
    points: {
      fr: ['Villas haut standing avec piscine', 'Projets clé en main', 'Plans d’architecte sur mesure'],
      en: ['High-end villas with pools', 'Turnkey projects', 'Bespoke architectural design'],
    },
    proof: ['villa-de-luxe-assouinde', 'residence-privee-beverly-hills', 'villa-palmerais', 'villa-de-maitre-beverly-hills'],
    image: 'residence-privee-beverly-hills',
  },
  {
    id: 'entreprises',
    title: { fr: 'Entreprises & industrie', en: 'Companies & industry' },
    text: {
      fr: 'Usines, sites de stockage, bureaux, équipements : des bâtiments techniques, de l’étude à la réalisation, y compris en structure métallique.',
      en: 'Factories, storage sites, offices and facilities: technical buildings from study to construction, including steel structures.',
    },
    points: {
      fr: ['Usines en structure métallique', 'Bureaux clé en main', 'Études techniques d’installations'],
      en: ['Steel-frame factories', 'Turnkey offices', 'Engineering studies for installations'],
    },
    proof: ['saif-ivoire', 'usine-pharmanova', 'usine-de-cajou', 'immeuble-bureautique-kone'],
    image: 'usine-de-cajou',
  },
]
