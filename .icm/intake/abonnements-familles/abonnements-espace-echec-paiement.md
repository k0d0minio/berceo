# Stub: A family manages her subscription, and a failed renewal gives her 7 days

- feature-slug: abonnements-espace-echec-paiement
- epic: abonnements-familles
- sequence: 4 of 5
- depends-on: abonnements-catalogue-stripe
- complexity: medium
- priority: P1

## Problem

A family has no place to see, change or stop her subscription. A failed renewal must give her
7 days of grace with an e-mail, then stop the subscriber's features while confirmed bookings
stand (the answers [9.7]).

## Proposed change

« Mon abonnement » in the family's space shows the plan, the price, the renewal date and the
status, with a button to Stripe's customer portal to change the card, change the plan, cancel at
the period's end and download invoices. On a failed renewal, Stripe retries, the family gets one
e-mail, the row enters its grace period of 7 days, and the space shows a warning. After 7 days
without payment the subscription is past due and the gate closes. A payment during the grace
period restores everything.

## Acceptance criteria

- [ ] `/espace/famille/abonnement` shows the plan, the price, the renewal date and the status.
- [ ] The portal button opens Stripe's customer portal and a plan change or a cancellation there reaches the row through the webhook.
- [ ] A failed renewal on UAT, simulated with Stripe's test clock, sends one e-mail and opens a 7-day grace period shown in the space.
- [ ] After the grace period the gate closes, and a payment reopens it.
- [ ] The e-mail follows the guide's tone and is covered by the e-mail tests.

## Out of scope

- Refunds of a subscription. Stripe's portal and the founders handle them.
- A reminder before the renewal.

## Notes

- Question, with a default: cancel at the period's end only, or at once? Default: at the
  period's end. The family keeps what she paid for.
- The grace period's end is a column the webhook sets. The gate reads it.
- Files: `src/lib/abonnements/`, `src/app/(portail)/espace/famille/abonnement/`,
  `src/app/api/webhooks/stripe/route.ts`, `src/lib/email/templates.ts`,
  `src/content/abonnements.ts`, `src/content/emails.ts`.
