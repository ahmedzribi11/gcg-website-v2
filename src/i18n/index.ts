export type Lang = 'fr' | 'en'
export const LANGS: Lang[] = ['fr', 'en']

/* ─── Routes ──────────────────────────────────────────────────────────── */

export type RouteKey =
  'home' | 'services' | 'projects' | 'about' | 'invest' | 'contact' | 'thanks' | 'formError' | 'share' | 'poster' | 'references' | 'legal' | 'privacy'

const ROUTES: Record<RouteKey, Record<Lang, string>> = {
  home: { fr: '/', en: '/en' },
  services: { fr: '/expertises', en: '/en/services' },
  projects: { fr: '/realisations', en: '/en/projects' },
  about: { fr: '/a-propos', en: '/en/about' },
  invest: { fr: '/investir', en: '/en/invest' },
  contact: { fr: '/contact', en: '/en/contact' },
  thanks: { fr: '/contact/merci', en: '/en/contact/thanks' },
  formError: { fr: '/contact/erreur', en: '/en/contact/error' },
  share: { fr: '/partager', en: '/en/share' },
  poster: { fr: '/partager/affiche', en: '/en/share/poster' },
  references: { fr: '/references', en: '/en/references' },
  legal: { fr: '/mentions-legales', en: '/en/legal-notice' },
  privacy: { fr: '/confidentialite', en: '/en/privacy' },
}

export const route = (key: RouteKey, lang: Lang) => ROUTES[key][lang]
export const projectPath = (slug: string, lang: Lang) => `${ROUTES.projects[lang]}/${slug}`
export const servicePath = (slug: string, lang: Lang) => `${ROUTES.services[lang]}/${slug}`

/**
 * Code court d’un projet pour les QR codes de chantier (SHR-04) : 4 caractères (0-9, a-z) calculés à partir
 * de son adresse (slug), qui ne change jamais, et non de son N° d’ordre, que l’espace de gestion peut modifier.
 * src/pages/q vérifie au build que deux projets n’ont pas le même code.
 */
export const qrCode = (slug: string) => {
  let h = 0x811c9dc5 // FNV-1a 32 bits
  for (const ch of slug) h = Math.imul(h ^ ch.codePointAt(0)!, 0x01000193) >>> 0
  return (h % 36 ** 4).toString(36).padStart(4, '0')
}

/**
 * Adresse permanente encodée dans un QR code imprimé (voir src/pages/qr et src/pages/q).
 * Panneaux de chantier (affiche, fichiers téléchargés) : adresse courte /q, /q/<code> (SHR-04) ; avec la correction
 * d’erreur Q, le code garde 29 modules au lieu de 33 à 41. Les anciennes adresses /qr/panneau et /qr/p/<projet>
 * restent en ligne pour les panneaux déjà imprimés.
 */
export type QrMedium = 'qr' | 'panneau' | 'carte' | 'brochure'
export const qrPath = (lang: Lang, medium: QrMedium = 'qr', slug?: string) => {
  if (medium === 'panneau') {
    const short = lang === 'en' ? '/q/en' : '/q'
    return slug ? `${short}/${qrCode(slug)}` : short
  }
  const base = lang === 'en' ? '/qr/en' : '/qr'
  if (slug) return `${base}/p/${slug}`
  return medium === 'qr' ? base : `${base}/${medium}`
}

/* ─── Libellés de données ─────────────────────────────────────────────── */

type L = Record<Lang, string>

export const SECTOR_LABELS: Record<string, L> = {
  residentiel: { fr: 'Résidentiel & bureaux', en: 'Residential & offices' },
  hotellerie: { fr: 'Hôtellerie & tourisme', en: 'Hospitality & tourism' },
  equipements: { fr: 'Équipements & loisirs', en: 'Facilities & leisure' },
  industrie: { fr: 'Industrie & infrastructures', en: 'Industry & infrastructure' },
}

export const STATUS_LABELS: Record<string, L> = {
  execution: { fr: 'En cours d’exécution', en: 'Under construction' },
  etudes: { fr: 'En cours d’études', en: 'In design' },
  receptionne: { fr: 'Réceptionné', en: 'Handed over' },
}

export const STATUS_SHORT: Record<string, L> = {
  execution: { fr: 'En chantier', en: 'Under construction' },
  etudes: { fr: 'En études', en: 'In design' },
  receptionne: { fr: 'Réceptionné', en: 'Handed over' },
}

