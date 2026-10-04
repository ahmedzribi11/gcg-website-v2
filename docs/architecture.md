# Architecture du site GCG (vue d’ensemble)

## En une phrase

Un site **statique** (pages HTML générées à l’avance), bilingue, hébergé sur un CDN, avec trois petites
fonctions serveur (formulaire de contact, connexion à l’espace de gestion) et un espace de gestion
(Decap CMS) qui enregistre le contenu directement dans le dépôt GitHub.

```
 Éditeur GCG ──► /admin (Decap CMS) ──► GitHub (dépôt My-web, branche main)
                                              │  chaque publication
                                              ▼
                                   Build automatique (npm run build)
                                   1. contrôle du contenu (scripts/check-content.mjs)
                                   2. génération des pages FR/EN (Astro)
                                   3. typographie française (integrations/typography.mjs)
                                              │
                                              ▼
 Visiteur ◄── CDN (Vercel ou Cloudflare Pages) : pages, images optimisées, polices
                 │
                 ├─ /api/contact   → e-mail à GCG via Resend (aucune donnée stockée)
                 ├─ /api/auth      ┐ connexion GitHub de l’espace de gestion
                 └─ /api/callback  ┘
```

## Où se trouve quoi

| Élément | Emplacement | Modifié par |
| --- | --- | --- |
| Projets (un fichier par projet) | `src/content/projects/*.json` | GCG via /admin, ou l’équipe |
| Photos des projets | `src/assets/projects/<projet>/` | GCG via /admin |
| Coordonnées, réseaux, vidéo, documents PDF | `src/data/settings.json`, `public/documents/` | GCG via /admin |
| Identité légale (RCCM, forme, capital…) | `src/data/legal.json` | l’équipe uniquement |
| Expertises, organisation, publics | `src/data/*.ts` | l’équipe |
| Textes de l’interface FR/EN | `src/i18n/index.ts` | l’équipe |
| Schéma du contenu (règles de validation) | `src/content.config.ts` | l’équipe |
| Configuration de l’espace de gestion | `public/admin/config.yml` | l’équipe |
| En-têtes de sécurité, redirections | `vercel.json` (Vercel) ; `public/_headers`, `public/_redirects` (Cloudflare Pages) | l’équipe |
| Fonctions serveur | `server/*.js` (logique) ; `api/*.js` (Vercel) ; `functions/api/*.js` (Cloudflare) | l’équipe |
| Polices | `src/fonts/` (générées par `scripts/fonts.py`) | l’équipe |

## Choix techniques et raisons

- **Astro, sortie statique** : pages lisibles sans JavaScript ; aucune base de données à maintenir ni à
  sécuriser. L’accueil garde son ouverture 3D (three.js, chargée après l’affichage de la page) et les
  animations GSAP ; les autres pages s’affichent en 2 à 3 secondes sur mobile.
- **Aucun cookie, aucun traceur** : pas de bandeau cookies nécessaire. La mesure d’audience (Umami, sans
  cookie) ne s’active que si la variable `PUBLIC_UMAMI_WEBSITE_ID` est définie.
- **Images** : converties au build en WebP (repli JPEG), 15 tailles, métadonnées (GPS) supprimées.
- **Sécurité** : politique de sécurité du contenu (CSP) par empreintes générée par Astro, en-têtes HSTS,
  nosniff, Referrer-Policy, Permissions-Policy, interdiction d’intégration dans un cadre.
- **Hébergement interchangeable** : le même dépôt se déploie sur Vercel ou sur Cloudflare Pages
  (fichiers prêts pour les deux), ce qui permet de changer d’hébergeur en moins d’une heure.

## Variables d’environnement

| Variable | Rôle | Obligatoire |
| --- | --- | --- |
| `SITE_URL` | Domaine définitif (ex. `https://www.gcg-ci.com`) : URL canoniques, sitemap, QR codes | au lancement |
| `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` | Envoi du formulaire de contact par e-mail | pour activer le formulaire |
| `GITHUB_OAUTH_ID`, `GITHUB_OAUTH_SECRET` | Connexion à l’espace de gestion | pour /admin en production |
| `PUBLIC_UMAMI_WEBSITE_ID` (+ `PUBLIC_UMAMI_SRC`) | Mesure d’audience sans cookie | facultatif |
| `GCG_LAUNCH=1` | Masque les projets sans autorisation de publication du client | au lancement |
| `PRODUCTION_BRANCH` | Cloudflare Pages : branche de production (défaut `main`) | facultatif |

Les aperçus (branches, déploiements de test) sont automatiquement marqués `noindex`.
