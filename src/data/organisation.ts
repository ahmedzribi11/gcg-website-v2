/**
 * Organisation et moyens matériels — « Portfolio GCG_CI.pdf », pages 4 et 5.
 * Les noms et photos des collaborateurs ne sont volontairement pas publiés.
 */
type L<T> = { fr: T; en: T }

export const keyFigures: { value: number; suffix?: string; label: L<string> }[] = [
  { value: 20, suffix: '+', label: { fr: 'Collaborateurs', en: 'Staff' } },
  { value: 4, label: { fr: 'Pôles opérationnels', en: 'Operating divisions' } },
  { value: 6, label: { fr: 'Techniciens terrain', en: 'Field technicians' } },
  { value: 1, label: { fr: 'Pilotage centralisé', en: 'Central management' } },
]

export const poles: { name: L<string>; team: string; role: L<string> }[] = [
  {
    name: { fr: 'Construction', en: 'Construction' },
    team: '12+',
    role: { fr: 'Direction technique, chefs de projet, équipes chantier', en: 'Technical management, project managers, site teams' },
  },
  {
    name: { fr: 'Études & contrôle qualité', en: 'Engineering studies & quality control' },
    team: '6+',
    role: { fr: 'Ingénierie, structure, contrôle qualité', en: 'Engineering, structure, quality control' },
  },
  { name: { fr: 'Finances', en: 'Finance' }, team: '4+', role: { fr: 'Direction financière et comptabilité', en: 'Financial management and accounting' } },
  { name: { fr: 'Logistique', en: 'Logistics' }, team: '4+', role: { fr: 'Matériel, approvisionnement, coordination', en: 'Equipment, supply, coordination' } },
]

export const competences: { name: L<string>; items: L<string[]> }[] = [
  {
    name: { fr: 'Construction', en: 'Construction' },
    items: { fr: ['Gros œuvre', 'Second œuvre', 'Finitions'], en: ['Structural works', 'Finishing works', 'Finishes'] },
  },
  { name: { fr: 'Études', en: 'Engineering studies' }, items: { fr: ['Architecture', 'Structure', 'BIM'], en: ['Architecture', 'Structure', 'BIM'] } },
  {
    name: { fr: 'Contrôle qualité', en: 'Quality control' },
    items: { fr: ['QA/QC', 'Suivi chantier', 'Réception'], en: ['QA/QC', 'Site supervision', 'Handover'] },
  },
  { name: { fr: 'Gestion', en: 'Management' }, items: { fr: ['Planning', 'Reporting', 'Coordination'], en: ['Planning', 'Reporting', 'Coordination'] } },
]

export const equipment: { name: L<string>; items: { name: string; qty: number }[] }[] = [
  {
    name: { fr: 'Engins', en: 'Heavy machinery' },
    items: [
      { name: 'Caterpillar 325 CL', qty: 1 },
      { name: 'Caterpillar 325 BL', qty: 1 },
      { name: 'Komatsu AW380', qty: 1 },
      { name: 'Caterpillar', qty: 1 },
      { name: 'Case TX 170-45', qty: 2 },
    ],
  },
  {
    name: { fr: 'Équipements de chantier', en: 'Site equipment' },
    items: [
      { name: 'Ingeco 750 L', qty: 4 },
      { name: 'Sogi-Bem 200', qty: 2 },
      { name: 'Kohler 100 kVA', qty: 1 },
      { name: 'Perkins 150 kVA', qty: 1 },
      { name: 'Perkins 100 kVA', qty: 2 },
    ],
  },
]

/** Véhicules publiés en totaux (le détail du parc n’a pas d’intérêt commercial). */
export const vehicles: { name: L<string>; qty: number }[] = [
  { name: { fr: 'Voitures de service', en: 'Service vehicles' }, qty: 6 },
  { name: { fr: 'Pick-up & utilitaires', en: 'Pick-ups & utility vehicles' }, qty: 3 },
]

export const totalQty = (items: { qty: number }[]) => items.reduce((n, i) => n + i.qty, 0)
