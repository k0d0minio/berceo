# Handoff jam-304

## Next action

1. Jamie crée le prix unique de 14,75 EUR dans Stripe (sandbox) et met son id dans Vercel, Preview et `uat`, sous le nom `STRIPE_PRICE_UNE_NUIT`. Sans cette valeur, « Choisir Une nuit » montre l'erreur générique.
2. Jamie teste sur la preview (How to test), puis coche Ready to merge dans le pull request #132.
3. Jamie dit `release JAM-304`.

## How to test

Ouvrez « Tarifs » et « Votre abonnement » : la formule Une nuit montre 14,75 €. Comme fondatrice, créez un code dans « Codes promo », puis, comme famille, payez Une nuit avec une carte de test Stripe et ce code : le montant baisse, et « Abonnements » montre la formule et la remise. Désactivez le code : il passe à « Désactivé » et le journal montre les deux actions.

## Acceptance criteria

| Critère | État |
|---|---|
| « Tarifs » montre Une nuit à 14,75 EUR | à vérifier par l'opérateur |
| La page d'abonnement montre Une nuit et ouvre Stripe Checkout | à vérifier par l'opérateur (demande `STRIPE_PRICE_UNE_NUIT`) |
| Une famille paie Une nuit, puis publie et réserve | à vérifier par l'opérateur |
| Après la garde, `familyMay` refuse de nouveau (CI) | fait : `rules.test.ts`, CI verte |
| Une nuit payée sans réservation reste ouverte (CI) | fait : `rules.test.ts`, CI verte |
| La liste des fondatrices montre Une nuit | à vérifier par l'opérateur |
| Une fondatrice crée un code, visible à l'écran et dans Stripe | à vérifier par l'opérateur |
| Code pris ou remise hors limites refusés (CI) | fait : `rules.test.ts` et `codes-promo/actions.test.ts`, CI verte |
| Désactiver un code | à vérifier par l'opérateur |
| Le journal montre création et désactivation | à vérifier par l'opérateur |
| Une non-fondatrice ne peut ni ouvrir ni appeler « Codes promo » (CI) | fait : `codes-promo/actions.test.ts` ; la page répond 404 par `requireAccess` |
| Champ code promo sur chaque Checkout, remise du premier paiement | à vérifier par l'opérateur |
| Remise visible dans Stripe et dans la liste | à vérifier par l'opérateur |
| Le test de prix accepte 14,75 EUR seulement (CI) | fait : `vitrine.test.ts`, CI verte |
| CI verte | fait, au commit 57eb840 |

## Choix de Build à vérifier

- Une Une nuit appartient à la première réservation confirmée après son paiement. Une réservation annulée l'utilise aussi : la formule se ferme à la fin de cette nuit.
- Une nuit est refusée pendant un abonnement actif, ou quand une autre Une nuit est ouverte.
- L'accueil de la famille et « Votre abonnement » disent quand Une nuit est ouverte.
- Le nom affiché est « Une nuit » (`@relecture` Surya).

## Blockers

- `STRIPE_PRICE_UNE_NUIT` n'est pas dans Vercel (Jamie, JAM-308).
- `.env.example` n'a pas encore le nom `STRIPE_PRICE_UNE_NUIT` : la session n'a pas pu lire le fichier (permission refusée). Le README le nomme.
- La release a une migration (`drizzle/0036_une-nuit-et-codes-promo.sql`) : `migrate-production.yml` avant `promote.sh run` (`.icm/local/database.md`).
- La base UAT a déjà cette migration, posée par la preview (`findings.md`).

## Do not touch

- `.icm/_system/`
