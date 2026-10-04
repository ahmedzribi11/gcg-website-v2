# GCG — General Constructor Group CI

Site commercial de General Constructor Group (construction et ingénierie, Côte d’Ivoire, depuis 2016) :
projets, expertises, organisation, contact, outils de partage par QR code et documents pour les appels
d’offres. Bilingue français / anglais.

Astro (site statique multipage) · React Three Fiber (ouverture 3D de l’accueil) · GSAP + Lenis (animations,
défilement) · Tailwind CSS v4 · Decap CMS (espace de gestion) · fonctions serveur pour le formulaire et la
connexion à l’espace de gestion.

> **Site séparé.** Ce dépôt reprend à l’identique l’apparence et le comportement du site en ligne (dépôt
> `My-web`, qui n’est pas modifié), avec en plus la sécurité, le référencement, l’accessibilité, les pages
> légales, l’envoi du formulaire par e-mail et l’espace de gestion amélioré.

Prérequis : **Node.js 22** (voir `.nvmrc` ; 20.19+ accepté) et npm.

```bash
git clone https://github.com/ahmedzribi11/gcg-website-v2.git
cd gcg-website-v2
npm ci
npm run dev          # développement → http://localhost:4321
npm run build        # contrôle du contenu puis build de production (dist/)
npm run preview      # prévisualiser le build → http://localhost:4321
npm run check        # vérification des types et du schéma
npm run audit:site   # SEO, liens, langues, titres sur dist/ (après le build)
```

**Documentation de remise (en français) : [`docs/`](docs/README.md)** — architecture, procédures
(déploiement, retour arrière, restauration, DNS, lancement, incidents), registre des comptes, guide de
l’éditeur, charte rédactionnelle, registres des faits et des droits. Modifications : [`CHANGELOG.md`](CHANGELOG.md).

## Pages

| Français | English | Contenu |
| --- | --- | --- |
| `/` | `/en` | Accueil : expertises, typologies, projets phares, envergure, présence, publics |
| `/expertises`, `/expertises/<métier>` | `/en/services`, `/en/services/<service>` | Les 8 métiers, chacun avec ses projets |
| `/realisations`, `/realisations/<projet>` | `/en/projects`, `/en/projects/<project>` | Projets, filtres (secteur, statut, ville, typologie), carte, une page par projet |
| `/a-propos` | `/en/about` | Histoire, chronologie, organisation, moyens matériels, présence |
| `/investir` | `/en/invest` | Investisseurs, hôtellerie, diaspora, entreprises |
| `/contact` (+ `/merci`, `/erreur`) | `/en/contact` (+ `/thanks`, `/error`) | Formulaire (e-mail à GCG), WhatsApp, coordonnées |
| `/partager`, `/partager/affiche` | `/en/share`, `/en/share/poster` | QR codes (SVG/PNG), affiche A4 de chantier |
| `/references` | `/en/references` | Liste de références imprimable pour les appels d’offres |
| `/mentions-legales`, `/confidentialite` | `/en/legal-notice`, `/en/privacy` | Pages légales |
| `/qr/...` | | Adresses permanentes des QR codes imprimés (redirection + marquage de campagne) |
| `/admin` | | Espace de gestion |

Les anciennes adresses `/projets/<projet>` redirigent vers `/realisations/<projet>`.

## Contenu : la règle d’or

Le portfolio **« Portfolio GCG_CI.pdf »** et les informations transmises par GCG sont les seules sources.
Rien n’est inventé : un champ vide n’est pas affiché (pas de faux chiffres, clients, certifications ni
coordonnées). Les faits publiés sont listés dans `docs/fiche-de-faits.csv` pour validation par GCG.

| Contenu | Fichier |
| --- | --- |
| Projets (un fichier par projet) | `src/content/projects/<projet>.json` |
| Photos des projets | `src/assets/projects/<projet>/` (optimisées au build) |
| Coordonnées, réseaux, vidéo, documents PDF | `src/data/settings.json`, `public/documents/` |
| Identité légale (RCCM, forme, capital, directeur de la publication) | `src/data/legal.json` |
| Expertises, organisation, publics | `src/data/services.ts`, `organisation.ts`, `audiences.ts` |
| Textes de l’interface FR/EN | `src/i18n/index.ts` |
| Villes (carte et filtres) | `src/data/geo.ts` + `CITIES` dans `src/content.config.ts` |

Le schéma est dans `src/content.config.ts`, complété par `scripts/check-content.mjs` (images, adresses
publiées, documents). **Un contenu incomplet bloque le build** avec un message en français : le site en
ligne n’est jamais remplacé par une version cassée. Détail des champs : `docs/modele-de-contenu.md`.

