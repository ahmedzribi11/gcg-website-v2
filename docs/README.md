# Dossier de remise du site GCG (HAND-01)

Tout ce qu’il faut pour exploiter le site sans dépendre des deux développeurs. Documents en français,
à relire avec l’interlocuteur de GCG avant le lancement.

| Document | Pour qui | Contenu |
| --- | --- | --- |
| [architecture.md](architecture.md) | équipe, prestataire futur | vue d’ensemble sur une page, emplacements, variables d’environnement |
| [exploitation.md](exploitation.md) | équipe | procédures : publier, revenir en arrière, sauvegarder et restaurer, DNS, lancement, changer d’hébergeur, incidents, départ d’une personne, QR codes |
| [comptes.md](comptes.md) | GCG + équipe | registre des comptes (modèle sans secret), MFA, revue des accès, sortie propre |
| [guide-editeur.md](guide-editeur.md) | éditeur GCG | utiliser l’espace de gestion, avec captures ; modèle de demande à l’équipe |
| [charte-redactionnelle.md](charte-redactionnelle.md) | rédacteurs | ton, typographie FR/EN, noms exacts, glossaire des métiers |
| [modele-de-contenu.md](modele-de-contenu.md) | équipe | champs, règles et stabilité des adresses |
| [composants.md](composants.md) | équipe | inventaire des composants et de leurs états |
| [tiers-et-confidentialite.md](tiers-et-confidentialite.md) | GCG, conseil | services tiers, cookies, robots, droits des personnes, conservation |
| [maintenance.md](maintenance.md) | GCG + équipe | périmètre de maintenance (à recopier de la grille tarifaire), journal des mises à jour, revue annuelle |
| [fiche-de-faits.csv](fiche-de-faits.csv) | GCG | tous les chiffres et faits publiés, projet par projet, **à valider ligne par ligne** |
| [registre-des-droits.csv](registre-des-droits.csv) | GCG | chaque image : source, auteur, licence, autorisation du client final |
| [audit-qualite-2026-10-04.csv](audit-qualite-2026-10-04.csv) | équipe | audit des 245 critères qualité : statut et preuve de chacun (en anglais) |
| [signature-email.html](signature-email.html) | personnel de GCG | signature e-mail FR/EN à compléter et copier dans Gmail ou Outlook |
| [../CHANGELOG.md](../CHANGELOG.md) | GCG | modifications par mise en production |

Les deux registres CSV s’ouvrent dans Excel (séparateur `;`, UTF-8). Ils sont régénérés à partir du contenu
par `node scripts/export-registers.mjs` ; les colonnes remplies à la main (validation, droits) sont conservées.

**QR codes** : les fichiers à imprimer (SVG vectoriel et PNG) se téléchargent sur la page `/partager` du
site **une fois le domaine définitif en ligne** ; avant, la page affiche un avertissement. Adresses
permanentes et marquage : `exploitation.md`, section 10.

**Formation** (HAND-03) : séance vidéo enregistrée avec l’accord des participants ; l’éditeur ajoute un projet
complet seul pendant ou après la séance (objectif : 15 minutes). Lien de l’enregistrement à noter ici :

| Date | Participants | Enregistrement | Essai « ajout d’un projet » |
| --- | --- | --- | --- |
| | | | |
