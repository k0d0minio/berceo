# Handoff jam-462

## Next action

J coche Spec approved sur la PR #142. Le code est déjà poussé (le brief de la session demandait le build complet). Ensuite J remplit la base une fois :

1. `NEON_API_KEY=<clé> npm run demo:db:make` dans le checkout principal. Sans clé : écrire `.env.demo.local` à la main (voir `.icm/local/database.md`, The local demo database), puis `npm run demo:db:make`.
2. `npm run demo:dev`, puis `http://localhost:3000/api/demo/connexion?compte=famille-serenite`.

La branche Neon `local/demo` (br-autumn-unit-b1q0mq6g) du projet `uat-berceo` existe déjà et porte la marque. Le seed n'a pas encore tourné : sa première exécution est la vérification des contraintes de la base.

## How to test

Lancez `npm run demo:dev`, ouvrez le lien de connexion d'une famille imprimé par le seed : son espace montre ses demandes, ses réponses et ses gardes. Le même lien sur la preview répond 404.

## Blockers

- Le remplissage demande une clé API Neon de J, ou `.env.demo.local` écrit à la main.

## Do not touch

- Les fichiers de JAM-461 (/tarifs), sur une autre branche.
