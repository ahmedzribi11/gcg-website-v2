# Tiers, cookies et données personnelles (SEC-11, LEGAL-07, LEGAL-08, SEO-10)

## Registre des services tiers

| Service | Rôle | Chargé sur | Données transmises | Localisation | Propriétaire du compte | Autorisé par la CSP |
| --- | --- | --- | --- | --- | --- | --- |
| Hébergeur (Vercel ou Cloudflare) | diffusion du site, fonctions | toutes les pages | adresse IP, journaux techniques | États-Unis / réseau mondial | GCG | `'self'` |
| Resend | envoi par e-mail des demandes du formulaire | `/api/contact` (côté serveur) | nom, téléphone, e-mail, type, lieu, message | États-Unis | GCG | — (côté serveur) |
| GitHub | dépôt, connexion à l’espace de gestion | `/admin` uniquement | identifiant GitHub de l’éditeur | États-Unis | GCG | `connect-src https://api.github.com` (admin) |
| unpkg (Decap CMS 3.16.3, empreinte SRI) | interface de l’espace de gestion | `/admin` uniquement | adresse IP | réseau mondial | — | `script-src https://unpkg.com/decap-cms@3.16.3/` (admin) |
| YouTube (nocookie) ou Vimeo | vidéo de présentation | page À propos, **après clic** | adresse IP | États-Unis | GCG | `frame-src` |
| WhatsApp (wa.me) | conversation choisie par le visiteur | lien sortant | rien avant le clic | — | GCG | — (lien) |
| Umami (facultatif) | mesure d’audience sans cookie | toutes les pages si activé | pages vues, pays, appareil (sans IP stockée) | UE (cloud.umami.is) | GCG | ajouté automatiquement si activé |

Aucune police, carte, vidéo ou bibliothèque tierce n’est chargée avant une action du visiteur.
Les conditions de traitement des données (DPA) de chaque prestataire sont à archiver dans le coffre de GCG.

## Inventaire des cookies et du stockage (par modèle de page)

| Page | Cookies | Stockage local |
| --- | --- | --- |
| Toutes les pages publiques | aucun | aucun |
| Formulaire de contact | aucun | aucun (les données ne sont pas conservées par le site) |
| Vidéo (après clic) | cookies éventuels de YouTube nocookie ou Vimeo, après action du visiteur | — |
| `/admin` (éditeurs) | `gcg_oauth_state` (10 min, connexion) | session Decap (`decap-cms-user`), expirée après 8 h d’inactivité |

Conséquence : **pas de bandeau cookies** sur le site public (LEGAL-08), à confirmer par le conseil (LQ-04).

## Robots et moteurs de réponse (décision SEO-10)

- `robots.txt` autorise l’exploration de tout le site public par Google, Bing et les autres moteurs ;
  `/admin`, `/api` et les pages de redirection QR sont exclus et marqués `noindex`.
- **Décision** : les robots d’entraînement des IA (Google-Extended, GPTBot…) sont **autorisés**, car
  l’objectif du site est la visibilité de GCG. À revoir si GCG le demande.
- Aucune balise `nosnippet` sur les pages commerciales.

## Demandes d’exercice des droits et demandes de retrait (LEGAL-09, MEDIA-10)

1. La demande arrive par l’adresse de contact (ou le formulaire) : accusé de réception sous 2 jours ouvrés.
2. Vérifier l’identité du demandeur (réponse depuis l’adresse ou le numéro utilisé initialement).
3. Accès / rectification / suppression dans la boîte de réception de GCG et chez Resend (journaux).
4. Réponse écrite sous 30 jours ; noter la demande dans le journal ci-dessous.

**Demande de retrait d’un contenu** (image, texte ; procédure annoncée dans les mentions légales) : accusé de
réception sous 2 jours ouvrés, contenu retiré sous 72 heures pendant l’examen (passer le projet en
« Autorisation : en attente » ou retirer la photo dans `/admin`), décision notée dans le même journal.

| Date | Demande | Traitée par | Réponse le |
| --- | --- | --- | --- |
| | | | |

## Conservation (LEGAL-05)

Demandes sans suite : suppression au plus tard 24 mois après le dernier échange (proposition à confirmer par
le conseil, LQ-06). Mettre en place une règle de suppression ou un nettoyage semestriel dans la boîte de
réception qui reçoit les demandes ; Resend ne conserve les e-mails envoyés que quelques jours.
