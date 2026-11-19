# Spec: berceo · match the screens of Surya's DA deck (home header and hero, section blocks, cards, icons)

- ticket: JAM-327
- touches: src/app/fonts.ts, src/app/globals.css, src/components/icons.tsx, src/components/ui/, src/components/shell/, src/components/vitrine/, src/components/recherche/, src/components/demandes/, src/components/reservations/, src/components/avis/, src/content/ (accueil.ts, common.ts, qui-sommes-nous.ts, comment-ca-marche.ts, design-system.ts, photos.ts, vitrine.test.ts), src/app/(public)/, src/app/(auth)/, src/app/(portail)/, public/icones/, CLAUDE.md, README.md, .icm/intake/README.md
- complexity: complex

## Problem

Jamie veut que l'application corresponde aux écrans du deck de Surya, `Direction artistique web.pdf` (34 diapositives). JAM-300 a appliqué les jetons du deck : couleurs, boutons, capitales, bloc perle. Les écrans du deck ne sont pas construits : l'en-tête sur la photo, le héros, les blocs sur rayures, les cartes, les icônes jaunes. Le deck est un guide de style avec des fragments d'écran. Il ne montre aucune page complète, aucun formulaire, aucun espace connecté et aucun écran mobile.

Décisions de Jamie du 2026-11-19 (premier commentaire du ticket) :

1. Les maquettes de pages complètes n'existent pas. Les designs du deck valent pour toute l'application : chaque page publique et chaque page connectée. Une page que le deck ne montre pas est construite avec les composants et les règles du deck.
2. Tout le contenu doit correspondre aux designs de Surya.
3. La police de remplacement de Comodo devient Fredoka, à la place de Fraunces, jusqu'à la livraison des fichiers Comodo.

## Proposed change

Les numéros de diapositive sont les numéros de page du PDF, comme dans le ticket. Le numéro imprimé au pied d'une diapositive est plus petit d'une unité à partir de la page 22.

### Ce que chaque diapositive montre

