# Inventaire des composants et de leurs états (UX-06)

Toute nouvelle page se construit avec ces éléments, sans en inventer de nouveaux. Les styles communs sont
dans `src/styles/global.css` (couche `components`) ; les couleurs et les 6 tailles de texte sont des jetons
définis dans le même fichier (`@theme`).

**Règles communes à tous les éléments interactifs**

- **Focus clavier** : contour or de 2 px décalé de 3 px (`:focus-visible`), vert foncé sur fond clair. Jamais
  supprimé, sauf sur les champs de formulaire où la ligne inférieure passe à l’or.
- **Cible tactile** : 44 px au moins (boutons 52 px, pastilles et icônes 44 à 48 px).
- **Transitions** : 300 ms au plus, aucune animation en boucle ; tout est coupé avec
  `prefers-reduced-motion`.
- **Appuyé** (`:active`) : boutons et pastilles descendent de 1 px.
- **Désactivé** : opacité 55 %, curseur d’attente (seul cas : bouton d’envoi du formulaire pendant l’envoi).

| Composant | Fichier | Par défaut | Survol | Focus | Actif / courant | Désactivé |
| --- | --- | --- | --- | --- | --- | --- |
| En-tête | `components/Header.astro` | fond transparent sur le hero, puis fond sombre au défilement ; masqué en descendant, réapparaît en remontant | liens : texte blanc + soulignement animé | contour or | page courante : texte or + `aria-current="page"` | — |
| Menu mobile | `components/Header.astro` (`#mobile-menu`) | fermé, invisible et `aria-hidden` | — | contour or ; Échap ferme le menu | ouvert : plein écran, bouton « Fermer », `aria-expanded="true"` | — |
| Barre mobile (Réalisations / Appeler / WhatsApp) | `components/MobileBar.astro` | toujours visible en bas sous 768 px, dans un `<nav>` | — | contour or | — | « Appeler » absent sans téléphone ; « Contact » remplace WhatsApp sans numéro |
| Pied de page | `components/Footer.astro` | coordonnées connues, liens, documents, mentions légales | lien : soulignement animé, texte plus clair ; réseaux : contour or | contour or | — | champ vide = élément masqué |
| Bouton principal | `.btn.btn-gold` | fond or, texte vert | fond or clair, flèche +3 px | contour or (vert sur fond clair) | −1 px | 55 %, curseur d’attente |
| Bouton secondaire | `.btn.btn-line` (fond sombre), `.btn.btn-line-dark` (fond clair) | contour fin | contour plein + léger fond | contour or / vert | −1 px | idem |
| Bouton WhatsApp | `.btn.btn-gold` + icône WhatsApp | ouvre `wa.me` avec un message prérempli (nom de la page) | idem bouton principal | idem | idem | remplacé par « Contact » si aucun numéro WhatsApp |
| Bouton sombre | `.btn.btn-dark` (sections claires) | fond vert, texte clair | vert plus clair | contour vert | −1 px | idem |
| Lien souligné | `.link-line` | sans soulignement | soulignement qui se trace (300 ms) | contour or | — | — |
| Carte projet | `components/ProjectCard.astro` | photo 4/3, statut, nom, lieu, période | photo agrandie de 2 %, nom en or | contour or autour de la carte entière (un seul lien) | — | — |
| Barre de filtres | `views/ProjectsList.astro` (`.chip`) | pastilles à contour, compteur ; collante sous l’en-tête | contour plus visible | contour or | sélectionnée : fond clair, `aria-pressed="true"` ; résultat annoncé (`aria-live`) | — |
| Galerie | `views/ProjectDetail.astro` | grande image + 2 petites, puis rangées ; légende sous chaque photo ; mention « Perspective » sur les rendus | photo agrandie de 2 % | contour or | ouvre la visionneuse | — |
| Visionneuse (lightbox) | `views/ProjectDetail.astro` (`<dialog>`) | photo entière, légende, « 3 / 8 » annoncé | boutons : contour or | contour or ; le focus reste dans la visionneuse | flèches ← → du clavier, balayage, Échap ferme et rend le focus | précédent/suivant absents s’il n’y a qu’une photo |
| Tableau de faits | `views/ProjectDetail.astro` (`<dl>`) | libellé en petites capitales, valeur ; ligne absente si la donnée est vide | — | — | — | — |
| Bandeau d’appel à l’action | `components/FinalCta.astro` | titre, phrase, bouton principal + secondaire | voir boutons | voir boutons | — | WhatsApp absent si pas de numéro |
| Formulaire de contact | `views/Contact.astro` | 6 champs au plus, libellés visibles, champs obligatoires marqués | — | ligne inférieure or | envoi : bouton « Envoi… » désactivé ; succès : message qui reçoit le focus | erreur : ligne rouge, `aria-invalid`, message sous le champ ; échec d’envoi : message + saisie conservée |
| Carte de téléchargement | `components/Footer.astro`, `views/Share.astro` | titre, langue, version, « PDF · 2,4 Mo » | pied de page : soulignement, texte plus clair ; page Partager : texte or | contour or | — | carte absente tant qu’aucun document n’est publié |
| Fil d’Ariane | `components/Breadcrumb.astro` | Accueil › Rubrique › Page | lien en or | contour or | page courante sans lien, `aria-current="page"` | — |
| Sélecteur de langue | `components/Header.astro` (`[data-lang-switch]`) | pastille « EN » / « FR », `hreflang` et `lang` corrects | contour et texte plus clairs | contour or | mène à la même page dans l’autre langue ; si elle n’existe pas, à la liste avec un message | — |
| Lien d’évitement | `.skip-link` | hors écran | — | apparaît en haut à gauche | mène au contenu (`#main`) | — |
| Pastille de statut | `.pill[data-status]` | point coloré + statut (or : exécution ; vert pâle : études ; blanc : réceptionné) | — | — | — | absente si le statut n’est pas confirmé |
| Vidéo | `components/VideoFacade.astro` | image + bouton lecture ; rien n’est chargé chez YouTube/Vimeo | bouton plus visible | contour or | clic : charge la vidéo (youtube-nocookie) | absente sans lien vidéo |

