import type { SERVICES } from '../content.config'

export type ServiceId = (typeof SERVICES)[number]
type L<T> = { fr: T; en: T }

export interface Service {
  id: ServiceId
  slug: L<string>
  title: L<string>
  short: L<string>
  intro: L<string>
  includes: L<string[]>
  /** Photo d’illustration : projet et index de l’image. */
  cover: [string, number]
}

/**
 * Les métiers de GCG. Chaque prestation listée correspond à une mission ou une
 * compétence figurant dans le portfolio (missions des projets, domaines de compétences).
 */
export const services: Service[] = [
  {
    id: 'etudes',
    cover: ['hotel-du-golf', 0],
    slug: { fr: 'etudes-et-faisabilite', en: 'studies-and-feasibility' },
    title: { fr: 'Études & faisabilité', en: 'Feasibility & design studies' },
    short: {
      fr: 'Savoir si un projet est faisable, et comment, avant d’engager les études détaillées.',
      en: 'Find out whether a project is feasible, and how, before committing to detailed design.',
    },
    intro: {
      fr: 'Tout projet commence par une question : est-il faisable, et à quelles conditions ? GCG réalise les études de faisabilité et les études préalables de projets privés, du complexe touristique à l’usine, jusqu’au dossier de permis de bâtir.',
      en: 'Every project starts with one question: is it feasible, and on what terms? GCG carries out feasibility and preliminary studies for private projects, from tourist resorts to factories, through to the building permit application.',
    },
    includes: {
      fr: ['Études de faisabilité', 'Études préalables et programme', 'Études techniques d’installations', 'Dossiers de permis de bâtir'],
      en: ['Feasibility studies', 'Preliminary studies and brief', 'Engineering studies for installations', 'Building permit applications'],
    },
  },
  {
    id: 'architecture',
    cover: ['residence-assinie-mafia', 0],
    slug: { fr: 'architecture-et-conception', en: 'architecture-and-design' },
    title: { fr: 'Architecture & conception', en: 'Architecture & design' },
    short: {
      fr: 'Villas, résidences, immeubles, hôtels, équipements : des projets conçus par nos architectes.',
      en: 'Villas, residences, buildings, hotels and facilities, designed by our architects.',
    },
    intro: {
      fr: 'Nos architectes conçoivent des villas et des résidences haut standing, des immeubles de bureaux et de logements, des hôtels, des complexes touristiques et des équipements. De la conception architecturale aux études détaillées, le projet est pensé avec ceux qui le construiront.',
      en: 'Our architects design high-end villas and residences, office and apartment buildings, hotels, resorts and public-facing facilities. From architectural concept to detailed design, each project is drawn up together with the people who will build it.',
    },
    includes: {
      fr: ['Conception architecturale', 'Études architecturales', 'Prototypes et typologies de villas', 'Aménagements architecturaux et décoratifs'],
      en: ['Architectural design', 'Architectural studies', 'Villa prototypes and house types', 'Architectural and decorative fit-out'],
    },
  },
  {
    id: 'ingenierie',
    cover: ['immeuble-attoban', 3],
    slug: { fr: 'ingenierie', en: 'engineering' },
    title: { fr: 'Ingénierie', en: 'Engineering' },
    short: {
      fr: 'Structure, fluides, électricité, BIM et contrôle qualité : le projet dimensionné et sécurisé.',
      en: 'Structure, plumbing, electrical, BIM and quality control: every project sized and secured.',
    },
    intro: {
      fr: 'Le pôle Études & contrôle qualité de GCG dimensionne les ouvrages, du béton armé à la structure métallique, et coordonne les études fluides et électricité. Le contrôle qualité accompagne le chantier jusqu’à la réception.',
      en: 'GCG’s engineering studies and quality control division sizes each structure, from reinforced concrete to steel frames, and coordinates plumbing and electrical engineering. Quality control follows the site all the way to handover.',
    },
    includes: {
      fr: [
        'Études de structure (béton et structure métallique)',
        'Études fluides et électricité',
        'Études techniques',
        'Modélisation BIM',
        'Contrôle qualité (QA/QC)',
      ],
      en: [
        'Structural engineering (concrete and steel)',
        'Plumbing and electrical engineering',
        'Technical studies',
        'BIM modelling',
        'Quality control (QA/QC)',
      ],
    },
  },
  {
    id: 'construction',
    cover: ['green-city', 2],
    slug: { fr: 'construction', en: 'construction' },
    title: { fr: 'Construction', en: 'Construction' },
    short: {
      fr: 'Gros œuvre, second œuvre et finitions, avec nos équipes et nos propres engins.',
      en: 'Structural works, finishing and trims, with our own teams and machinery.',
    },
    intro: {
      fr: 'Le pôle Construction pilote les chantiers, du gros œuvre aux finitions : villas, cités résidentielles, immeubles, hôtels, usines en structure métallique. GCG dispose de ses propres engins et équipements de chantier, et assure le suivi jusqu’à la réception.',
      en: 'The Construction division runs the sites, from structural works to finishing: villas, residential estates, buildings, hotels and steel-frame factories. GCG operates its own machinery and site equipment, and follows each project through to handover.',
    },
    includes: {
      fr: ['Gros œuvre', 'Second œuvre', 'Finitions', 'Structures métalliques', 'Suivi de chantier et réception', 'Planning et coordination'],
      en: ['Structural works', 'Secondary works', 'Finishing', 'Steel structures', 'Site supervision and handover', 'Planning and coordination'],
    },
  },
  {
    id: 'amenagement',
    cover: ['spa-assinie', 1],
    slug: { fr: 'amenagement', en: 'fit-out-and-landscaping' },
    title: { fr: 'Aménagement', en: 'Fit-out & landscaping' },
    short: {
      fr: 'Intérieurs, extérieurs, ameublement et piscines : l’ouvrage prêt à vivre.',
      en: 'Interiors, exteriors, furnishing and pools: ready to live in.',
    },
    intro: {
      fr: 'Un bâtiment n’est terminé que lorsqu’il est prêt à être habité ou exploité. GCG réalise les aménagements intérieurs et extérieurs, l’ameublement et l’agencement, ainsi que les piscines, des villas aux établissements hôteliers.',
      en: 'A building is only finished when it is ready to be lived in or operated. GCG delivers interior and exterior fit-out, furnishing and layout, and swimming pools, from private villas to hotels.',
    },
    includes: {
      fr: ['Aménagements intérieurs', 'Aménagements extérieurs', 'Ameublement et agencement', 'Piscines'],
      en: ['Interior fit-out', 'Landscaping and exterior works', 'Furnishing and layout', 'Swimming pools'],
    },
  },
  {
    id: 'rehabilitation',
    cover: ['hotel-akwabeach', 1],
    slug: { fr: 'renovation-et-mise-a-niveau', en: 'renovation-and-upgrades' },
    title: { fr: 'Rénovation & mise à niveau', en: 'Renovation & upgrades' },
    short: {
      fr: 'Moderniser, réhabiliter et mettre en conformité des bâtiments existants.',
      en: 'Modernise, rehabilitate and bring existing buildings up to standard.',
    },
    intro: {
      fr: 'Hôtels, salles de sport, complexes existants : GCG rénove et modernise les espaces, réhabilite les infrastructures et les équipements, et met les sites en conformité technique, de l’électricité à la sécurité incendie.',
      en: 'Hotels, gyms, existing complexes: GCG renovates and modernises spaces, rehabilitates infrastructure and equipment, and brings sites up to technical standard, from electrical systems to fire safety.',
    },
    includes: {
      fr: [
        'Rénovation et modernisation des espaces',
        'Réhabilitation des infrastructures et équipements',
        'Mise à niveau électricité et plomberie',
        'Détection et lutte contre l’incendie',
        'Mise en conformité technique',
      ],
      en: [
        'Renovation and modernisation of spaces',
        'Rehabilitation of infrastructure and equipment',
        'Electrical and plumbing upgrades',
        'Fire detection and fire-fighting systems',
        'Technical compliance',
      ],
    },
  },
  {
    id: 'infrastructures',
    cover: ['vrd-cite-baobab', 0],
    slug: { fr: 'infrastructures-et-vrd', en: 'infrastructure-and-utilities' },
    title: { fr: 'Infrastructures & VRD', en: 'Infrastructure & utilities' },
    short: {
      fr: 'Voirie, assainissement et réseaux pour les quartiers et les sites.',
      en: 'Roads, drainage and networks for estates and sites.',
    },
    intro: {
      fr: 'Avant les bâtiments, il y a le site. GCG réalise la voirie et les réseaux divers (VRD) de quartiers résidentiels et de programmes : voiries, assainissement, réseaux, infrastructures et équipements.',
      en: 'Before the buildings comes the site. GCG builds roads and utility networks for residential estates and developments: roads, drainage, networks, infrastructure and equipment.',
    },
    includes: {
      fr: ['Voirie', 'Assainissement', 'Réseaux divers', 'Aménagement de quartiers résidentiels', 'Infrastructures et équipements'],
      en: ['Roads', 'Drainage and sanitation', 'Utility networks', 'Residential estate development', 'Infrastructure and equipment'],
    },
  },
  {
    id: 'cle-en-main',
    cover: ['hotel-calao-korhogo', 0],
    slug: { fr: 'cle-en-main', en: 'turnkey' },
    title: { fr: 'Clé en main', en: 'Turnkey' },
    short: {
      fr: 'Un seul interlocuteur, de l’étude à la remise des clés.',
      en: 'One partner, from the first study to the keys.',
    },
    intro: {
      fr: 'Hôtel, villa, immeuble, salle polyvalente : GCG prend en charge l’ensemble du projet. Études, conception, construction et aménagement sont menés par la même équipe, jusqu’à la remise d’un ouvrage prêt à l’usage.',
      en: 'Hotel, villa, building or events hall: GCG takes charge of the whole project. Engineering studies, design, construction and fit-out are carried out by the same team, through to the handover of a building ready for use.',
    },
    includes: {
      fr: ['Études et conception', 'Construction', 'Aménagement et équipement', 'Remise des clés'],
      en: ['Engineering studies and design', 'Construction', 'Fit-out and equipment', 'Handover of the keys'],
    },
  },
]

export const getService = (id: ServiceId) => services.find((s) => s.id === id)!
