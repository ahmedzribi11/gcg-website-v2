# Maintenance : périmètre, mises à jour et revue annuelle (HAND-04, HAND-05, HAND-09)

> **À compléter à la signature.** Le nom des formules, leur prix, le nombre de modifications incluses et le
> report éventuel des modifications non utilisées sont **recopiés mot pour mot de la grille tarifaire**
> remise à GCG. Ce document ne doit rien ajouter ni retirer à cette grille.

## Formule souscrite

| Élément | Valeur (copie de la grille tarifaire) |
| --- | --- |
| Formule | |
| Prix et périodicité | |
| Modifications incluses par mois | |
| Report des modifications non utilisées | oui / non |
| Date de début, préavis d’arrêt | |

## Définitions

- **Modification** : une demande unitaire portant sur une page ou un projet existant (texte, photos,
  coordonnées, ajout d’un projet complet à partir des éléments fournis selon le modèle de demande du
  `guide-editeur.md`, section 10). Une nouvelle page, une nouvelle fonction ou un changement de présentation
  est un **devis séparé**.
- **Mise à jour technique** : mise à jour des dépendances et de la plateforme ; toujours incluse.
- **Incident** : voir les niveaux S1 à S3 et les délais dans `exploitation.md`, section 7.

## Inclus dans toute formule

- Mises à jour des dépendances chaque mois, et sous **72 h** pour une faille critique touchant le site.
- Surveillance de la disponibilité, renouvellement du certificat HTTPS (automatique).
- Traduction anglaise de chaque ajout fait par l’équipe (relue, jamais une traduction automatique brute).
- Rapport mensuel court : modifications faites (extrait de `CHANGELOG.md`), mises à jour, incidents.

## Hors périmètre

- Reportages photo ou vidéo sur site, drone.
- Impression (affiches, panneaux, cartes, brochures).
- Assistance le jour même hors incident S1.
- Rédaction de contenus nouveaux non fournis par GCG ; conseil juridique.
- Frais des services tiers (domaine, hébergement payant, messagerie), facturés directement à GCG.

## Journal des mises à jour (HAND-05)

| Date | Mise à jour | Faille corrigée (oui/non, délai) | Par | Vérifié (build + contrôles) |
| --- | --- | --- | --- | --- |
| 4 octobre 2026 | toutes les dépendances à jour ; `npm audit` : 0 vulnérabilité | non | équipe | oui |

## Contrôle hebdomadaire du formulaire (HOST-09)

Chaque semaine : envoyer une demande de test depuis `/contact` (nom « Test hebdomadaire ») et vérifier qu’elle
arrive dans la boîte de GCG, hors courrier indésirable, en moins de 2 minutes.

| Semaine | Date | Reçu (oui/non, délai) | Par |
| --- | --- | --- | --- |
| | | | |

## Revue annuelle (HAND-09)

Chaque année, à la date anniversaire du lancement :

1. Renouvellement du domaine (date d’expiration, renouvellement automatique actif, moyen de paiement valide).
2. Pages légales : identité, hébergeur, durée de conservation, sous-traitants (`tiers-et-confidentialite.md`).
3. Fraîcheur du contenu : projets livrés dans l’année ajoutés, statuts mis à jour, coordonnées exactes.
4. Revue des comptes et des accès (`comptes.md`).
5. Nouvel audit complet selon la grille qualité ; écarts notés et planifiés.

| Année | Date | Par | Rapport |
| --- | --- | --- | --- |
| | | | |
