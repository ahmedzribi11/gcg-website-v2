# Journal des modifications

Une entrée par mise en production (fusion dans `main`, déployée automatiquement). Les modifications de
contenu faites par GCG dans `/admin` sont tracées dans l’historique Git (« Mise à jour : … ») et résumées
dans les rapports de maintenance. Format : date, ce qui change pour les visiteurs et pour GCG, puis le détail
technique.

## 4 octobre 2026 — site séparé `gcg-website-v2` : même apparence, mise au niveau « production »

Même apparence et même comportement que le site en ligne (ouverture 3D, défilement fluide, bandeau défilant,
ordre de l’accueil, animations), avec :

- **Rapidité** : images en 15 tailles, polices chargées en priorité (plus de saut de mise en page), ouverture
  3D chargée après l’affichage de la page.
- **Accessibilité** : 0 erreur axe grave sur 23 pages en mobile et ordinateur ; descriptions FR/EN de chaque
  photo, visionneuse fermée par le bouton « retour » du téléphone, contrastes renforcés sur les sections claires.
- **Visible** : fil d’Ariane complet, secteur et statut cliquables sur les pages projet, barre mobile toujours
  visible, voile plus sombre sur les grandes photos, page 404 bilingue, impression A4 propre.
- **Formulaire de contact** : mêmes champs ; envoi par e-mail à GCG (Resend) dès que le service est configuré,
  protection anti-robots, pages de confirmation et d’erreur ; WhatsApp et e-mail restent possibles.
- **Pages légales** : mentions légales et politique de confidentialité FR/EN (identité de l’entreprise à
  compléter par GCG).
- **Espace de gestion** : circuit brouillon → relecture → publication, contrôles de contenu en français,
  description de chaque photo en FR et EN, nature des images (photo, perspective, plan), autorisation du
  client final, version anglaise « à traduire » tant qu’elle n’est pas relue, documents PDF.
- **Sécurité** : politique de sécurité du contenu (CSP) stricte, en-têtes HSTS, protection contre
  l’intégration en cadre, espace de gestion isolé, déconnexion après 8 h d’inactivité.
- **Référencement** : titres et descriptions uniques, fil d’Ariane, données structurées, pages d’aperçu en
  `noindex`, adresses de QR codes permanentes (`/qr/...`) avec marquage des campagnes.
- **Hébergement** : fichiers prêts pour Cloudflare Pages en plus de Vercel (changement d’hébergeur en moins
  d’une heure).
- **Qualité** : contrôles automatiques à chaque modification (types, contenu, liens, HTML, accessibilité,
  budgets Lighthouse, secrets, dépendances).
- **Dossier de remise** (`docs/`) : architecture, procédures, registre des comptes, guide de l’éditeur,
  charte rédactionnelle, registre des droits, fiche de faits, inventaire des composants.

## 4 octobre 2026 — site bilingue multipage (PR #3)

Refonte complète : site Astro statique, français et anglais, pages Réalisations, Expertises, À propos,
Investir, Contact, Partager (QR codes, affiche de chantier), Références imprimables, espace de gestion Decap CMS.

## 4 octobre 2026 — projets et identité GCG (PR #2)

Les 34 projets du portfolio avec leurs photos ; logo, couleurs, organisation et moyens matériels de GCG.

## 3 octobre 2026 — première version (PR #1)

Site d’une page avec hero 3D.
