// Tests du devis estimatif : node --test tests/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { availableOptions, computeEstimate, formatAmount, parseArea } from '../src/lib/estimate.js'

const base = { prixM2: 350000, ratioConstructible: 60, marge: 10, forfaitPiscine: null, forfaitCloture: null, pourcentageEtudes: null }
const nb = (s) => s.replace(/\u00a0/g, ' ')

test('exemple de M. Chebbi : 250 m² constructibles, sans option', () => {
  const r = computeEstimate({ terrain: 400, constructible: 250 }, base)
  assert.equal(r.construction, 87500000)
  assert.equal(r.total, 87500000)
  assert.equal(r.low, 78750000)
  assert.equal(r.high, 96250000)
  assert.equal(`Estimation entre ${nb(formatAmount(r.low))} et ${nb(formatAmount(r.high))} FCFA`, 'Estimation entre 78 750 000 et 96 250 000 FCFA')
})

test('surface constructible vide : 60 % du terrain', () => {
  const r = computeEstimate({ terrain: 500, constructible: null }, base)
  assert.equal(r.fromConstructible, false)
  assert.equal(r.surface, 300)
  assert.equal(r.construction, 105000000)
  assert.equal(r.low, 94500000)
  assert.equal(r.high, 115500000)
})

test('surface non multiple : arrondi au franc', () => {
  const r = computeEstimate({ terrain: 333 }, base)
  assert.equal(r.surface, 199.8)
  assert.equal(r.construction, 69930000)
  assert.equal(r.low, 62937000)
  assert.equal(r.high, 76923000)
})

test('options non renseignées : non proposées et sans effet', () => {
  assert.deepEqual(availableOptions(base), { piscine: false, cloture: false, etudes: false })
  const r = computeEstimate({ terrain: 400, constructible: 250, piscine: true, cloture: true, etudes: true }, base)
  assert.equal(r.total, 87500000)
})

test('options renseignées : forfaits et pourcentage', () => {
  const cfg = { ...base, forfaitPiscine: 15000000, forfaitCloture: 5000000, pourcentageEtudes: 8 }
  assert.deepEqual(availableOptions(cfg), { piscine: true, cloture: true, etudes: true })
  const r = computeEstimate({ terrain: 400, constructible: 250, piscine: true, cloture: false, etudes: true }, cfg)
  assert.equal(r.piscine, 15000000)
  assert.equal(r.cloture, 0)
  assert.equal(r.etudes, 7000000)
  assert.equal(r.total, 109500000)
  assert.equal(r.low, 98550000)
  assert.equal(r.high, 120450000)
})

test('montant à 0 ou vide : option masquée', () => {
  assert.deepEqual(availableOptions({ ...base, forfaitPiscine: 0, forfaitCloture: '', pourcentageEtudes: undefined }), {
    piscine: false,
    cloture: false,
    etudes: false,
  })
})

test('saisie des surfaces', () => {
  assert.equal(parseArea(''), null)
  assert.equal(parseArea('  '), null)
  assert.equal(parseArea('250'), 250)
  assert.equal(parseArea('1 200'), 1200)
  assert.ok(Number.isNaN(parseArea('0')))
  assert.ok(Number.isNaN(parseArea('12,5')))
  assert.ok(Number.isNaN(parseArea('-3')))
  assert.ok(Number.isNaN(parseArea('abc')))
  assert.ok(Number.isNaN(parseArea('1000001')))
})

test('formatAmount', () => {
  assert.equal(nb(formatAmount(0)), '0')
  assert.equal(nb(formatAmount(999)), '999')
  assert.equal(nb(formatAmount(1000)), '1 000')
  assert.equal(nb(formatAmount(87500000)), '87 500 000')
})

test('configuration livrée : valeurs de M. Chebbi', () => {
  const cfg = JSON.parse(readFileSync(new URL('../src/data/estimate.json', import.meta.url), 'utf8'))
  assert.equal(cfg.prixM2, 350000)
  assert.equal(cfg.ratioConstructible, 60)
  assert.equal(cfg.marge, 10)
})