## Jetons de couleur et contrastes (UX-01, UX-04, A11Y-04)

Palette tirée du logo GCG (vert profond et or). Tous les couples texte/fond utilisés dépassent 4,5:1 ;
les indicateurs de focus et les contours de composants dépassent 3:1.

| Jeton | Valeur | Couple utilisé | Contraste |
| --- | --- | --- | --- |
| `bone` sur `ink` | `#f2efe6` / `#070c09` | texte courant sur fond sombre | 17,1:1 |
| `bone` 75 % sur `ink` | | texte secondaire | 9,7:1 |
| `mist` sur `ink` / `ink-3` | `#a3a9a0` | libellés, métadonnées | 8,2:1 / 7,2:1 |
| `gold` sur `ink` | `#e8de9f` | accents, focus | 14,4:1 |
| `sage` sur `ink` | `#b9d4c2` | statut « en cours d’études » | 12,4:1 |
| `error` sur `ink` | `#ffb8ab` | messages d’erreur, contour des champs en erreur | 11,9:1 |
| `brand` sur `gold` / `gold-light` | `#052e14` | bouton principal (repos / survol) | 10,9:1 / 12,5:1 |
| `bone` / `gold` sur `brand` | | sections vertes | 13,0:1 / 10,9:1 |
| `brand` sur `paper` | `#f6f3eb` | sections claires | 13,5:1 |
| `brand` 75 % sur `paper` | | texte secondaire sur fond clair | 6,4:1 |
| `gold-deep` sur `paper` | `#6f6224` | accents sur fond clair | 5,5:1 |
| `doc-ink` / `doc-muted` sur blanc | `#1b2a20` / `#3a4a40` | liste de références imprimable | 15,0:1 / 9,4:1 |

**Texte sur photo** : toujours sur un dégradé `ink` (au moins 70 % d’opacité sous le texte), vérifié à 360,
768 et 1 440 px.

**Exceptions documentées** (valeurs brutes hors jetons) : la balise `theme-color` (`#052e14`, valeur littérale
exigée par les navigateurs) et les couleurs des QR codes exportés (`src/scripts/qr.ts` : `#052e14` sur blanc,
pour des fichiers SVG/PNG autonomes).

## Vérification

- Contrôle automatique à chaque modification : `scripts/browser-checks.mjs` (axe, débordements, console).
- Revue visuelle : comparer cette liste avec les pages `/`, `/realisations`, une page projet, `/contact`,
  `/partager` au clavier (Tab, Entrée, Échap) et à 320, 390 et 1440 px de large.
