# Handoff jam-327

## Next action

Jamie lit la spec dans la pull request #136, coche **Spec approved**, puis dit `build JAM-327`. Les sept questions ont une réponse (2026-11-19, dans le chat, recopiées dans le corps de la pull request).

## How to test

Rien à tester : Define n'écrit pas de code. Lisez la spec dans la pull request #136 : la table « Chaque page et ce qu'elle suit », les lots, et la table des règles écartées.

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

- Jamie : cocher **Spec approved** sur la pull request #136.
- Jamie : poser `CONTACT_EMAIL` dans Vercel (UAT et production) avant le test de la page Contact. Sans elle, la page n'existe pas.

## Do not touch

- `.icm/_system/`.
- Le checkout principal du dépôt : d'autres sessions y travaillent dans leurs worktrees.
- Les quatre lignes de JAM-249 dans `src/content/faq.ts` et `src/content/recherche.ts` (run jam-249 en phase release).
