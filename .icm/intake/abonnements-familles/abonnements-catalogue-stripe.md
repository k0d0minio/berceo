# Stub: A family buys one of the four subscriptions through Stripe

- feature-slug: abonnements-catalogue-stripe
- epic: abonnements-familles
- sequence: 1 of 5
- depends-on: none
- complexity: high
- priority: P0

## Problem

No subscription exists in the platform. The devis sells four, auto-renewing, and the founders
want them sold at sign-up.

## Proposed change

The four plans exist in Stripe as products with a recurring price each, in test mode on UAT. The
platform stores one subscription row per family: the Stripe customer, the Stripe subscription,
the plan, the status, the current period's end and the grace period's end. A family starts a
Stripe Checkout in subscription mode for one plan and comes back to her space. The webhook
handles the subscription's creation, updates, renewals, failures and end, and keeps the row
true. One rule, `hasActiveSubscription`, says whether a family is subscribed, and every later
stub reads it. Invoices come from Stripe.

## Acceptance criteria

- [ ] A family on UAT buys each of the four plans with a Stripe test card and her space shows the plan and the renewal date.
- [ ] The row follows Stripe through the webhook: active after payment, past due after a failed renewal, ended after a cancellation.
- [ ] The four price ids are read from environment variables named in `.env.example`, and no id is in git.
- [ ] A second Checkout for a family who already has an active subscription is refused.
- [ ] The migration adds the subscriptions table and `src/lib/abonnements/` holds the only reads and writes of it.
- [ ] `src/lib/abonnements/rules.test.ts` covers the status transitions and the grace period.

## Out of scope

- The sign-up flow, the gate on features, the space, the back-office (stubs 2 to 5).
- Gift cards, promo codes, trials.

## Notes

- Questions, with a default each: see the breakdown, 1, 4 and 5.
- The 3 % fee's Checkout in `src/lib/paiements/` stays as it is. The subscription has its own
  module. Both share the Stripe client and the webhook route, which dispatches by event type.
- Stripe Checkout in subscription mode takes Bancontact for the first payment and SEPA Direct
  Debit for renewals. Say so on the Checkout page's return.
- Files: `src/db/schema.ts`, `drizzle/`, a new `src/lib/abonnements/`,
  `src/app/api/webhooks/stripe/route.ts`, `.env.example`, `src/content/abonnements.ts`,
  `README.md` (a section « The subscriptions »).
