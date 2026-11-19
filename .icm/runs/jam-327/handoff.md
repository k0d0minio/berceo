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

Vérifiés par la session sur le serveur local (`npm run dev`, base UAT confirmée par Jamie, 2026-11-19), à 532 px de large et à 375 px :

- L'inscription famille, le mail de vérification, la connexion : de bout en bout avec `test+famille327@jamienisbet.com`.
- L'inscription professionnelle, le mail, la connexion : de bout en bout avec `test+pro327@jamienisbet.com`.
- Les pages de compte `/connexion`, `/inscription-famille`, `/inscription-professionnelle`, `/verification-email` : logotype, fond sauge, carte blanche, champs en capsule.
- Espace famille, sans abonnement : `/espace/famille`, `abonnement`, `charte`, `demandes` (vide), `demandes/nouvelle` (porte d'abonnement), `messages`, `professionnelles`, `profil`, `recherche`, `recherche` avec un résultat, `reservations` (vide). Aucune erreur, aucun défilement en largeur, un H1 par page. La carte de profil de la recherche correspond à la diapositive 25 : zone sauge, carte blanche, étiquette taupe, lignes à icône, capsule.
- Le dialogue de déconnexion dans l'espace : contour taupe, « Oui, me déconnecter » en rouge, « Non, rester connecté » en vert, empilés. La déconnexion marche.
- Espace professionnelle, profil non validé : `inscription/profil` (étapes et formulaire en cartes blanches), `demandes`, `disponibilites`, `gardes`, `messages` (messages d'attente). Les autres adresses renvoient à l'étape du profil.
- Corrigé pendant ce test : un message de formulaire était perle sur perle. Il est blanc avec un contour taupe.

Deuxième test local, complet (demande de Jamie, 2026-11-19), avec trois comptes de test :

- **Préparation.** Un troisième compte, `test+admin327@jamienisbet.com`, promu avec `npm run admin:grant`. Deux écritures directes dans la base UAT, sur les lignes des comptes de test seulement, parce que le local n'a ni Stripe ni stockage de documents : un abonnement Découverte `active` pour la famille de test (`stripe_customer_id` `cus_test_jam327`), et le dossier de la professionnelle de test passé de `brouillon` à `en_attente`.
- **Administration : les 15 adresses.** `/admin`, `abonnements`, `absences` (redirige vers `signalements`), `avis`, `codes-promo`, `credits`, `demandes`, `dossiers`, `dossiers/[id]`, `journal`, `paiements`, `reservations`, `signalements`, `utilisateurs`, `utilisateurs/[id]`. Aucune erreur, aucun défilement en largeur à 375 px, un H1 par page, tableaux dans une carte blanche, navigation en capsules, états vides en bloc taupe. Le dialogue « Valider le profil » s'ouvre et valide : le dossier passe à « Profil validé » et le mail part.
- **Espace famille avec abonnement.** Le profil (commune enregistrée), le formulaire de demande (carte blanche), la publication d'une demande, la page de la demande (carte de la diapositive 25), la liste des demandes (zone sauge), `modifier`, le profil complet d'une professionnelle, la demande en priorité (zone sauge, bouton sauge plein), la réponse d'une professionnelle sur la demande (carte blanche en zone sauge, ligne tarif à icône), la conversation, et l'annulation de la demande par le dialogue rouge et vert.
- **Espace professionnelle validée.** La connexion par mot de passe puis par code reçu par e-mail (`/connexion/code`), la page « Vos déclarations ont changé » et sa confirmation, l'accueil, `demandes` (cartes en zone sauge, son tarif sous son libellé), la réponse « Je suis disponible pour cette garde », `demandes/[id]`, `disponibilites` (calendrier en carte blanche), `gardes` (vide), `messages` et la conversation (bulle Berceo blanche), `profil` (« Mon dossier »).
- **Corrigé pendant ce test.** À 375 px, la liste des demandes d'une professionnelle débordait de 13 px (le bouton de réponse ne revenait pas à la ligne), et « Mon dossier » de 6 px (un bouton long). Les deux tiennent maintenant dans l'écran.

Non vérifié :

- **Une réservation et tout ce qui en dépend** : `reservations/[id]`, les deux pages d'avis, `gardes/[id]`, l'annulation d'une garde, un signalement d'absence. « Accepter et réserver » ouvre Stripe, qui n'est pas configuré en local.
- **Le dépôt d'un fichier** : la photo et les justificatifs (`inscription/justificatifs`, `inscription/declarations` dans le parcours d'inscription). Le stockage de documents n'est pas configuré en local (`DOCUMENTS_S3_ENDPOINT` absent).
- **Les actions de l'administration autres que la validation** : suspendre, supprimer, refuser, rembourser, accorder un crédit, créer un code promo. Leurs pages sont vues, leurs dialogues ne sont pas ouverts.
- `/mot-de-passe-oublie`, `/nouveau-mot-de-passe` : affichées sur la prévisualisation seulement.
- L'envoi d'un message de contact : aucun `CONTACT_EMAIL` en local ni sur la prévisualisation.
- La comparaison à 1440 px contre le deck : la fenêtre du navigateur de la session fait 532 à 638 px.

Traces laissées par le test :

- Trois comptes de test dans la base UAT : `test+famille327@jamienisbet.com` (famille, abonnement de test actif, commune Ixelles), `test+pro327@jamienisbet.com` (professionnelle validée, sans photo ni justificatif, visible dans la recherche et sur sa page publique en UAT), `test+admin327@jamienisbet.com` (**admin**). Leur mot de passe n'est dans aucun fichier du dépôt. Jamie garde les trois comptes (décision du 2026-11-19).
- Une demande de test annulée (Ixelles, nuit du 25/11/2026), une réponse et une conversation entre les deux comptes de test. Deux lignes du journal admin (validation du dossier).
- Un compte Neon Auth orphelin pour `test@jamienisbet.com` (voir `findings.md`, point 8).
- Des mails de l'application dans la boîte `contact@jamienisbet.com` : trois vérifications, un code de connexion, la validation du profil, et les notifications de réponse. Aucun mail envoyé par la session.
- Dans le worktree, hors de git : `.env.local` (copié par Jamie), `node_modules/`, `.claude/launch.json`.
- Le serveur local est arrêté.

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
- Jamie : tester sur UAT ce que le local ne peut pas ouvrir : une réservation payée, les avis, le dépôt d'un fichier.
- La case **Ready to merge** était cochée avant les trois derniers commits de produit (`fix(da)` : titre de bandeau, message de formulaire, boutons longs à 375 px). Jamie décide si la coche tient.

## Do not touch

- `.icm/_system/`.
- Le checkout principal du dépôt : d'autres sessions y travaillent dans leurs worktrees.
- Les quatre lignes de JAM-249 dans `src/content/faq.ts` et `src/content/recherche.ts` (run jam-249 en phase release).
