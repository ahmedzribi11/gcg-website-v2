# Charte rédactionnelle et glossaire FR/EN (EDIT-05, EDIT-10)

## Ton

- Factuel, sûr, sans superlatif invérifiable : pas de « leader », « n° 1 », « meilleur ».
- Chaque chiffre (années, surfaces, nombre de villas, effectifs) provient de la fiche de faits validée par
  GCG (`fiche-de-faits.csv`). Pas de délai de réponse affiché sans engagement écrit de GCG.
- Les missions de GCG sont décrites exactement : ne jamais revendiquer une conception que GCG n’a pas faite.
- Les perspectives 3D sont signalées « Perspective » (FR) / « Rendering » (EN) ; les projets non livrés
  portent leur statut.

## Français

- Orthographe et typographie de l’Imprimerie nationale. Capitales accentuées (É, À, Ç).
- Espace insécable avant `:` ; espace fine insécable avant `; ! ?` et à l’intérieur des guillemets « ».
  Le site les applique automatiquement à la publication (`integrations/typography.mjs`).
- Apostrophe typographique ’ ; tiret demi-cadratin – pour les intervalles (2024 – 2025).
- Nombres : `12 500 m²` (espace fine insécable entre milliers, insécable avant l’unité), jamais `m2`.
- Dates : « 4 octobre 2026 ». Monnaie : `1 300 000 FCFA`.
- Titres en minuscules sauf la première lettre et les noms propres.
- Téléphone : `+225 07 00 00 00 00`.

## Anglais

- Anglais **britannique** (organisation, programme, colour), rédigé ou relu par un rédacteur professionnel :
  jamais une traduction automatique brute.
- Nombres : `12,500 m²` ; dates : « 4 October 2026 » ; monnaie : `FCFA 1,300,000` (code XOF si nécessaire).
- Les noms propres restent en français (Grand-Bassam, Riviera Golf, Hôtel du Golf).

## Noms exacts

| Forme | Usage |
| --- | --- |
| General Constructor Group CI | nom commercial ; la raison sociale exacte du RCCM est à confirmer par GCG |
| GCG | forme courte, définie une fois par page |
| Mövenpick | (et non « Movinpick ») |
| Riviera Golf, Riviera Palmeraie | (et non « Reveira ») |
| Immeuble bureautique Koné | |
| Grand-Bassam, Assinie, Assouindé, Attingué, Korhogo, Cocody, Bassam Modeste | |

## Glossaire des métiers (à faire valider par GCG)

| Français | English | Mots à éviter en anglais |
| --- | --- | --- |
| études / études de faisabilité | design and engineering studies / feasibility studies | « studies » seul |
| ingénierie | engineering | |
| architecture et conception | architecture and design | |
| clé en main | turnkey | |
| gros œuvre | structural works | « big works » |
| second œuvre | finishing works | « second works » |
| VRD (voirie et réseaux divers) | roads and utilities | « VRD » non expliqué |
| aménagement (intérieur / extérieur) | fit-out / landscaping | |
| maître d’ouvrage | client / owner | « master of work » |
| maîtrise d’œuvre | project management | |
| réception | handover | « reception » |
| réalisations | projects | « realisations » |
| responsable | manager / head of | « responsible » |
| en cours d’exécution | under construction | |
| en cours d’études | in design | |
| perspective (image 3D) | rendering | |

## Textes d’interface

Boutons, messages d’erreur, confirmations, textes alternatifs et e-mails de notification suivent les mêmes
règles que les pages. Les textes d’interface sont regroupés dans `src/i18n/index.ts` (une ligne FR, une ligne EN).
