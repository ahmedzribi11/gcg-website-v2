/**
 * Devis estimatif (demande de M. Chebbi, 24 octobre 2026). Fonctions pures, sans dépendance :
 * utilisées par la page /devis-estimatif, par server/contact.js et par les tests (tests/estimate.test.mjs).
 *
 * Règles :
 * - surface retenue = surface constructible si elle est indiquée, sinon ratioConstructible % de la surface du terrain ;
 * - construction = surface retenue × prixM2 (prix du m² construit fini) ;
 * - piscine, clôture : montants forfaitaires ; études et permis : pourcentage du coût de construction ;
 * - total = construction + options choisies ; affichage en fourchette ± marge %.
 * Une option dont le montant n’est pas renseigné (src/data/estimate.json) n’est pas proposée.
 */

/** Types de projet de la liste déroulante, dans l’ordre demandé. */
export const PROJECT_TYPES = ['villa', 'immeuble', 'local-commercial', 'autre']

/** Surface maximale acceptée, en m². */
export const MAX_AREA = 1000000

/** Montant ou pourcentage renseigné : nombre strictement positif. */
export const isSet = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0

/** Options proposées au visiteur selon les montants renseignés. */
export function availableOptions(cfg) {
  return {
    piscine: isSet(cfg.forfaitPiscine),
    cloture: isSet(cfg.forfaitCloture),
    etudes: isSet(cfg.pourcentageEtudes),
  }
}

/**
 * Surface saisie : nombre entier de m², de 1 à MAX_AREA. Les espaces sont ignorés (« 1 200 »).
 * Renvoie le nombre, null si le champ est vide, NaN si la valeur est invalide.
 */
export function parseArea(raw) {
  const s = String(raw ?? '').replace(/[\s\u00a0\u202f]/g, '')
  if (s === '') return null
  if (!/^\d+$/.test(s)) return NaN
  const n = Number(s)
  return n >= 1 && n <= MAX_AREA ? n : NaN
}

/**
 * Calcule l’estimation.
 * @param {{ terrain: number, constructible?: number | null, piscine?: boolean, cloture?: boolean, etudes?: boolean }} input
 * @param {{ prixM2: number, ratioConstructible: number, marge: number, forfaitPiscine?: number | null, forfaitCloture?: number | null, pourcentageEtudes?: number | null }} cfg
 */
export function computeEstimate(input, cfg) {
  const opts = availableOptions(cfg)
  const fromConstructible = isSet(input.constructible)
  const surface = fromConstructible ? input.constructible : (input.terrain * cfg.ratioConstructible) / 100
  const construction = Math.round(surface * cfg.prixM2)
  const piscine = input.piscine && opts.piscine ? Math.round(cfg.forfaitPiscine) : 0
  const cloture = input.cloture && opts.cloture ? Math.round(cfg.forfaitCloture) : 0
  const etudes = input.etudes && opts.etudes ? Math.round((construction * cfg.pourcentageEtudes) / 100) : 0
  const total = construction + piscine + cloture + etudes
  return {
    surface,
    fromConstructible,
    construction,
    piscine,
    cloture,
    etudes,
    total,
    low: Math.round((total * (100 - cfg.marge)) / 100),
    high: Math.round((total * (100 + cfg.marge)) / 100),
  }
}

/** 87500000 → « 87 500 000 » (espaces insécables entre les milliers). */
export function formatAmount(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}