## Espace de gestion (/admin)

Decap CMS édite les mêmes fichiers JSON et les enregistre dans GitHub (brouillon → révision → publication).
Chaque publication redéploie le site en 2 à 5 minutes. Guide : `docs/guide-editeur.md`.

### Activer la connexion en production (une seule fois)

1. GitHub (organisation de GCG) → *Settings → Developer settings → OAuth Apps → New OAuth App* :
   - Homepage URL : `https://<domaine>`
   - Authorization callback URL : `https://<domaine>/api/callback`
2. Hébergeur → variables d’environnement `GITHUB_OAUTH_ID` et `GITHUB_OAUTH_SECRET`, puis redéployer.
3. Chaque éditeur a un compte GitHub (avec double authentification) ajouté comme collaborateur du dépôt.
4. Facultatif : `preview_context` dans `public/admin/config.yml` (nom exact du statut de déploiement de
   l’hébergeur) pour afficher le lien d’aperçu des brouillons.

### Éditer en local, sans GitHub

```bash
npm run cms   # terminal 1 : serveur local Decap (port 8081)
npm run dev   # terminal 2
```

Ouvrir http://localhost:4321/admin → *Se connecter* : les fichiers sont modifiés directement sur le disque.

## Hébergement

Le même dépôt se déploie sur **Vercel** (`vercel.json`, fonctions `api/`) ou **Cloudflare Pages**
(`public/_headers`, `public/_redirects`, fonctions `functions/api/`). La logique serveur commune est dans
`server/`.

> **Usage commercial** : l’offre gratuite Vercel *Hobby* est réservée à un usage non commercial. Pour le
> site de GCG : **Vercel Pro**, ou **Cloudflare Pages** (offre gratuite, usage commercial autorisé).
> Procédure : `docs/exploitation.md`, section 6.

Build : `npm run build`, dossier `dist`, Node 22. Variables d’environnement :

| Variable | Rôle |
| --- | --- |
| `SITE_URL` | Domaine définitif (canoniques, sitemap, QR codes) |
| `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` | Envoi du formulaire de contact par e-mail |
| `GITHUB_OAUTH_ID`, `GITHUB_OAUTH_SECRET` | Connexion à l’espace de gestion |
| `GCG_LAUNCH=1` | Masque les projets sans autorisation de publication du client |
| `PUBLIC_UMAMI_WEBSITE_ID`, `PUBLIC_UMAMI_SRC` | Mesure d’audience sans cookie (facultatif) |
| `PRODUCTION_BRANCH` | Cloudflare Pages : branche de production (défaut `main`) |

Les déploiements d’aperçu sont marqués `noindex` automatiquement. Chaque push sur `main` redéploie.

## Qualité

À chaque pull request, `.github/workflows/qualite.yml` vérifie : dépendances (`npm audit`), types et
schéma, build, SEO et liens (`scripts/audit-dist.mjs`), HTML (Nu Html Checker), accessibilité axe,
console et débordements dans Chromium (`scripts/browser-checks.mjs`), budgets Lighthouse
(`lighthouserc.json`) et secrets (gitleaks). Dependabot propose les mises à jour chaque mois.

Autres scripts : `npm run content:register` (enregistre les adresses des nouveaux projets),
`node scripts/export-registers.mjs` (régénère les registres CSV de `docs/`), `npm run fonts`
(sous-ensembles des polices, Python + fontTools).

## Structure

```
api/                 fonctions Vercel (formulaire, connexion /admin)
functions/api/       mêmes fonctions pour Cloudflare Pages
server/              logique serveur commune (contact.js, oauth.js)
integrations/        typographie française appliquée au build
public/admin/        configuration de l’espace de gestion (config.yml)
public/brand/        logos GCG
scripts/             contrôle du contenu, audits, registres, polices
src/assets/projects/ photos des projets
src/components/      en-tête, pied de page, cartes projet, carte de présence, sections de l’accueil
src/content/         projets (JSON)
src/data/            paramètres, identité légale, expertises, organisation, publics, géographie
src/fonts/           polices auto-hébergées (sous-ensembles)
src/i18n/            routes et textes FR/EN
src/layouts/         gabarit HTML (SEO, Open Graph, hreflang, données structurées)
src/lib/             accès aux projets, paramètres, SEO, environnement
src/pages/           routes FR et EN
src/scripts/         navigation, animation d’ouverture, QR codes, aperçus, mesure d’audience
src/styles/          jetons de design, composants, impression
src/views/           pages partagées entre FR et EN
docs/                dossier de remise (FR)
```
