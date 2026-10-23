# Stub: A visitor reads the four subscriptions and the fee on « Tarifs »

- feature-slug: tarifs-abonnements
- epic: vitrine-retour-1
- sequence: 3 of 3
- depends-on: none
- complexity: medium
- priority: P1

## Problem

`/tarifs` says there is no subscription (D-3) and that a professional's rate sits between 100 €
and 300 € (D-4). The founders want the page to carry what they wrote in the questionnaire: the
subscriptions with their names and prices, plus the 3 % service fee. The rate now has a floor of
130 € and no ceiling (the answers [4.1], confirmed by Jamie on 2026-10-23).

## Proposed change

The page presents the four family subscriptions by name, duration and price: Découverte, 1 mois,
24,90 € · Parenthèse, 3 mois, 59,90 € · Sérénité, 6 mois, 94,90 € · Premium, 12 mois, 159,90 €.
It says what a subscription gives: the full profiles and the contact of the professionals, and no
limit on requests (the devis [9.4]). The fee paragraph says that 3 % service fees are taken at
each confirmed booking and pay for the running of the platform, with the refund rule unchanged.
The professional's rate paragraph says she sets her night rate from 130 €, paid to her directly.
The « Sans abonnement » section goes. The title and the meta description are rewritten.

## Acceptance criteria

- [ ] `/tarifs` shows the four subscriptions with name, duration and price, in that order.
- [ ] The page names the 3 % fee and its refund rule, and no insurance.
- [ ] The page says the night rate starts at 130 € and names no ceiling.
- [ ] No page of the vitrine says « sans abonnement », « 100 € » or « 300 € » any more.
- [ ] `src/content/vitrine.test.ts` allows exactly these amounts: the four prices, 130 € and 3 %.
- [ ] The sign-up call to action leads to `/inscription-famille`.

## Out of scope

- Buying a subscription, the gate on profiles, the sign-up flow (`abonnements-familles`).
- The professional's rate rule in her file (`onboarding-retour-1/profil-tarifs`).

## Notes

- Questions, with a default each:
  1. The founders asked for « des frais de service de 3 % qui paient le bon fonctionnement de la
     plateforme et l'assurance ». Default: write « le bon fonctionnement de la plateforme » only.
     The site carries no insurance wording until a contract exists (D-8, Jamie 2026-10-23).
  2. Do the prices of the devis still stand? Default: yes. Source: the devis of 27 August 2026,
     in the house at `clients/berceo/quote/quote.md`, and the answers [4.3].
- The rules in `src/content/vitrine.test.ts` change: D-3 (no subscription) and D-4 (100 and 300
  only) are superseded by the feedback. The test keeps forbidding any other amount.
- `/tarifs` can ship before a subscription can be bought. The page then describes what the family
  will buy at sign-up. Jamie decides when production takes it.
- Files: `src/content/tarifs.ts`, `src/app/(public)/tarifs/page.tsx`,
  `src/content/vitrine.test.ts`, `src/content/accueil.ts` and `src/content/faq.ts` where they
  name 100 € or 300 €.
