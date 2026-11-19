# Handoff jam-304

## Next action

1. Jamie répond aux quatre questions sur la carte du HUD ou dans le corps du pull request #132. Q1 attend l'appel avec la cliente du 20 nov. 2026.
2. Jamie dit `new JAM-304`. La session lance `questions.sh JAM-304`, met les réponses dans `spec.md`, puis `new-run.sh JAM-304 --refresh-body`.
3. Jamie lit les choix de la spec, puis coche Spec approved dans le pull request #132.
4. Jamie dit `build JAM-304`.

## How to test

Sur la preview, ouvrez « Tarifs » et la page d'abonnement : la formule une nuit montre 14,75 EUR. Payez-la avec une carte de test Stripe et un code promo de test : le montant baisse, et la liste des abonnements des fondatrices montre la formule et la remise.

## Blockers

- Les quatre questions attendent une réponse. Q1 attend l'appel du 20 nov. 2026.
- Build attend le prix de 14,75 EUR dans Stripe, en mode test puis live (JAM-308, Jamie).

## Do not touch

- `.icm/_system/`
