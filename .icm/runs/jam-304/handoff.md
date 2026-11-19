# Handoff jam-304

## Next action

1. Jamie lit la spec révisée (réponses Q1 à Q4, l'écran « Codes promo »), puis coche Spec approved de nouveau dans le pull request #132.
2. Jamie dit `build JAM-304`.

## How to test

Sur la preview, ouvrez « Tarifs » et la page d'abonnement : la formule une nuit montre 14,75 EUR. Créez un code dans « Codes promo », puis payez la formule avec une carte de test Stripe et ce code : le montant baisse, et la liste des abonnements des fondatrices montre la formule et la remise.

## Blockers

- La spec révisée attend la coche Spec approved.
- `STRIPE_SECRET_KEY` doit pouvoir écrire les coupons et les codes promo, dans chaque environnement (Jamie, dans Stripe).
- Build attend le prix de 14,75 EUR dans Stripe, en mode test puis live (JAM-308, Jamie).

## Do not touch

- `.icm/_system/`
