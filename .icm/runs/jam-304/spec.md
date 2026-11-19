# Spec: berceo · one-night plan at 14,75 EUR and promo codes on subscriptions

- ticket: JAM-304
- touches: src/content/tarifs.ts, src/content/abonnements.ts, src/content/vitrine.test.ts, src/app/(public)/tarifs/page.tsx, src/app/(portail)/espace/famille/abonnement/, src/app/(portail)/admin/abonnements/page.tsx, src/lib/abonnements/rules.ts, src/lib/abonnements/checkout.ts, src/lib/abonnements/subscriptions.ts, src/lib/abonnements/rules.test.ts, src/app/api/webhooks/stripe/route.ts, src/db/schema.ts, drizzle/
- complexity: complex

## Problem

Retour de la cliente, tour 2 (12 nov. 2026). Les fondatrices veulent une formule pour une seule nuit à 14,75 EUR, plus chère à la nuit que les abonnements. Elles veulent aussi des codes promo sur les abonnements, pour avoir beaucoup d'inscriptions vite au lancement. Aujourd'hui, Berceo n'a que les quatre abonnements des familles (`src/lib/abonnements/`), et le Checkout n'accepte pas de code promo.

## Proposed change

- « Tarifs » et la page d'abonnement de la famille montrent une cinquième formule : une nuit, 14,75 EUR.
- La famille paie la formule une nuit par Stripe Checkout. Défaut (Q1) : un paiement unique, pas un abonnement récurrent.
- La formule une nuit ouvre les mêmes actions que la plus petite formule, pour une réservation (Q2). Elle reste ouverte jusqu'à cette réservation, sans date de fin (Q4). Après la réservation, l'accès se ferme à la fin de la garde réservée.
- Le Checkout de chaque formule (les quatre abonnements et la formule une nuit) accepte un code promo. Les fondatrices créent les codes dans le tableau de bord Stripe (Q3). Berceo n'a pas d'écran de codes.
- La liste des abonnements des fondatrices montre la formule une nuit et la remise d'un code promo.

### Règle du dépôt que ce ticket remplace

- Le test de prix de `src/content/vitrine.test.ts` (« aucun prix sauf les quatre abonnements, 130 EUR et 3 % », retour tour 1) refuse 14,75 EUR. Décision de Jamie, 2026-11-18 : la demande de la cliente gagne. Le test accepte 14,75 EUR, et seulement ce nouveau prix. La règle de `CLAUDE.md` (« no price but the four subscriptions, 130 € and 3 % ») change de la même façon.

### Dépendance

- Build dépend du prix de 14,75 EUR que Jamie crée dans Stripe, en mode test puis en mode live (JAM-308). Le nom de la variable d'environnement du prix suit le modèle des quatre prix existants (`STRIPE_PRICE_*`). Sa valeur est dans Vercel, jamais dans git.

## Acceptance criteria

- [ ] « Tarifs » montre la formule une nuit à 14,75 EUR à côté des quatre abonnements. (verify: operator)
- [ ] La page d'abonnement de la famille montre la formule une nuit à 14,75 EUR et un bouton qui ouvre Stripe Checkout. (verify: operator)
- [ ] Sur UAT, une famille paie la formule une nuit avec une carte de test Stripe. Elle peut ensuite publier une demande et réserver, comme avec la plus petite formule. (verify: operator)
- [ ] Après la garde de cette réservation, `familyMay` refuse de nouveau les actions de l'abonnement à cette famille. (verify: CI)
- [ ] Une formule une nuit payée sans réservation reste ouverte. (verify: CI)
- [ ] La liste des abonnements des fondatrices montre la formule une nuit de cette famille. (verify: operator)
- [ ] Sur UAT, la page Stripe Checkout de chaque formule montre un champ de code promo. Un code de test créé dans Stripe réduit le montant. (verify: operator)
- [ ] La remise du code promo est visible dans Stripe et dans la liste des abonnements des fondatrices. (verify: operator)
- [ ] Le test de prix de `src/content/vitrine.test.ts` accepte 14,75 EUR et refuse toujours tout autre nouveau prix. (verify: CI)
- [ ] Le run `ci` du pull request est vert. (verify: CI)

## Out of scope

- Un écran de création ou de gestion des codes promo dans Berceo (défaut Q3).
- La création du prix de 14,75 EUR et des codes promo dans Stripe : Jamie (JAM-308) et les fondatrices le font.
- Un autre prix ou une autre formule que 14,75 EUR pour une nuit.
- Une date de fin de la formule une nuit (défaut Q4) et tout autre terme commercial que le ticket ne donne pas.
- Un changement du frais de service de 3 % ou des crédits Berceo.
- La migration de production : elle suit `.icm/local/database.md` à la release.

## Open questions

- Q1 reste ouverte avec la cliente jusqu'à l'appel du 20 nov. 2026. Si la réponse est « abonnement récurrent », Jamie révise cette spec (`revise JAM-304`) avant Build.
- Le ticket dit que la demande est probablement hors de l'accord. Jamie confirme le périmètre à l'appel du 20 nov. 2026. Ce point ne change pas ce qui est construit.
