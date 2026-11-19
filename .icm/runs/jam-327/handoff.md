# Handoff jam-327

## Next action

Jamie teste la prévisualisation de la pull request #136, coche **Ready to merge**, puis dit `release JAM-327`. Avant le test de la page Contact : poser `CONTACT_EMAIL` dans Vercel (`.icm/setup/contact-email.md`). Les pages connectées n'ont pas été ouvertes par la session : voir « Non vérifié ».

## How to test

Ouvrez l'accueil à 1440 px et comparez le haut de la page à la diapositive 19 : en-tête blanc sur la photo, logotype seul, bloc taupe sur rayures. Ouvrez « Histoire » et comparez à la diapositive 26. Ouvrez `/design-system`, section « Les écrans du deck », et comparez chaque exemple à sa diapositive. Puis connectez-vous en famille, en professionnelle et en admin : chaque liste montre des cartes blanches sur une zone sauge, et « Se déconnecter » ouvre le dialogue rouge et vert.

## Critères

Vérifiés par CI (run `ci` vert, déploiement Vercel prêt) : les règles de `vitrine.test.ts` (ponctuation, longueurs `meta`, page Contact comprise), les règles du formulaire de contact et le 404 sans `CONTACT_EMAIL` (`src/lib/contact/rules.test.ts`).

Vérifiés par la session sur la prévisualisation, sans connexion :

- Fredoka sur les titres, interlettrage 0,08em. Plus de Fraunces.
- Une seule balise H1 sur chaque page publique et de compte. Le H1 de l'accueil est « Dormez. Votre bébé est entre de bonnes mains. ».
- L'en-tête a « Accueil », « Histoire », « Nos gardes de nuit » vers `/`, `/qui-sommes-nous`, `/comment-ca-marche`. « Contact » est absent et `/contact` répond 404, car la prévisualisation n'a pas `CONTACT_EMAIL`.
- `/conditions-generales` et `/confidentialite` suivent la diapositive 29 et restent `noindex`.
- Aucun témoignage sur une page publique. La carte est sur `/design-system` avec « Exemple ».
- À 375 px, aucune page publique ou de compte ne défile en largeur. Le titre de la charte débordait : corrigé.
- `/design-system` montre les diapositives 8, 10, 15, 19, 20, 21, 22, 25, 26, 27 et 29.

Non vérifié :

- **Toutes les pages connectées** (famille, professionnelle, admin). Aucune n'a été affichée. Trois sous-agents les ont modifiées, et CI (lint, types, tests, build) est vert.
- L'inscription, la vérification de l'e-mail et la connexion avec `test@jamienisbet.com`. L'envoi d'un message de contact.
- Le dialogue de déconnexion dans un espace, et les confirmations de l'administration.
- La comparaison à 1440 px contre le deck : la fenêtre du navigateur de la session fait 638 px de large.
- Raison : la session n'a pas pu prouver quelle base lit l'environnement local. La lecture des fichiers `.env*` lui est refusée, et la spec demande cette preuve avant le premier lancement. Aucun serveur local n'a été lancé.

## Écarts par rapport à la spec

- Les étoiles restent sauge sur une carte blanche. Les étoiles jaunes ne se voient pas sur blanc : elles sont sur sauge seulement (carte de témoignage).
- Une icône illustrative jaune n'est jamais sur blanc ou perle. Un état vide est un bloc taupe.
- La carte de profil n'a pas le bouton « Envoyer une demande » : ce serait un nouveau parcours. La carte publique n'a pas de photo (D-126).
- La page d'une commune n'a pas de champ de recherche : la recherche publique n'existe pas.
- La recherche de l'espace famille est une carte blanche sur perle, pas la capsule perle sur sauge de la diapositive 21 : ses libellés taupe ne se lisent pas sur sauge.
- Le texte de la diapositive 15 perd ses points de suspension (D-19).
- « Découvrir leur profil » ouvre `/comment-ca-marche` : aucune page publique ne liste les profils.
- Le fond des espaces connectés est perle, et les cartes sont blanches. Les listes de cartes sont sur une zone sauge.
- La carte d'une réservation (espace famille) montre trois faits de plus : la localité, les enfants, le tarif. La page de détail les montrait déjà.
- Les en-têtes des pages publiques n'ont plus de photo : le bandeau de la diapositive 10 n'en a pas.
- La navigation des espaces passe dans le menu sous 1280 px : sept entrées en capitales ne tiennent pas avant.

## Pour la session suivante

- Le ticket se lit avec `~/baxter_live/system/bin/baxter_tool run linear get_issue '{"key": "JAM-327"}'`. Le MCP Linear n'est pas connecté. Aucune écriture dans Linear.
- Le deck : `~/Downloads/Pack web Berceo-20261029T004804Z-1-001/Pack web Berceo/Direction artistique web.pdf`. Rendu : `pdftoppm -r 50 -png`. Les numéros de la spec sont les pages du PDF. Le pied de page imprimé a une unité de moins à partir de la page 22.
- Les icônes : `~/Downloads/Logo pack Berceo-20261029T004820Z-1-001/Logo pack Berceo/SVG/icones/` (`logo-13.svg` à `logo-30.svg`).
- La banque d'images : le dossier `Banque d_image` à côté du deck.
- Décisions de Jamie du 2026-11-19 : tout le contenu suit le deck, pour toute l'application. Fredoka (500 à 600, interlettrage proche de 0,08em) remplace Fraunces jusqu'à Comodo (JAM-308).
- Permission de Jamie pour Build, dans la spec : serveur de développement local, compte `test@jamienisbet.com`, courrier lu dans la boîte `contact@jamienisbet.com` avec l'outil Google Workspace. Build prouve d'abord que le local ne lit pas la base de production (`.icm/local/database.md`). `build`, `lint`, `typecheck` et `test` restent à CI.
- Q1 : une seule pull request pour toute l'application. Ordre de Build : socle, pages publiques et de compte, espace famille, espace professionnelle, administration. Pousser à la fin de chaque étape.
- Q2 : une page `/contact` avec un formulaire, vers l'adresse de la variable `CONTACT_EMAIL`. Le nom de la variable, la limite de 2 000 caractères, le champ piège et le 404 sans la variable sont des choix de Define.
- Q7 : le héros du deck, plus le lien « Se connecter » du retour 2 sous le premier bloc.

## Blockers

- Jamie : tester, puis cocher **Ready to merge** sur la pull request #136.
- Jamie : poser `CONTACT_EMAIL` dans Vercel (`.icm/setup/contact-email.md`).
- Jamie : dire comment vérifier les pages connectées. Soit il les teste lui-même sur la prévisualisation, soit il confirme quelle base lit `.env.local` et la session lance le serveur local.

## Do not touch

- `.icm/_system/`.
- Le checkout principal du dépôt : d'autres sessions y travaillent dans leurs worktrees.
- Les quatre lignes de JAM-249 dans `src/content/faq.ts` et `src/content/recherche.ts` (run jam-249 en phase release).
