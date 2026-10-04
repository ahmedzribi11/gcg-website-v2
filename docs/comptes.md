# Comptes et accès (registre IAM-01)

**Principe : GCG possède chaque compte.** Chaque compte est ouvert avec une adresse de rôle de GCG
(par exemple `web@<domaine-gcg>`), au nom de General Constructor Group CI, facturé à GCG. L’équipe y est
invitée comme utilisateur délégué, nommé et révocable. Aucun compte sous l’adresse personnelle d’un
développeur. Les mots de passe et codes de secours sont rangés dans un coffre (gestionnaire de mots de
passe) appartenant à GCG — jamais envoyés par e-mail ou WhatsApp.

> Ce fichier est un modèle : il ne doit contenir **aucun mot de passe, jeton ni code de secours**.
> Le registre rempli est conservé dans le coffre de GCG.

## Registre

| Compte | Propriétaire (GCG) | Administrateurs (≥ 2) | Rôle de l’équipe | MFA | Récupération | Renouvellement / coût | Facturé à |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Registrar du domaine (NIC.CI pour `.ci` ou registrar `.com`) | à créer | GCG + responsable technique | délégué technique | à activer | codes rangés dans le coffre | annuel, renouvellement automatique | GCG |
| DNS (registrar ou Cloudflare) | à créer | GCG + responsable technique | éditeur DNS | à activer | idem | — | GCG |
| Hébergement : Vercel (plan **Pro** requis pour un usage commercial) ou Cloudflare Pages (gratuit) | à transférer | GCG + responsable technique | membre | à activer | idem | mensuel (Vercel Pro) ou 0 | GCG |
| GitHub : dépôt `My-web` (à transférer vers une organisation GCG) | à transférer | GCG + responsable technique | écriture ; branche `main` protégée | à activer | idem | 0 | — |
| GitHub OAuth App (connexion /admin) | organisation GCG | responsable technique | — | via GitHub | — | 0 | — |
| Éditeurs de l’espace de gestion (comptes GitHub) | personne nommée de GCG | — | — | obligatoire | — | 0 | — |
| Resend (envoi du formulaire) | à créer | GCG + responsable technique | développeur | à activer | idem | gratuit jusqu’à 3 000 e-mails/mois | GCG |
| Messagerie professionnelle (option C) | à créer | GCG | aucun | à activer | idem | selon fournisseur | GCG |
| Adresse e-mail historique de GCG (adresse de récupération de tous les comptes) | GCG | GCG | aucun | **à vérifier en priorité (IAM-05)** | téléphone de récupération de GCG | — | — |
| Google Search Console (propriété « domaine ») | à créer | GCG + responsable technique | utilisateur complet | via Google | — | 0 | — |
| Bing Webmaster Tools | à créer | GCG | utilisateur | via Microsoft | — | 0 | — |
| Google Business Profile | à créer / revendiquer | GCG | gestionnaire | via Google | — | 0 | — |
| WhatsApp Business (numéro affiché sur le site) | GCG | GCG | aucun | vérification en deux étapes | — | 0 | — |
| Mesure d’audience Umami (facultatif) | à créer | GCG + responsable technique | lecture | à activer | — | 0 (offre gratuite) | GCG |
| Surveillance de disponibilité (ex. UptimeRobot) | à créer | GCG + responsable technique | administrateur | à activer | — | 0 | GCG |
| Gestionnaire de mots de passe (coffre) | GCG | GCG + responsable technique | membre | obligatoire | kit de secours imprimé chez GCG | annuel | GCG |

## Règles

- **MFA partout**, de préférence clé de sécurité, passkey ou application d’authentification ; SMS en dernier recours.
  Priorité : adresse e-mail de récupération, registrar, DNS, hébergeur, GitHub.
- **Au moins deux administrateurs** (GCG + responsable technique) sur le registrar, le DNS, l’hébergeur et la
  messagerie ; les éditeurs de contenu n’ont accès qu’à `/admin`.
- **Codes de secours** de chaque compte critique dans le coffre de GCG ; un essai de connexion avec un code
  de secours est fait une fois avant le lancement (IAM-06).
- **Alertes** (SEC-20) : changements au registrar et au DNS, nouvelles connexions, déploiements en échec,
  envoyées aux deux membres de l’équipe.
- **Revue trimestrielle** des comptes et des rôles, notée ci-dessous.
- **Départ d’une personne** : procédure de `exploitation.md`, section 8, sous 24 h.
- **Sortie propre** : si la maintenance s’arrête, l’équipe retire ses propres accès sous 7 jours à la demande
  de GCG ; le site continue de fonctionner sur les comptes de GCG.

## Journal des revues d’accès

| Date | Par | Comptes revus | Changements |
| --- | --- | --- | --- |
| | | | |
