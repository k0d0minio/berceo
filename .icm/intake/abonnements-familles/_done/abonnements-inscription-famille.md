# Stub: A family chooses her subscription when she signs up

- feature-slug: abonnements-inscription-famille
- epic: abonnements-familles
- sequence: 2 of 5
- depends-on: abonnements-catalogue-stripe
- complexity: medium
- priority: P0

## Problem

The family sign-up creates an account and nothing else. The founders want the sign-up to propose
the subscriptions: without one, sign-up is not possible.

## Proposed change

The family sign-up shows the four plans with name, duration, price and what they give, before the
account form. The family picks one, creates her account, confirms her e-mail and lands on the
Stripe Checkout for that plan. Back in her space she is subscribed. A family who leaves before
paying keeps her account and her space asks her to finish her subscription. The sign-up button at
the bottom of the parents' « Comment ça marche » page and the one on `/tarifs` lead here.

## Acceptance criteria

- [ ] `/inscription-famille` shows the four plans and the family cannot continue without picking one.
- [ ] After the account and the e-mail confirmation, the family lands on the Checkout for her plan, and her space shows the plan when she returns.
- [ ] A family who abandons the Checkout sees, in her space, one call to finish her subscription.
- [ ] The buttons on the parents' « Comment ça marche » page and on `/tarifs` open the sign-up.
- [ ] The consent ledger keeps recording the CGU and the privacy policy, and the account keeps the plan chosen.

## Out of scope

- The gate on features (`abonnements-acces`).
- A plan change after sign-up (`abonnements-espace-echec-paiement`).

## Notes

- Question, with a default: does the account exist before the payment? Default: yes. Neon Auth
  creates the identity first and the Checkout follows the e-mail confirmation. An unpaid account
  is a normal account with no subscription.
- Files: `src/app/(auth)/inscription-famille/`, `src/lib/auth/`, `src/lib/abonnements/`,
  `src/app/(portail)/espace/famille/page.tsx`, `src/content/comptes.ts`,
  `src/content/abonnements.ts`, `src/content/comment-ca-marche.ts`, `src/content/tarifs.ts`.
