# Spec: berceo · one-night plan at 14,75 EUR and promo codes on subscriptions

- ticket: JAM-304
- touches: src/content/tarifs.ts, src/content/abonnements.ts, src/content/vitrine.test.ts, src/app/(public)/tarifs/page.tsx, src/app/(portail)/espace/famille/abonnement/, src/app/(portail)/admin/abonnements/page.tsx, src/app/(portail)/admin/codes-promo/, src/lib/abonnements/promo-codes.ts, src/components/admin/admin-shell.tsx, src/components/admin/promo-codes-table.tsx, src/lib/admin/journal.ts, src/content/admin.ts, src/lib/abonnements/rules.ts, src/lib/abonnements/checkout.ts, src/lib/abonnements/subscriptions.ts, src/lib/abonnements/rules.test.ts, src/app/api/webhooks/stripe/route.ts, src/db/schema.ts, drizzle/
- complexity: complex

## Problem

Retour de la cliente, tour 2 (12 nov. 2026). Les fondatrices veulent une formule pour une seule nuit à 14,75 EUR, plus chère à la nuit que les abonnements. Elles veulent aussi des codes promo sur les abonnements, pour avoir beaucoup d'inscriptions vite au lancement. Aujourd'hui, Berceo n'a que les quatre abonnements des familles (`src/lib/abonnements/`), et le Checkout n'accepte pas de code promo.

## Proposed change

- « Tarifs » et la page d'abonnement de la famille montrent une cinquième formule : une nuit, 14,75 EUR.
- La famille paie la formule une nuit par Stripe Checkout. Réponse Q1 : un paiement unique, pas un abonnement récurrent.
- La formule une nuit ouvre les mêmes actions que la plus petite formule, pour une réservation (réponse Q2). Elle reste ouverte jusqu'à cette réservation, sans date de fin (réponse Q4). Après la réservation, l'accès se ferme à la fin de la garde réservée.
- Le Checkout de chaque formule (les quatre abonnements et la formule une nuit) accepte un code promo.
- Les fondatrices créent les codes dans Berceo (réponse Q3), dans un nouvel écran du back-office « Codes promo » (`/admin/codes-promo`). Stripe garde les codes : Berceo crée un coupon et son code promo par l'API Stripe, et n'a pas de table de codes.
  - Pour créer un code, la fondatrice donne : le code (le texte que la famille tape), la remise en pourcentage ou en montant en EUR, et, si elle le veut, une date de fin et un nombre maximal d'utilisations.
  - La fondatrice choisit chaque valeur. Berceo ne propose aucune valeur de remise par défaut.
  - Un code vaut pour les cinq formules. La remise s'applique au premier paiement seulement (durée Stripe `once`).
  - L'écran liste les codes : le code, la remise, la date de fin, le nombre d'utilisations, l'état (actif ou désactivé). La fondatrice peut désactiver un code actif. Stripe ne supprime pas un code utilisé : désactiver est la fin d'un code.
  - Un code déjà pris dans Stripe, une remise vide ou hors limites (0 % ou plus de 100 %, 0 EUR ou moins) et une erreur de Stripe donnent un message clair, et rien n'est créé.
  - Le journal des fondatrices (`admin_journal`) enregistre chaque création et chaque désactivation d'un code.
- La liste des abonnements des fondatrices montre la formule une nuit et la remise d'un code promo.

### Réponses de l'opérateur

- Q1 : paiement unique pour une réservation. Q2 : comme la plus petite formule, pour une réservation. Q3 : un écran de codes dans Berceo. Q4 : elle reste ouverte jusqu'à une réservation.
- Le ticket proposait les codes dans le tableau de bord Stripe. La réponse Q3 de Jamie remplace ce défaut, et ajoute un écran au back-office.

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
- [ ] Sur UAT, une fondatrice crée un code dans « Codes promo ». Le code apparaît dans la liste de l'écran et dans Stripe. (verify: operator)
- [ ] Un code déjà pris ou une remise hors limites donne un message d'erreur, et aucun code n'est créé. (verify: CI)
- [ ] Une fondatrice désactive un code. La liste le montre désactivé, et le Checkout le refuse. (verify: operator)
- [ ] Le journal des fondatrices montre la création et la désactivation du code. (verify: operator)
- [ ] Une personne qui n'est pas fondatrice ne peut pas ouvrir « Codes promo » ni appeler ses actions. (verify: CI)
- [ ] Sur UAT, la page Stripe Checkout de chaque formule montre un champ de code promo. Un code créé dans « Codes promo » réduit le montant du premier paiement. (verify: operator)
- [ ] La remise du code promo est visible dans Stripe et dans la liste des abonnements des fondatrices. (verify: operator)
- [ ] Le test de prix de `src/content/vitrine.test.ts` accepte 14,75 EUR et refuse toujours tout autre nouveau prix. (verify: CI)
- [ ] Le run `ci` du pull request est vert. (verify: CI)

## Out of scope

- La modification d'un code après sa création : Stripe ne la permet pas. La fondatrice désactive le code et en crée un autre.
- Une remise sur plusieurs paiements d'un abonnement, et un code réservé à une seule formule ou à une seule famille.
- La création du prix de 14,75 EUR dans Stripe : Jamie le fait (JAM-308).
- Un autre prix ou une autre formule que 14,75 EUR pour une nuit.
- Une date de fin de la formule une nuit (réponse Q4) et tout autre terme commercial que le ticket ne donne pas.
- Un changement du frais de service de 3 % ou des crédits Berceo.
- La migration de production : elle suit `.icm/local/database.md` à la release.

## Open questions

- Jamie a répondu à Q1 avant l'appel du 20 nov. 2026. Si la cliente dit autre chose à l'appel, Jamie révise cette spec avant la release.
- La valeur `STRIPE_SECRET_KEY` de chaque environnement doit pouvoir écrire les coupons et les codes promo (une clé restreinte demande ces droits). C'est un acte de Jamie dans Stripe, pas du code.
- Le ticket dit que la demande est probablement hors de l'accord. Jamie confirme le périmètre à l'appel du 20 nov. 2026. Ce point ne change pas ce qui est construit.