export const TYPE_LABELS: Record<string, L> = {
  villas: { fr: 'Villas', en: 'Villas' },
  residences: { fr: 'Résidences', en: 'Residences' },
  immeubles: { fr: 'Immeubles', en: 'Buildings' },
  hotels: { fr: 'Hôtels', en: 'Hotels' },
  loisirs: { fr: 'Loisirs', en: 'Leisure' },
  industrie: { fr: 'Usines', en: 'Factories' },
  equipements: { fr: 'Équipements', en: 'Facilities' },
  infrastructures: { fr: 'Infrastructures', en: 'Infrastructure' },
}

/* ─── Interface ───────────────────────────────────────────────────────── */

const UI = {
  fr: {
    'site.name': 'General Constructor Group',
    'site.tagline': 'Construction & ingénierie en Côte d’Ivoire depuis 2016',
    'site.description':
      'General Constructor Group (GCG) conçoit et construit villas, résidences, immeubles, hôtels, usines et infrastructures en Côte d’Ivoire depuis 2016.',

    'nav.services': 'Expertises',
    'nav.projects': 'Réalisations',
    'nav.about': 'À propos',
    'nav.invest': 'Pour qui',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Fermer',
    'nav.skip': 'Aller au contenu',
    'nav.cta': 'Votre projet',
    'nav.lang': 'English',
    'nav.langShort': 'EN',
    'nav.home': 'Accueil',

    'cta.project': 'Parler de votre projet',
    'cta.projects': 'Voir nos réalisations',
    'cta.allProjects': 'Toutes les réalisations',
    'cta.whatsapp': 'Écrire sur WhatsApp',
    'cta.call': 'Appeler',
    'cta.email': 'Écrire un e-mail',
    'cta.service': 'Voir l’expertise',
    'cta.discover': 'Découvrir',
    'cta.share': 'Partager',

    'hero.kicker': 'Construction & ingénierie · Côte d’Ivoire · depuis 2016',
    // La phrase de Zouhair, montée de la section Types (SLOP-18) ; title3 est en accent
    'hero.title1': 'Vous voulez un hôtel ?',
    'hero.title2': 'Nous construisons',
    'hero.title3': 'un hôtel.',
    'hero.lead': 'Villas, résidences, hôtels, usines : une seule équipe, de l’étude à la remise des clés.',
    'hero.skip': 'Passer l’intro',

    'intro.label': 'GCG en bref',
    'intro.statement': 'Une seule équipe, des études au chantier.',
    'intro.text':
      'General Constructor Group est une entreprise de construction et d’ingénierie installée en Côte d’Ivoire depuis 2016. Études de faisabilité, études architecturales et techniques, construction, aménagement : nous prenons en charge tout le projet ou une partie.',
    'fig.since': 'Création',
    'fig.projects': 'Projets au portfolio',
    'fig.delivered.one': 'Projet réceptionné',
    'fig.delivered.many': 'Projets réceptionnés',
    'fig.building.one': 'Projet en chantier',
    'fig.building.many': 'Projets en chantier',
    'fig.including': 'dont',

    'services.label': 'Expertises',
    'services.title': 'Une étape ou tout le projet.',
    'services.lead':
      'Un client peut venir pour une étude, un plan d’architecte ou un chantier complet : GCG intervient à chaque étape, ou sur l’ensemble du projet.',
    'services.projects': 'projets',
    'services.includes': 'Ce que nous faisons',
    'services.related': 'Projets associés',
    'services.others': 'Nos autres expertises',
    'services.turnkey': 'Le clé en main',

    'types.label': 'Tout type de projet',
    'types.title': 'Villas, hôtels, usines, routes.',
    'types.lead':
      'Villas, résidences, immeubles, hôtels, bars de plage, spas, usines, salles polyvalentes, voiries : le portfolio de GCG couvre presque tout ce qui se construit.',

    'featured.label': 'Réalisations phares',
    'featured.title': 'Ce que nous construisons et concevons.',
    'featured.skip': 'Passer les projets',

    'scale.label': 'À toutes les échelles',
    'scale.title': 'De la villa au grand programme.',
    'scale.lead': 'Une villa pour un particulier ou des dizaines de villas pour un programme immobilier : la même équipe d’études et de chantier.',

    'presence.label': 'Présence',
    'presence.title': 'De Korhogo à Assinie.',
    'presence.lead': 'Des projets dans six localités de Côte d’Ivoire, d’Abidjan au littoral et jusqu’au nord du pays.',
    'presence.ambition': 'Siège à Abidjan, Marcory Zone 4.',

    'audiences.label': 'Nos clients',
    'audiences.title': 'Pour qui nous construisons.',

    'method.label': 'Méthode',
    'method.title': 'Six étapes, un seul interlocuteur.',

    'final.kicker': 'Un projet à construire ?',
    'final.title': 'Parlons-en.',
    'final.lead': 'Décrivez-nous votre projet : villa, résidence, hôtel, immeuble, usine. Nous revenons vers vous.',

    'projects.label': 'Réalisations',
    'projects.title': 'Le patrimoine GCG.',
    'projects.lead': 'Projets livrés, en chantier ou en études : villas, résidences, hôtels, immeubles, usines et infrastructures, depuis 2016.',
    'projects.filter.all': 'Tous',
    'projects.filter.sector': 'Secteur',
    'projects.filter.status': 'Statut',
    'projects.filter.city': 'Localité',
    'projects.filter.reset': 'Réinitialiser',
    'projects.count.one': 'projet',
    'projects.count.many': 'projets',
    'projects.delivered.many': 'Réceptionnés',
    'projects.view.grid': 'Grille',
    'projects.view.map': 'Carte',
    'projects.empty': 'Aucun projet ne correspond à ces filtres.',
    'projects.references': 'Liste de références (PDF)',

    'project.back': 'Toutes les réalisations',
    'project.sheet': 'Fiche projet',
    'project.no': 'N°',
    'project.location': 'Lieu',
    'project.period': 'Période',
    'project.status': 'Statut',
    'project.designOnly': 'Études uniquement',
    'project.sector': 'Secteur',
    'project.surface': 'Surface',
    'project.terrain': 'Terrain',
    'project.covered': 'Surface couverte',
    'project.duration': 'Durée du chantier',
    'project.workforce': 'Effectif au plus fort',
    'project.people.one': 'personne',
    'project.people.many': 'personnes',
    'project.story.need': 'Le besoin',
    'project.story.work': 'Ce que GCG a fait',
    'project.story.result': 'Le résultat',
    'project.composition': 'Programme',
    'project.missions': 'Missions de GCG',
    'project.typologies': 'Typologies',
    'project.typology': 'Typologie',
    'project.services': 'Expertises mobilisées',
    'project.gallery': 'Galerie',
    'project.photo': 'Photo',
    'project.of': 'sur',
    'project.share': 'Partager ce projet',
    'project.copy': 'Copier le lien',
    'project.copied': 'Lien copié',
    'project.qr': 'QR code du projet',
    'project.qrHelp': 'À imprimer sur le panneau de chantier : les passants découvrent le projet et GCG.',
    'project.poster': 'Affiche de chantier',
    'project.similar': 'Un projet similaire ?',
    'project.similarText': 'Parlez-nous de votre projet : nous l’étudions avec vous.',
    'project.related': 'Projets similaires',
    'project.prev': 'Projet précédent',
    'project.render': 'Perspective',
    'project.plan': 'Plan',
    'project.enlarge': 'Agrandir',
    'project.prevPhoto': 'Image précédente',
    'project.nextPhoto': 'Image suivante',
    'project.missingEn': 'Cette page n’existe pas encore dans cette langue ; voici la page la plus proche.',
    'project.next': 'Projet suivant',
    'project.close': 'Fermer',

    'about.label': 'À propos',
    'about.title': 'Construire, depuis 2016.',
    'about.lead':
      'Entreprise de construction et d’ingénierie en Côte d’Ivoire depuis 2016 : plus de 20 collaborateurs, quatre pôles, un parc d’engins et de véhicules.',
    'about.p2':
      'Notre savoir-faire s’étend aux domaines du génie civil, des infrastructures et de la construction de bâtiments. Notre engagement : concevoir et livrer des projets conformes aux attentes de nos clients et aux normes en vigueur.',
    'about.team': 'Une équipe technique pluridisciplinaire d’ingénieurs, d’architectes et de techniciens, organisée en quatre pôles.',
    'about.trust.label': 'Confiance',
    'about.director': 'Le mot du directeur général',
    'about.quotes': 'Ce que disent nos clients',
    'about.clients': 'Clients et partenaires',
    'about.credentials': 'Assurances et agréments',
    'about.history.label': 'Historique',
    'about.history.title': 'Dix ans de projets, année après année.',
    'about.history.lead': 'Chaque année, les projets du portfolio démarrés ou étudiés par GCG.',
    'about.org.label': 'Organisation',
    'about.org.title': 'Plus de 20 collaborateurs, quatre pôles, un pilotage centralisé.',
    'about.org.poles': 'Pôles opérationnels',
    'about.org.skills': 'Domaines de compétences',
    'about.org.staff': 'collaborateurs',
    'about.means.label': 'Moyens matériels',
    'about.means.title': 'Engins, équipements de chantier et véhicules.',
    'about.means.lead': 'Un parc d’engins, d’équipements de chantier et de véhicules pour maîtriser l’exécution.',
    'about.means.units': 'unités',
    'about.video': 'GCG en vidéo',

    'invest.label': 'Pour qui',
    'invest.title': 'Investir en Côte d’Ivoire, construire avec GCG.',
    'invest.lead': 'Promoteurs, investisseurs, groupes hôteliers, particuliers de la diaspora : vous apportez le projet, GCG le conçoit et le construit.',
    'invest.why': 'Pourquoi GCG',
    'invest.proof': 'Ils nous ont confié',
    'invest.remote': 'Construire depuis l’étranger',

    'contact.label': 'Contact',
    'contact.title': 'Parlons de votre projet.',
    'contact.lead': 'Quelques informations suffisent pour démarrer : l’équipe de GCG vous recontacte.',
    'contact.form.name': 'Nom et prénom',
    'contact.form.phone': 'Téléphone / WhatsApp',
    'contact.form.email': 'E-mail',
    'contact.form.profile': 'Vous êtes',
    'contact.form.type': 'Type de projet',
    'contact.form.location': 'Localisation du projet',
    'contact.form.message': 'Votre projet en quelques mots',
    'contact.form.sendWhatsapp': 'Envoyer par WhatsApp',
    'contact.form.sendEmail': 'Envoyer par e-mail',
    'contact.form.required': 'Champ obligatoire',
    'contact.form.intro': 'Bonjour GCG, je souhaite vous parler d’un projet.',
    'contact.form.send': 'Envoyer la demande',
    'contact.form.sending': 'Envoi en cours…',
    'contact.form.contactHint': 'Indiquez au moins un téléphone ou un e-mail.',
    'contact.form.notice': 'Vos informations servent uniquement à répondre à votre demande et sont transmises à l’équipe commerciale de GCG.',
    'contact.form.noticeLink': 'Politique de confidentialité',
    'contact.form.errorsTitle': 'Le formulaire contient des erreurs :',
    'contact.form.err.name': 'Indiquez votre nom.',
    'contact.form.err.contact': 'Indiquez un téléphone ou une adresse e-mail pour que GCG puisse vous répondre.',
    'contact.form.err.phone': 'Numéro invalide : indiquez-le avec l’indicatif, par exemple +225 07 00 00 00 00.',
    'contact.form.err.email': 'Adresse e-mail invalide, par exemple nom@exemple.com.',
    'contact.form.okTitle': 'Merci, votre demande est bien partie.',
    'contact.form.okText': 'L’équipe de GCG vous recontacte par téléphone ou par e-mail. Vous pouvez aussi lui écrire directement :',
    'contact.form.failTitle': 'La demande n’a pas pu être envoyée.',
    'contact.form.failText': 'Vos informations sont conservées dans le formulaire. Réessayez dans un instant ou contactez GCG directement :',
    'contact.form.rate': 'Trop de demandes envoyées depuis cette connexion. Réessayez dans quelques minutes ou contactez GCG directement :',
    'contact.form.honeypot': 'Ne pas remplir ce champ',
    'contact.form.optional': 'facultatif',
    'contact.form.pending': 'Les coordonnées de GCG seront publiées très prochainement sur cette page.',
    'contact.direct': 'Nous joindre',
    'contact.phone': 'Téléphone',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'E-mail',
    'contact.address': 'Adresse',
    'contact.hours': 'Horaires',
    'contact.social': 'Suivez GCG',
    'contact.share': 'Partager GCG',

    'share.label': 'Partager',
    'share.title': 'GCG en un scan.',
    'share.lead':
      'Un QR code pour chaque support : panneaux de chantier, cartes de visite, brochures. Pour un chantier, imprimez l’affiche et fixez-la sur le panneau.',
    'share.site': 'Site GCG',
    'share.siteHelp': 'Mène à la page d’accueil.',
    'share.download': 'Télécharger (SVG)',
    'share.downloadPng': 'Télécharger (PNG)',
    'share.poster': 'Affiche de chantier',
    'share.posterHelp': 'Affiche A4 imprimable avec QR code, pour les panneaux de chantier.',
    'share.posterOpen': 'Ouvrir l’affiche',
    'share.projects': 'QR code par projet',
    'share.projectsHelp': 'Chaque projet a sa page et son QR code, à afficher sur le chantier correspondant.',
    'share.social': 'Réseaux sociaux',
    'share.copy': 'Copier le lien',
    'share.native': 'Partager…',
    'share.tempWarning':
      'Ne pas imprimer pour l’instant : le site est encore sur une adresse provisoire. Les QR codes seront définitifs une fois le site publié sur le domaine de GCG.',
    'share.pdf': 'Portfolio (PDF)',
    'share.pdfHelp': 'Le portfolio complet de GCG, à télécharger ou à joindre à un dossier.',

    'poster.scan': 'Scannez pour découvrir',
    'poster.projects': 'nos réalisations',
    'poster.project': 'ce projet',
    'poster.print': 'Imprimer l’affiche',
    'poster.choose': 'Projet affiché',
    'poster.general': 'Affiche générale',
    'poster.format': 'Format',
    'poster.office': 'imprimante de bureau',
    'poster.printShop': 'imprimeur',
    'poster.formatHelp':
      'Marge blanche de 5 mm. Le QR code se scanne jusqu’à environ 1 m en A4, 1,4 m en A3, 2 m en A2 et 2,9 m en A1 : faites scanner une épreuve à la distance du panneau avant de commander.',

    'refs.label': 'Références',
    'refs.title': 'Liste de références',
    'refs.lead': 'Projets réalisés, en cours et en études — document à joindre aux dossiers d’appels d’offres.',
    'refs.print': 'Imprimer / enregistrer en PDF',
    'refs.edition': 'Édition',
    'refs.col.n': 'N°',
    'refs.col.project': 'Projet',
    'refs.col.location': 'Lieu',
    'refs.col.period': 'Période',
    'refs.col.surface': 'Surface',
    'refs.col.program': 'Programme',
    'refs.col.missions': 'Missions GCG',
    'refs.col.status': 'Statut',

    'footer.rights': 'Tous droits réservés.',
    'footer.since': 'Construction & ingénierie — depuis 2016',
    'footer.country': 'Côte d’Ivoire',
    'footer.links': 'Liens utiles',
    'legal.title': 'Mentions légales',
    'privacy.title': 'Politique de confidentialité',

    'profile.particulier': 'Particulier',
    'profile.diaspora': 'Particulier de la diaspora',
    'profile.investisseur': 'Investisseur / promoteur',
    'profile.hotelier': 'Hôtelier / tourisme',
    'profile.entreprise': 'Entreprise / industriel',
    'profile.autre': 'Autre',

    'ptype.villa': 'Villa',
    'ptype.residence': 'Résidence / lotissement',
    'ptype.immeuble': 'Immeuble',
    'ptype.hotel': 'Hôtel / resort',
    'ptype.commerce': 'Restaurant / commerce / loisirs',
    'ptype.industrie': 'Usine / entrepôt',
    'ptype.equipement': 'École / équipement',
    'ptype.vrd': 'Infrastructures / VRD',
    'ptype.renovation': 'Rénovation / mise à niveau',
    'ptype.etude': 'Étude / architecture seule',
    'ptype.autre': 'Autre',

    '404.title': 'Page introuvable',
    '404.text': 'Cette page n’existe pas ou a été déplacée.',
  },
  en: {
    'site.name': 'General Constructor Group',
    'site.tagline': 'Construction & engineering in Côte d’Ivoire since 2016',
    'site.description':
      'General Constructor Group (GCG) has designed and built villas, residences, buildings, hotels, factories and infrastructure in Côte d’Ivoire since 2016.',

    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.about': 'About',
    'nav.invest': 'Who we build for',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.skip': 'Skip to content',
    'nav.cta': 'Your project',
    'nav.lang': 'Français',
    'nav.langShort': 'FR',
    'nav.home': 'Home',

    'cta.project': 'Discuss your project',
    'cta.projects': 'See our projects',
    'cta.allProjects': 'All projects',
    'cta.whatsapp': 'Message us on WhatsApp',
    'cta.call': 'Call',
    'cta.email': 'Send an email',
    'cta.service': 'See this service',
    'cta.discover': 'Discover',
    'cta.share': 'Share',

    'hero.kicker': 'Construction & engineering · Côte d’Ivoire · since 2016',
    'hero.title1': 'You want a hotel?',
    'hero.title2': 'We build',
    'hero.title3': 'a hotel.',
    'hero.lead': 'Villas, residences, hotels, factories: one team, from design to handover.',
    'hero.skip': 'Skip intro',

    'intro.label': 'GCG at a glance',
    'intro.statement': 'One team, from design to construction.',
    'intro.text':
      'General Constructor Group is a construction and engineering company that has worked in Côte d’Ivoire since 2016. Feasibility studies, architectural and engineering design, construction, fit-out: we take on the whole project or any part of it.',
    'fig.since': 'Founded',
    'fig.projects': 'Projects in the portfolio',
    'fig.delivered.one': 'Project handed over',
    'fig.delivered.many': 'Projects handed over',
    'fig.building.one': 'Project under construction',
    'fig.building.many': 'Projects under construction',
    'fig.including': 'including',

    'services.label': 'Services',
    'services.title': 'One stage or the whole project.',
    'services.lead': 'Clients come to us for a study, an architect’s design or a complete build: GCG works at any stage, or on the whole project.',
    'services.projects': 'projects',
    'services.includes': 'What we do',
    'services.related': 'Related projects',
    'services.others': 'Our other services',
    'services.turnkey': 'Turnkey',

    'types.label': 'Every kind of project',
    'types.title': 'Villas, hotels, factories, roads.',
    'types.lead':
      'Villas, residences, buildings, hotels, beach bars, spas, factories, multipurpose halls, roads: GCG’s portfolio covers almost everything that gets built.',

    'featured.label': 'Flagship projects',
    'featured.title': 'What we build and design.',
    'featured.skip': 'Skip projects',

    'scale.label': 'At every scale',
    'scale.title': 'From single villas to large programmes.',
    'scale.lead': 'A single villa for a private owner or dozens of villas for a housing programme: the same design and site team.',

    'presence.label': 'Presence',
    'presence.title': 'From Korhogo to Assinie.',
    'presence.lead': 'Projects in six locations across Côte d’Ivoire, from Abidjan to the coast and the north of the country.',
    'presence.ambition': 'Head office in Abidjan, Marcory Zone 4.',

    'audiences.label': 'Our clients',
    'audiences.title': 'Who we build for.',

    'method.label': 'Method',
    'method.title': 'Six stages, one point of contact.',

    'final.kicker': 'A project to build?',
    'final.title': 'Let’s talk.',
    'final.lead': 'Tell us about your project: villa, residence, hotel, building, factory. We will get back to you.',

    'projects.label': 'Projects',
    'projects.title': 'GCG’s track record.',
    'projects.lead': 'Completed, under construction or in design: villas, residences, hotels, buildings, factories and infrastructure, since 2016.',
    'projects.filter.all': 'All',
    'projects.filter.sector': 'Sector',
    'projects.filter.status': 'Status',
    'projects.filter.city': 'Location',
    'projects.filter.reset': 'Reset',
    'projects.count.one': 'project',
    'projects.count.many': 'projects',
    'projects.delivered.many': 'Handed over',
    'projects.view.grid': 'Grid',
    'projects.view.map': 'Map',
    'projects.empty': 'No project matches these filters.',
    'projects.references': 'Reference list (PDF)',

    'project.back': 'All projects',
    'project.sheet': 'Project sheet',
    'project.no': 'No.',
    'project.location': 'Location',
    'project.period': 'Period',
    'project.status': 'Status',
    'project.designOnly': 'Design only',
    'project.sector': 'Sector',
    'project.surface': 'Area',
    'project.terrain': 'Plot',
    'project.covered': 'Built area',
    'project.duration': 'Time on site',
    'project.workforce': 'Peak workforce',
    'project.people.one': 'person',
    'project.people.many': 'people',
    'project.story.need': 'The brief',
    'project.story.work': 'What GCG did',
    'project.story.result': 'The outcome',
    'project.composition': 'Programme',
    'project.missions': 'GCG’s scope',
    'project.typologies': 'House types',
    'project.typology': 'Layout',
    'project.services': 'Services involved',
    'project.gallery': 'Gallery',
    'project.photo': 'Photo',
    'project.of': 'of',
    'project.share': 'Share this project',
    'project.copy': 'Copy link',
    'project.copied': 'Link copied',
    'project.qr': 'Project QR code',
    'project.qrHelp': 'Print it on the site hoarding: passers-by discover the project and GCG.',
    'project.poster': 'Site poster',
    'project.similar': 'A similar project?',
    'project.similarText': 'Tell us about your project: we will study it with you.',
    'project.related': 'Similar projects',
    'project.prev': 'Previous project',
    'project.render': 'Rendering',
    'project.plan': 'Drawing',
    'project.enlarge': 'Enlarge',
    'project.prevPhoto': 'Previous image',
    'project.nextPhoto': 'Next image',
    'project.missingEn': 'This page is not yet available in this language; here is the closest page.',
    'project.next': 'Next project',
    'project.close': 'Close',

    'about.label': 'About',
    'about.title': 'Building since 2016.',
    'about.lead':
      'A construction and engineering company working in Côte d’Ivoire since 2016: more than 20 staff, four divisions, a fleet of machinery and vehicles.',
    'about.p2':
      'Our expertise covers civil engineering, infrastructure and building construction. Our commitment: to design and deliver projects that meet our clients’ expectations and current standards.',
    'about.team': 'A multidisciplinary technical team of engineers, architects and technicians, organised in four divisions.',
    'about.trust.label': 'Trust',
    'about.director': 'From the managing director',
    'about.quotes': 'What our clients say',
    'about.clients': 'Clients and partners',
    'about.credentials': 'Insurance and licences',
    'about.history.label': 'History',
    'about.history.title': 'Ten years of projects, year after year.',
    'about.history.lead': 'Each year, the portfolio projects started or designed by GCG.',
    'about.org.label': 'Organisation',
    'about.org.title': 'More than 20 staff, four divisions, central management.',
    'about.org.poles': 'Operating divisions',
    'about.org.skills': 'Areas of expertise',
    'about.org.staff': 'staff',
    'about.means.label': 'Equipment',
    'about.means.title': 'Machinery, site equipment and vehicles.',
    'about.means.lead': 'A fleet of machinery, site equipment and vehicles so we control the work on site.',
    'about.means.units': 'units',
    'about.video': 'GCG on video',

    'invest.label': 'Who we build for',
    'invest.title': 'Invest in Côte d’Ivoire, build with GCG.',
    'invest.lead': 'Developers, investors, hotel groups, members of the diaspora: you bring the project and GCG designs and builds it.',
    'invest.why': 'Why GCG',
    'invest.proof': 'Projects entrusted to us',
    'invest.remote': 'Building from abroad',

    'contact.label': 'Contact',
    'contact.title': 'Let’s talk about your project.',
    'contact.lead': 'A few details are enough to get started: GCG’s team will get back to you.',
    'contact.form.name': 'Full name',
    'contact.form.phone': 'Phone / WhatsApp',
    'contact.form.email': 'Email',
    'contact.form.profile': 'You are',
    'contact.form.type': 'Type of project',
    'contact.form.location': 'Project location',
    'contact.form.message': 'Your project in a few words',
    'contact.form.sendWhatsapp': 'Send via WhatsApp',
    'contact.form.sendEmail': 'Send by email',
    'contact.form.required': 'Required field',
    'contact.form.intro': 'Hello GCG, I would like to discuss a project.',
    'contact.form.send': 'Send my enquiry',
    'contact.form.sending': 'Sending…',
    'contact.form.contactHint': 'Give at least a phone number or an email address.',
    'contact.form.notice': 'Your details are used only to answer your enquiry and are passed on to GCG’s sales team.',
    'contact.form.noticeLink': 'Privacy policy',
    'contact.form.errorsTitle': 'Please correct the following:',
    'contact.form.err.name': 'Please enter your name.',
    'contact.form.err.contact': 'Please give a phone number or an email address so GCG can reply.',
    'contact.form.err.phone': 'Invalid number: include the country code, for example +225 07 00 00 00 00.',
    'contact.form.err.email': 'Invalid email address, for example name@example.com.',
    'contact.form.okTitle': 'Thank you, your enquiry has been sent.',
    'contact.form.okText': 'GCG’s team will get back to you by phone or email. You can also contact them directly:',
    'contact.form.failTitle': 'Your enquiry could not be sent.',
    'contact.form.failText': 'Your details are still in the form. Try again in a moment or contact GCG directly:',
    'contact.form.rate': 'Too many enquiries were sent from this connection. Try again in a few minutes or contact GCG directly:',
    'contact.form.honeypot': 'Leave this field empty',
    'contact.form.optional': 'optional',
    'contact.form.pending': 'GCG’s contact details will be published on this page very soon.',
    'contact.direct': 'Reach us',
    'contact.phone': 'Phone',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.address': 'Address',
    'contact.hours': 'Opening hours',
    'contact.social': 'Follow GCG',
    'contact.share': 'Share GCG',

    'share.label': 'Share',
    'share.title': 'GCG in one scan.',
    'share.lead': 'A QR code for every medium: site hoardings, business cards, brochures. For a building site, print the poster and fix it to the hoarding.',
    'share.site': 'GCG website',
    'share.siteHelp': 'Opens the home page.',
    'share.download': 'Download (SVG)',
    'share.downloadPng': 'Download (PNG)',
    'share.poster': 'Site poster',
    'share.posterHelp': 'Printable A4 poster with a QR code, for site hoardings.',
    'share.posterOpen': 'Open the poster',
    'share.projects': 'QR code per project',
    'share.projectsHelp': 'Every project has its own page and QR code, to display on the matching site.',
    'share.social': 'Social media',
    'share.copy': 'Copy link',
    'share.native': 'Share…',
    'share.tempWarning': 'Do not print yet: the site is still on a temporary address. QR codes become permanent once the site is live on GCG’s own domain.',
    'share.pdf': 'Portfolio (PDF)',
    'share.pdfHelp': 'The full GCG portfolio, to download or attach to a submission.',

    'poster.scan': 'Scan to discover',
    'poster.projects': 'our projects',
    'poster.project': 'this project',
    'poster.print': 'Print the poster',
    'poster.choose': 'Project shown',
    'poster.general': 'General poster',
    'poster.format': 'Paper size',
    'poster.office': 'office printer',
    'poster.printShop': 'print shop',
    'poster.formatHelp':
      'With a 5 mm white margin. The QR code scans from up to about 1 m on A4, 1.4 m on A3, 2 m on A2 and 2.9 m on A1: have a proof scanned at the board’s distance before ordering.',

    'refs.label': 'References',
    'refs.title': 'Reference list',
    'refs.lead': 'Completed, ongoing and in-design projects — to attach to tender submissions.',
    'refs.print': 'Print / save as PDF',
    'refs.edition': 'Edition',
    'refs.col.n': 'No.',
    'refs.col.project': 'Project',
    'refs.col.location': 'Location',
    'refs.col.period': 'Period',
    'refs.col.surface': 'Area',
    'refs.col.program': 'Programme',
    'refs.col.missions': 'GCG scope',
    'refs.col.status': 'Status',

    'footer.rights': 'All rights reserved.',
    'footer.since': 'Construction & engineering — since 2016',
    'footer.country': 'Côte d’Ivoire',
    'footer.links': 'Useful links',
    'legal.title': 'Legal notice',
    'privacy.title': 'Privacy policy',

    'profile.particulier': 'Private owner',
    'profile.diaspora': 'Member of the diaspora',
    'profile.investisseur': 'Investor / developer',
    'profile.hotelier': 'Hotel / tourism operator',
    'profile.entreprise': 'Company / manufacturer',
    'profile.autre': 'Other',

    'ptype.villa': 'Villa',
    'ptype.residence': 'Residence / estate',
    'ptype.immeuble': 'Building',
    'ptype.hotel': 'Hotel / resort',
    'ptype.commerce': 'Restaurant / retail / leisure',
    'ptype.industrie': 'Factory / warehouse',
    'ptype.equipement': 'School / facility',
    'ptype.vrd': 'Infrastructure / roads',
    'ptype.renovation': 'Renovation / upgrade',
    'ptype.etude': 'Design studies / architecture only',
    'ptype.autre': 'Other',

    '404.title': 'Page not found',
    '404.text': 'This page does not exist or has moved.',
  },
} as const

export type UIKey = keyof (typeof UI)['fr']

export const useT = (lang: Lang) => (key: UIKey) => UI[lang][key] ?? UI.fr[key]

const UNIT = /(\d)[ \u00a0\u202f]?(m²|m2|ha|km|m|FCFA|%)(?![\p{L}\d])/gu

/** Format des nombres français : « 12 500 m² » (espace fine insécable entre milliers, insécable avant l’unité). */
export const frNumber = (s: string) =>
  s.replace(/(\d)[\s\u00a0\u202f](?=\d{3}(?!\d))/g, '$1\u202f').replace(UNIT, (_, d, u) => `${d}\u00a0${u === 'm2' ? 'm²' : u}`)

/** Deux-points selon la langue : « Édition : » en français, “Edition: ” en anglais (EDIT-04, I18N-07). */
export const colon = (lang: Lang) => (lang === 'fr' ? ' : ' : ': ')

/** Format des nombres anglais : « 2 500 m² » → « 2,500 m² ». */
export const enNumber = (s: string) => s.replace(/(\d)[\s\u00a0\u202f](?=\d{3}(?!\d))/g, '$1,').replace(UNIT, (_, d, u) => `${d}\u00a0${u === 'm2' ? 'm²' : u}`)