| Diapositive | Ce qu'elle montre | Composant |
|---|---|---|
| 19 | Accueil. En-tête transparent posé sur la photo : logomark blanc à gauche, quatre liens blancs en capitales (Accueil, Histoire, Nos gardes de nuit, Contact), une icône de compte blanche à droite. Héros : la photo en pleine largeur, le logotype blanc « Berceo » au centre, aucun texte, aucun bouton. Dessous : une bande de rayures, un bloc taupe à coins de 32 px, le titre blanc en capitales « Dormez. Votre bébé est entre de bonnes mains. », un paragraphe blanc de trois lignes, un bouton capsule à contour blanc « Je cherche une garde de nuit », une icône jaune (trois cœurs) en bas à droite du bloc. | en-tête sur photo, héros, bloc taupe sur rayures |
| 20 | Une carte perle transparente (70 à 80 %) à coins de 32 px sur une photo : titre blanc en capitales « Dormir pour prendre soin de son bébé », texte blanc court, une ligne de trois icônes blanches pleines (maison, lune, biberon). | carte transparente à icônes |
| 21 | Bloc perle transparent avec « Titre » et un texte court sur une photo. Sur sauge : un conteneur perle en capsule, une icône de lieu blanche, un champ blanc en capsule « ville ». | bloc transparent, champ de recherche |
| 22 | Dialogue de déconnexion : carte blanche à contour taupe et coins arrondis, question en gras centrée, texte d'aide centré, deux capsules empilées : rouge « Oui, me déconnecter », verte « Non, rester connecté ». | dialogue de confirmation |
| 10 | Bandeau sauge en pleine largeur, titre blanc centré en capitales « Les Gardiennes », deux icônes jaunes posées sur le titre (ourson, mobile). Dessous, sur rayures : bloc taupe, titre blanc à droite, texte blanc aligné à droite, une icône jaune (lune) en haut à gauche. | bandeau de section, bloc taupe sur rayures |
| 15 | Bloc taupe large à coins de 32 px : titre blanc en capitales « Les Gardiennes de la nuit », paragraphe blanc, bouton capsule à contour blanc « Découvrir leur profil ». | bloc de contenu taupe |
| 25 | Sur sauge, deux cartes blanches à coins de 32 px. Carte de profil : photo ronde avec une pastille sauge de vérification, prénom en capitales, une étiquette taupe (« Étudiante sage-femme en 4e année », « Profil vérifié par Berceo »), trois lignes à icône taupe (commune, note et nombre de gardes, spécialité), deux boutons capsule à contour sauge (« Voir le profil complet », « Envoyer une demande »). Carte de demande : titre taupe en capitales « Garde de nuit à Bruxelles », quatre lignes à icône (commune, date et heures, bébé, tarif), un bouton capsule sauge plein « Je suis disponible pour cette garde ». | carte de profil, carte de demande |
| 26 | « Notre histoire » : rayures en plein écran, un bloc taupe, le titre blanc en capitales avec une icône jaune (bonnet d'ours) posée sur le titre, trois paragraphes blancs, deux boutons capsule (« Rejoindre le réseau de professionnelles » à contour blanc, « Trouver une Gardienne de la nuit » jaune au survol), une icône jaune (pieds) à droite. | page d'histoire |
| 27 | Cartes de témoignage sauge à coins de 32 px, en carrousel : cinq étoiles jaunes, citation blanche, nom et lieu en gras, une flèche blanche sur la carte suivante. | carte de témoignage |
| 29 | « Site en construction » : photo en plein écran, logotype blanc, bloc perle transparent, titre blanc en capitales, texte blanc, deux icônes jaunes, une capsule blanche. | page d'attente |
| 8, 9 | La collection d'icônes pleines et arrondies (18 dessins), et les tailles : 20 à 24 px pour un champ ou un bouton, 24 à 32 px dans une carte, 40 à 56 px pour un service, 64 à 96 px pour une illustration. | icônes |
| 23, 24 | Les boutons par fond (blanc, rayures, sauge, taupe) et leur survol. Déjà faits par JAM-300. | boutons |

### Le socle (lot A)

- **Police.** `src/app/fonts.ts` lie `--font-titre` à Fredoka (graisses 500 et 600, SIL OFL) à la place de Fraunces. Les titres H1, H2 et la navigation sont en capitales, avec un interlettrage proche de 0,08em dans `globals.css`. Quand les fichiers Comodo arrivent (JAM-308), cette seule liaison change.
- **Icônes.** Les 18 dessins de Surya (dossier Drive « Logo pack Berceo », `SVG/icones`) entrent dans le dépôt comme icônes en `currentColor`. Les icônes fonctionnelles sont blanches, sauge ou taupe. Les icônes illustratives sont jaune beurre, de 64 à 96 px, deux au plus par bloc.
- **Composants.** Un composant pour chaque ligne de la table ci-dessus. `/design-system` montre chaque composant à côté du numéro de sa diapositive, pour que Surya l'examine.
- **En-tête public.** Sur l'accueil : transparent sur la photo, comme la diapositive 19. Sur une autre page publique : le même en-tête (logomark, liens en capitales, icône de compte) sur un bandeau sauge, comme la diapositive 10. Les deux boutons d'inscription quittent l'en-tête. L'icône de compte ouvre `/connexion`, ou l'espace de la personne si elle est connectée. Le menu mobile garde son fonctionnement et prend le même style.
- **Navigation.** Les libellés du deck, selon Q2 et Q5.

### Chaque page et ce qu'elle suit

Pages publiques (lot A) :

| Page | Suit |
|---|---|
| `/` | La diapositive 19 pour l'en-tête, le héros et le premier bloc, avec le texte du deck. Puis, dans l'ordre : le bloc « Les Gardiennes de la nuit » de la diapositive 15 avec son texte, la carte transparente de la diapositive 20 avec son texte sur une photo, les étapes « Comment ça marche » et « Pourquoi Berceo ? » du site en cartes de 32 px avec les icônes de Surya. Le texte d'une section que le deck ne montre pas reste celui du site. |
| `/qui-sommes-nous` | La diapositive 26. Le texte selon Q3. |
| `/comment-ca-marche`, `/comment-ca-marche/parents`, `/comment-ca-marche/professionnelles` | Le bandeau de la diapositive 10 pour le titre, des blocs taupe sur rayures (diapositives 10 et 15) pour les sections, des icônes de 40 à 56 px pour les étapes. |
| `/tarifs` | Le bandeau de la diapositive 10. Les quatre formules et la formule d'une nuit en cartes blanches de 32 px, comme les cartes de la diapositive 25. |
| `/faq` | Le bandeau de la diapositive 10. Les questions sur fond blanc, sans bloc transparent. |
| `/charte-des-professionnelles` | Le bandeau de la diapositive 10. Le texte long sur fond blanc (règle de lisibilité de la diapositive 14). |
| `/conditions-generales`, `/confidentialite` | La diapositive 29 tant que leurs textes manquent : photo, logotype blanc, bloc perle transparent, leur texte actuel. |
| `/professionnelles/[slug]` | La carte de profil de la diapositive 25 sur sauge, puis les blocs du profil en cartes blanches. |
| `/garde-de-nuit/[commune]` | Le bandeau de la diapositive 10, le champ de recherche de la diapositive 21, les cartes de profil de la diapositive 25. |
| `/design-system`, `/design-system/portail` | Chaque composant du lot, avec le numéro de sa diapositive. |

Pages de compte (lot A) : `/connexion`, `/connexion/code`, `/inscription-famille`, `/inscription-professionnelle`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`, `/verification-email`. Le deck ne montre aucun formulaire. Chaque page a le logotype (diapositive 4 : écrans de connexion et d'inscription), une carte blanche de 32 px sur sauge, des champs blancs en capsule (diapositive 21) et les boutons de la diapositive 23.

Espace famille (lot B) : `/espace/famille`, `abonnement`, `charte`, `demandes`, `demandes/[id]`, `demandes/[id]/modifier`, `demandes/nouvelle`, `messages`, `messages/[id]`, `professionnelles`, `professionnelles/[id]`, `professionnelles/[id]/priorite`, `profil`, `recherche`, `reservations`, `reservations/[id]`, `reservations/[id]/avis`.

| Élément | Suit |
|---|---|
| En-tête de l'espace | Le logomark (diapositive 5 : portails), la navigation en capitales, l'icône de compte. |
| Déconnexion, annulation, refus, toute confirmation | Le dialogue de la diapositive 22. |
| Une professionnelle dans une liste (`recherche`, `professionnelles`, les réponses d'une demande) | La carte de profil de la diapositive 25. |
| Une demande ou une réservation dans une liste | La carte de demande de la diapositive 25 : titre en capitales, lignes à icône, un bouton. |
| La recherche par commune | Le champ de la diapositive 21 sur sauge. |
| Une note | Les étoiles jaunes de la diapositive 27. |
| Un formulaire, une conversation, un état vide | Une carte blanche de 32 px, des champs en capsule, une icône illustrative jaune pour l'état vide. |

Espace professionnelle (lot B) : `/espace/professionnelle`, `declarations`, `demandes`, `demandes/[id]`, `disponibilites`, `gardes`, `gardes/[id]`, `gardes/[id]/avis`, `inscription`, `inscription/declarations`, `inscription/justificatifs`, `inscription/profil`, `messages`, `messages/[id]`, `profil`. Les mêmes éléments que l'espace famille. Une demande que la professionnelle lit suit la carte de demande de la diapositive 25, avec le bouton sauge plein « Je suis disponible pour cette garde » quand elle peut répondre.

Administration (lot C) : `/admin`, `abonnements`, `absences`, `avis`, `codes-promo`, `credits`, `demandes`, `dossiers`, `dossiers/[id]`, `journal`, `paiements`, `reservations`, `signalements`, `utilisateurs`, `utilisateurs/[id]`. Le deck ne montre aucun tableau. Chaque page a l'en-tête au logomark, les titres en capitales, les tableaux dans une carte blanche de 32 px, les filtres en capsule, les icônes de Surya, et le dialogue de la diapositive 22 pour suspendre, supprimer, refuser et annuler.

### Les lots

Le travail est trop grand pour une pull request sûre : environ 70 pages. La proposition de découpe est la question Q1. Par défaut, ce run fait le lot A. Les composants du lot A (cartes, dialogue, boutons, icônes, police, en-tête) sont partagés, donc les pages des lots B et C les reçoivent dès ce run. La revue page par page des lots B et C demande un ticket chacun. Jamie les crée. Ce run ne les crée pas.

### Défauts des questions

| Question | Défaut écrit dans cette spec |
|---|---|
| Q1 | Ce run fait le lot A. |
| Q2 | Pas de lien « Contact ». Trois liens. |
| Q3 | Le texte du retour 2 dans la mise en page de la diapositive 26. H1 « Notre histoire ». |
| Q4 | La carte de témoignage est sur `/design-system` seulement, avec le texte du deck marqué « exemple ». |
| Q5 | « Histoire » ouvre `/qui-sommes-nous`. « Nos gardes de nuit » ouvre `/comment-ca-marche`. « Tarifs » et « FAQ » sont au pied de page. |
| Q6 | Le texte du deck avec « diplômées », deux fautes corrigées. |
| Q7 | Le héros du deck : logotype seul. Le H1 est le titre du premier bloc. |

### Règles du dépôt que ce ticket écarte

| Règle | Où | Ce qui la remplace |
|---|---|---|
| Fraunces remplace Comodo jusqu'à la livraison | `CLAUDE.md`, `src/app/fonts.ts`, JAM-308 | Fredoka remplace Comodo (décision 3). Build corrige la phrase de `CLAUDE.md`. |
| D-7 : pas de « diplômées » général | `CLAUDE.md`, `.icm/intake/README.md` | Écartée pour les textes cités du deck (décision 2), si Q6 garde son défaut. Risque : la diapositive 25 montre une étudiante sage-femme, donc « toutes diplômées » peut être faux. |
| Chaque mot suit le guide éditorial (D-19), `@relecture` sur le reste | `CLAUDE.md`, `src/content/` | Un texte cité du deck est un texte de Surya. Il porte un commentaire « deck, diapositive N » et pas de `@relecture`. |
| Le H1 et le message du guide sur l'accueil | `src/content/accueil.ts`, `vitrine.test.ts` | Le texte de la diapositive 19 (décision 2, Q7). Les titres et descriptions `meta` ne changent pas. |
| Le lien « Se connecter » sous les boutons de l'accueil (retour 2, JAM-301, critère 4) | `src/content/accueil.ts` | L'icône de compte de l'en-tête, si Q7 garde son défaut. C'est une demande du client qui change de forme. |
| « Pas d'illustration naïve » | `CLAUDE.md` | Les icônes illustratives jaunes de Surya sont permises, avec parcimonie (diapositive 9). Aucune autre illustration. |
| « Pas d'animation gadget » | `CLAUDE.md` | Le carrousel de la diapositive 27 est permis pour les témoignages seulement. Il respecte `prefers-reduced-motion`. |
| CI est la vérité : jamais de `dev` local | `CLAUDE.md`, `ROUTER.md` règle 5 | Permission de Jamie pour le Build de ce ticket, ci-dessous. `build`, `lint`, `typecheck` et `test` restent à CI. |

Une règle n'est pas écartée par défaut : « la vitrine ne montre aucun contact ». Elle tient tant que Q2 garde son défaut.

### Permission de Jamie pour le Build

Jamie permet à la session de Build de ce ticket (commentaire du ticket, 2026-11-19) :

- de lancer l'application sur cet ordinateur dans un environnement de développement ;
- de créer un compte, de se connecter et de tester chaque page ;
- d'utiliser l'adresse `test@jamienisbet.com` ;
- de lire le courrier de cette adresse dans la boîte `contact@jamienisbet.com` avec l'outil Google Workspace.

Limites. La permission vaut pour ce ticket seulement. L'environnement local ne lit jamais la base de production : Build lit `.icm/local/database.md` avant le premier lancement, et s'arrête s'il ne peut pas prouver quelle base il lit. Les comptes de test sont des comptes de test : pas de vraie carte, les clés Stripe de test seulement. Aucun mot de passe n'entre dans un fichier suivi par git. Define n'a lancé aucun build, lint, test ni serveur.

## Acceptance criteria

- [ ] Sur chaque page, un titre H1 ou H2 et la navigation sont en Fredoka, en capitales, sans empattement. `src/app/fonts.ts` ne nomme plus Fraunces. (verify: agent)
- [ ] `/design-system` montre un composant pour chaque diapositive 10, 15, 19, 20, 21, 22, 25, 26, 27 et 29, avec le numéro de la diapositive, et les 18 icônes de Surya. (verify: operator)
- [ ] À 1440 px, le haut de `/` correspond à la diapositive 19 : en-tête transparent sur la photo, logomark blanc, liens blancs en capitales, icône de compte, logotype blanc au centre, puis le bloc taupe sur rayures avec le titre « Dormez. Votre bébé est entre de bonnes mains. », son texte, le bouton « Je cherche une garde de nuit » et les cœurs jaunes. (verify: operator)
- [ ] L'en-tête public a les liens « Accueil », « Histoire » et « Nos gardes de nuit », et aucun lien « Contact ». Chaque lien ouvre la page du défaut de Q5. « Tarifs » et « FAQ » sont au pied de page. (verify: agent)
- [ ] L'icône de compte ouvre `/connexion` pour un visiteur, et l'espace de la personne pour un compte connecté. (verify: agent)
- [ ] `/` a une seule balise H1. Le bouton « Je cherche une garde de nuit » ouvre `/inscription-famille`. (verify: agent)
- [ ] `/` montre le bloc « Les Gardiennes de la nuit » de la diapositive 15 et la carte transparente de la diapositive 20, chacun avec le texte du deck. (verify: operator)
- [ ] `/qui-sommes-nous` correspond à la diapositive 26 à 1440 px : rayures, bloc taupe, titre « Notre histoire » avec l'icône jaune, deux boutons, l'icône des pieds. Le texte est celui du retour 2, complet. (verify: operator)
- [ ] Le bouton « Rejoindre le réseau de professionnelles » ouvre `/inscription-professionnelle`. Le bouton « Trouver une Gardienne de la nuit » ouvre `/inscription-famille`. (verify: agent)
- [ ] Chaque autre page publique de la table a le bandeau de titre de la diapositive 10 et suit sa ligne de la table. (verify: operator)
- [ ] `/conditions-generales` et `/confidentialite` suivent la diapositive 29 et restent en `noindex`. (verify: agent)
- [ ] Les sept pages de compte ont le logotype, une carte blanche de 32 px sur sauge et des champs en capsule. L'inscription, la vérification de l'e-mail et la connexion marchent de bout en bout avec `test@jamienisbet.com` en local. (verify: agent)
- [ ] La déconnexion ouvre le dialogue de la diapositive 22 : « Oui, me déconnecter » en rouge, « Non, rester connecté » en vert, empilés. (verify: agent)
- [ ] Une carte de professionnelle correspond à la carte de profil de la diapositive 25, et une carte de demande à sa carte de demande, sur `/design-system` et sur une page réelle de chaque sorte. (verify: operator)
- [ ] Aucune page publique ne montre de témoignage. La carte de témoignage est sur `/design-system` avec le mot « exemple ». (verify: agent)
- [ ] À 375 px, chaque page du lot A se lit sans défilement horizontal, et le menu mobile ouvre les mêmes liens que l'en-tête. (verify: agent)
- [ ] Aucune couleur hors de `globals.css`, aucune police hors de `fonts.ts`, aucune ombre, aucun `!`, `…` ou `—` dans un texte. Les titres `meta` gardent 50 à 60 caractères et les descriptions 140 à 160. (verify: CI)
- [ ] `CLAUDE.md` nomme Fredoka et la nouvelle navigation. `.icm/intake/README.md` porte les règles écartées de cette spec. `README.md` décrit les composants nouveaux. (verify: agent)
- [ ] La pull request liste chaque page du lot A avec « conforme » ou l'écart qui reste, et chaque page des lots B et C que Build a ouverte en local avec ce qu'il a vu. (verify: operator)
- [ ] Le run `ci` est vert, et le déploiement de prévisualisation Vercel répond. (verify: CI)

## Out of scope

- Les fichiers Comodo et leur licence (JAM-308). Une correspondance exacte des titres n'est pas possible avant eux.
- La revue page par page des espaces famille et professionnelle (lot B) et de l'administration (lot C), si Q1 garde son défaut. Jamie crée leurs tickets.
- Une adresse ou une page de contact, si Q2 garde son défaut.
- Un texte de témoignage. Aucun texte n'est inventé.
- Un changement de comportement, de donnée, de schéma, de règle métier ou d'adresse de page. Ce ticket change l'apparence et les mots de la table.
- Les modèles d'e-mail.
- Le contraste AA. Les encres sauge et taupe restent sous AA par la décision du client (JAM-300).
- Une comparaison au pixel. La correspondance est jugée à l'œil à 1440 px, contre le deck.
- Un thème sombre. Une photo nouvelle hors de la banque d'images de Surya.
- Une écriture dans Linear. Une case de gate. Le merge.

## Open questions

- Les sept questions sont dans le corps de la pull request. Chacune a un défaut dans la table ci-dessus.
- Les fichiers `logo-13.svg` à `logo-30.svg` du dossier `SVG/icones` n'ont pas de nom parlant. Build les nomme d'après le dessin (lieu, calendrier, lune, biberon, ourson, cœurs, pieds).
- Les photos des diapositives 19, 20 et 29 doivent venir de la banque d'images du « Pack web Berceo ». `public/photos/` en a quatre aujourd'hui. Build ajoute en WebP celles qui manquent, avec un texte alternatif dans `src/content/photos.ts`.
- La diapositive 28 montre l'ancienne page d'attente sombre. Elle n'est pas un modèle.
