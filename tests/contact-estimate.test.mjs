// Envoi d’un devis estimatif par server/contact.js (Resend simulé) : node --test tests/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handleContact, validateEstimate } from '../server/contact.js'

const env = { RESEND_API_KEY: 'test', CONTACT_TO: 'contact@gcg-ci.com', CONTACT_FROM: 'Site GCG <site@gcg-ci.com>' }
const form = {
  kind: 'devis',
  nom: 'Kouassi',
  prenom: 'Awa',
  phone: '+225 07 00 00 00 00',
  email: 'awa@example.com',
  type: 'villa',
  terrain: '400',
  constructible: '250',
  piscine: 'non',
  cloture: 'oui',
  etudes: 'non',
  low: '78750000',
  high: '96250000',
  lang: 'fr',
  t: String(Date.now() - 10000),
}
const post = (body, ip) =>
  handleContact(
    new Request('https://www.gcg-ci.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
    ip,
  )

test('devis complet : e-mail envoyé avec coordonnées, surfaces, options et fourchette', async (t) => {
  let sent
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    sent = { url, body: JSON.parse(init.body) }
    return new Response('{}', { status: 200 })
  })
  const res = await post(form, '10.0.0.1')
  assert.equal(res.status, 200)
  assert.equal(sent.url, 'https://api.resend.com/emails')
  assert.deepEqual(sent.body.to, ['contact@gcg-ci.com'])
  assert.equal(sent.body.reply_to, 'awa@example.com')
  assert.equal(sent.body.subject, 'Devis estimatif — Awa Kouassi (Villa)')
  for (const line of [
    'Nom : Kouassi',
    'Prénom : Awa',
    'Téléphone / WhatsApp : +225 07 00 00 00 00',
    'E-mail : awa@example.com',
    'Type de projet : Villa',
    'Surface du terrain : 400 m²',
    'Surface constructible : 250 m²',
    'Piscine : Non',
    'Clôture : Oui',
    'Études et permis de construire : Non',
    'Estimation affichée au client : entre 78 750 000 FCFA et 96 250 000 FCFA',
  ])
    assert.ok(sent.body.text.includes(line), line)
})

test('devis sans téléphone, sans terrain ou avec un type inconnu : refusé, rien envoyé', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('{}'))
  const res = await post({ ...form, phone: '', terrain: '', type: 'chateau' }, '10.0.0.2')
  assert.equal(res.status, 422)
  const body = await res.json()
  assert.deepEqual(Object.keys(body.errors).sort(), ['phone', 'terrain', 'type'])
  assert.equal(fetch.mock.callCount(), 0)
})

test('devis : surface constructible vide acceptée, fourchette absente (sans JavaScript) signalée', () => {
  const { data, errors } = validateEstimate({ ...form, constructible: '', low: '', high: '' })
  assert.equal(errors, undefined)
  assert.equal(data.constructible, null)
  assert.equal(data.low, 0)
})

test('formulaire de contact classique inchangé : kind absent', async (t) => {
  let sent
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    sent = JSON.parse(init.body)
    return new Response('{}')
  })
  const res = await post({ name: 'Awa Kouassi', phone: '+225 07 00 00 00 00', type: 'villa', lang: 'fr', t: String(Date.now() - 10000) }, '10.0.0.3')
  assert.equal(res.status, 200)
  assert.ok(sent.subject.startsWith('Demande de projet — Awa Kouassi'))
})
