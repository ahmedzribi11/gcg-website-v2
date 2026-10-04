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
| `period`, `period_en` | texte | `period` oui | année ou intervalle ; l’année sert à la chronologie |
| `status` | liste fermée | non | en cours d’exécution, en cours d’études, réceptionné — vide si non confirmé |
| `surface`, `terrain`, `coveredSurface` | texte | non | ex. « 2 500 m² » |
| `composition`, `composition_en` | texte ≤ 300 caractères | FR oui ; EN si version anglaise validée | résumé |
| `typologies` | liste {nom, surface} | non | |
| `typology`, `typology_en` | texte | non | |
| `missions`, `missions_en` | liste de textes | FR oui ; EN si validée | missions exactes de GCG |
| `services` | liste fermée | non | relie le projet aux pages Expertises |
| `types` | liste fermée | non | villas, résidences, immeubles, hôtels, loisirs, usines, équipements, infrastructures |
| `images` | liste | ≥ 1 | voir ci-dessous ; la première est la couverture |
| `featured`, `featuredOrder` | booléen, entier | non | projets phares de l’accueil et leur ordre |
| `permission` | liste fermée | oui (défaut « en-attente ») | autorisation du client final ; « en-attente » = masqué quand `GCG_LAUNCH=1` |
| `en_status` | liste fermée | oui | « a-traduire » = page anglaise non publiée (CMS-10) |
| `seo_title(_en)`, `seo_description(_en)` | texte | non | par défaut : nom et résumé |

### Image d’un projet

| Champ | Règle |
| --- | --- |
| `src` | JPG, PNG, WebP, AVIF ou HEIC (converti en JPG au build) ; ≤ 20 Mo ; ≥ 500 px de large (2 400 px recommandés pour la couverture) ; autre format refusé avec message |
| `alt`, `alt_en` | description de ce que montre l’image (5 à 140 caractères), obligatoire dans les deux langues |
| `kind` | `photo`, `render` (perspective 3D, signalée sur le site) ou `plan` |
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
- **Nouveaux projets** : `npm run content:register` les ajoute au registre des adresses publiées.
- **Évolution du schéma** : tout nouveau champ est facultatif ou a une valeur par défaut ; rendre un champ
  obligatoire s’accompagne d’une migration qui complète les fichiers existants.
- **Portabilité** : tout le contenu est en JSON et en images dans le dépôt Git ; un `git clone` suffit à
  l’exporter (testé le 4 octobre 2026).
