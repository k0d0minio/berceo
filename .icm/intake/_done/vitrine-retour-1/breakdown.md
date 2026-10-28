# Breakdown: The public site after feedback round 1

- epic-slug: vitrine-retour-1
- source: the founders' feedback round 1 (Drive, `feedback-round-1.pdf`, 2026-10-23), sections « Page d'accueil », « Tarif » and « Qui sommes-nous »

## What I understood

The founders read the site and found three things missing from what they wrote in the
questionnaire. First, « Comment ça marche » must be two pages, one per side, with a switch at the
top right, and the sentence « Berceo met en relation les familles et les professionnelles de santé
pour des gardes de nuit à domicile. Trois étapes de chaque côté, et rien de plus. » must go. Their
sentence replaces it. Second, the tariff page must show the four subscriptions with their names
and prices, and the 3 % service fee. Third, the « Qui sommes-nous » page gets their story, which
they wrote in the first person. Jamie decided on 2026-10-23 that a feedback request supersedes an
earlier requirement, with one exception: the site keeps no insurance wording until an insurance
contract exists (D-8). The subscriptions themselves are the epic `abonnements-familles`. This epic
holds the words.

Questions for the founders, with a default each:

1. Do the four prices of the devis still stand (Découverte 1 mois 24,90 €, Parenthèse 3 mois
   59,90 €, Sérénité 6 mois 94,90 €, Premium 12 mois 159,90 €)? Default: yes.
2. Does the fee sentence say « et l'assurance »? Default: no, until the insurance contract exists
   (D-8, Jamie 2026-10-23).
3. Does `/comment-ca-marche` open on the parents' page? Default: yes, with the switch to the
   professionals' page at the top right.

## Build order

1. qui-sommes-nous-recit — the founders' story replaces the placeholder, the page is indexed — depends-on: none
2. comment-ca-marche-par-persona — two pages, one per side, with the switch and the founders' intro sentence — depends-on: none
3. tarifs-abonnements — the four subscriptions, the 130 € floor and the 3 % fee on `/tarifs` — depends-on: none

## Out of scope

- A sweep of every sentence against Surya's guide. The feedback names one sentence. The
  `@relecture` tags in `src/content/` are the list to send Surya.
- The purchase of a subscription, the gate on the full profile, the sign-up that proposes the
  plans: the epic `abonnements-familles`.
- The charter button on the parents' side: `onboarding-retour-1/charte-cote-parents`.
- The insurance wording (D-8).
