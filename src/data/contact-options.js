/**
 * Choix du formulaire de contact : « Vous êtes » (PROFILES) et « Type de projet » (PROJECT_TYPES).
 * Clé = code envoyé par le formulaire ; valeur = libellés affichés. Source unique : la page Contact
 * (src/views/Contact.astro) affiche ces libellés et le serveur (server/contact.js) les écrit en clair dans
 * l’e-mail reçu par GCG, au lieu du code (OPS-06).
 * Fichier JavaScript, et non TypeScript : la fonction de l’hébergeur l’importe telle quelle, sans compilation.
 */
export const PROFILES = {
  particulier: { fr: 'Particulier', en: 'Private owner' },
  diaspora: { fr: 'Particulier de la diaspora', en: 'Member of the diaspora' },
  investisseur: { fr: 'Investisseur / promoteur', en: 'Investor / developer' },
  hotelier: { fr: 'Hôtelier / tourisme', en: 'Hotel / tourism operator' },
  entreprise: { fr: 'Entreprise / industriel', en: 'Company / manufacturer' },
  autre: { fr: 'Autre', en: 'Other' },
}

export const PROJECT_TYPES = {
  villa: { fr: 'Villa', en: 'Villa' },
  residence: { fr: 'Résidence / lotissement', en: 'Residence / estate' },
  immeuble: { fr: 'Immeuble', en: 'Building' },
  hotel: { fr: 'Hôtel / resort', en: 'Hotel / resort' },
  commerce: { fr: 'Restaurant / commerce / loisirs', en: 'Restaurant / retail / leisure' },
  industrie: { fr: 'Usine / entrepôt', en: 'Factory / warehouse' },
  equipement: { fr: 'École / équipement', en: 'School / facility' },
  vrd: { fr: 'Infrastructures / VRD', en: 'Infrastructure / roads' },
  renovation: { fr: 'Rénovation / mise à niveau', en: 'Renovation / upgrade' },
  etude: { fr: 'Étude / architecture seule', en: 'Design studies / architecture only' },
  autre: { fr: 'Autre', en: 'Other' },
}
