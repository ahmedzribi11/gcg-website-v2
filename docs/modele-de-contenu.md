# Modèle de contenu (MODEL-01)

Le schéma fait foi : `src/content.config.ts` (types, champs obligatoires, valeurs permises) et
`scripts/check-content.mjs` (règles complémentaires). Un contenu qui ne les respecte pas **bloque le build** :
le site en ligne n’est jamais remplacé par une version cassée. L’espace de gestion (`public/admin/config.yml`)
reprend les mêmes règles et affiche les erreurs en français.

## Projet (`src/content/projects/<adresse>.json`)

L’adresse (nom du fichier) devient l’URL : `/realisations/<adresse>` et `/en/projects/<adresse>`.
Elle est générée à partir du nom, en minuscules sans accents, et **ne change jamais** après publication.

| Champ | Type | Obligatoire | Règle |
| --- | --- | --- | --- |
| `number` | entier | oui | unique ; ordre d’affichage |
| `name`, `name_en` | texte | `name` oui | `name_en` seulement s’il diffère |
| `sector` | liste fermée | oui | résidentiel, hôtellerie, équipements, industrie |
| `city` | liste fermée | oui | 19 localités (carte et filtres) ; nouvelle ville = ajout par l’équipe dans `src/data/geo.ts` |
| `location`, `location_en` | texte | `location` oui | lieu affiché (quartier) |
| `period`, `period_en` | texte | `period` oui | année ou intervalle ; l’année sert à la chronologie ; un projet en cours d’exécution avec la seule année affiche « Depuis 2023 » / « Since 2023 » (CONT-11) |
| `status` | liste fermée | non | en cours d’exécution, en cours d’études, réceptionné — vide si non confirmé |
| `designOnly` | booléen | non (défaut `false`) | missions d’études, de conception ou de permis seulement, sans travaux : sans statut, le projet porte la mention « Études uniquement » / « Design only » (CONT-12) |
| `surface`, `terrain`, `coveredSurface` | texte | non | ex. « 2 500 m² » |
| `duration`, `duration_en`, `workforce` | texte, texte, entier | non ; `duration_en` si `duration` est rempli et la version anglaise validée | chiffres clés du chantier dans la fiche : durée du chantier, effectif au plus fort (« 45 personnes ») ; seulement s’ils sont confirmés par GCG (COPY-04) |
| `composition`, `composition_en` | texte ≤ 300 caractères | FR oui ; EN si version anglaise validée | résumé |
| `story` | groupe | non | récit du projet (COPY-04) : `need` (« Le besoin »), `work` (« Ce que GCG a fait »), `result` (« Le résultat ») et leurs versions `_en`, 700 caractères au plus chacun ; seuls les paragraphes remplis s’affichent ; chaque `_en` est requis si le paragraphe français est rempli et la version anglaise validée |
| `typologies` | liste {nom, surface} | non | |
| `typology`, `typology_en` | texte | non | |
| `missions`, `missions_en` | liste de textes | FR oui ; EN si validée | missions exactes de GCG ; `missions_en` peut être vide si « a-traduire » |
| `services` | liste fermée | non | relie le projet aux pages Expertises |
| `types` | liste fermée | non | villas, résidences, immeubles, hôtels, loisirs, usines, équipements, infrastructures |
| `images` | liste | ≥ 1 | voir ci-dessous ; la première est la couverture |
| `featured`, `featuredOrder` | booléen, entier | non | projets phares de l’accueil et leur ordre |
| `highlight` | groupe | non | chiffre clé de l’accueil (CODE-03) : `value` et `unit` requis si le groupe est rempli ; `unit_en`, `note`, `note_en` ; `scaleOrder` (rang dans la grille « À toutes les échelles ») ; `marqueeOrder` (rang dans le bandeau des chiffres clés ; seuls les 4 premiers sont affichés), `marqueeName(_en)` et `marqueeFigure(_en)` (par défaut : nom du projet, « valeur unité ») ; `note_en` et `marqueeFigure_en` requis si la version anglaise est validée |
| `permission` | liste fermée | oui (défaut « en-attente ») | autorisation du client final ; « en-attente » = masqué quand `GCG_LAUNCH=1` |
| `en_status` | liste fermée | oui | « a-traduire » = page anglaise non publiée (CMS-10) |
| `seo_title(_en)`, `seo_description(_en)` | texte ≤ 70 / ≤ 170 caractères | non | remplacent le titre et la description de la page ; par défaut : « Nom · projet GCG, Côte d’Ivoire » et « résumé lieu, période », suivis des missions de GCG tant que la description tient en 155 caractères (SEO-04) |

### Image d’un projet

| Champ | Règle |
| --- | --- |
| `src` | JPG, PNG, WebP, AVIF ou HEIC (converti en JPG au build) ; ≤ 20 Mo ; ≥ 500 px de large (2 400 px recommandés pour la couverture) ; autre format refusé avec message. Au build, une photo avec métadonnées (EXIF, XMP, IPTC) ou de plus de 3 000 px est réécrite sur place sans elles et à 3 000 px au plus grand côté (OPS-07) |
| `alt`, `alt_en` | description de ce que montre l’image (5 à 140 caractères), obligatoire dans les deux langues |
| `kind` | `photo`, `render` (perspective 3D) ou `plan` ; une image `render` ou `plan` porte la mention « Perspective » / « Rendering » ou « Plan » / « Drawing » (UX-02) ; les cartes projet prennent la première `photo` comme couverture s’il y en a une |
| `focus` | facultatif, point à garder visible au recadrage (« 50% 30% ») |

## Paramètres (`src/data/settings.json`)

Coordonnées (téléphone, WhatsApp, e-mail, adresse, lien Google Maps, horaires), réseaux sociaux, vidéo de
présentation, documents PDF (titre FR/EN, langue, version AAAA-MM, fichier ≤ 10 Mo ; taille calculée au build).
Tout champ vide est masqué sur le site.

## Identité légale (`src/data/legal.json`, équipe uniquement)

Raison sociale (RCCM), forme juridique, capital, RCCM, compte contribuable, siège, directeur de la
publication, hébergeur. Alimente les mentions légales, la politique de confidentialité et les données
structurées.

## Règles de stabilité

- **Suppression** : désactivée dans l’espace de gestion. Un projet retiré doit recevoir une redirection 301
  vers la liste des projets ; le build l’exige (registre `src/data/published-slugs.json`).
- **Nouveaux projets** : le registre est complété à chaque build par les fiches présentes dans l’historique
  git (OPS-11) ; `npm run content:register` reste utile pour l’écrire sans git.
- **Évolution du schéma** : tout nouveau champ est facultatif ou a une valeur par défaut ; rendre un champ
  obligatoire s’accompagne d’une migration qui complète les fichiers existants.
- **Portabilité** : tout le contenu est en JSON et en images dans le dépôt Git ; un `git clone` suffit à
  l’exporter (testé le 4 octobre 2026).
