# Stub: The 3 % service fee through Stripe

- feature-slug: frais-de-service
- scope: plateforme-v1
- personas: parent, admin
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: candidature-et-reservation
- sequence: 9 of 15
- complexity: high
- recommended-model: opus

## Problem

Berceo's only revenue in V1 is the service fee, and the confirmation of a booking happens today with no payment at all.

## Proposed change

When the family presses "Accepter et réserver", she pays the service fee, 3 % of the professional's night rate, through Stripe Checkout with Bancontact and cards; the booking is confirmed by the payment's webhook, not by the click. The guide's sentence explains the fee on the Tarifs page and on the summary. If the professional later cancels (stub 11 calls this), the fee is refunded in full; if the family cancels, it is kept. A payments record per booking (amount, Stripe references, status, refund) that the admin can read. No receipts, no history for users. Stripe Tax and VAT are set from the founders' accountant's answer.

## Acceptance criteria (rough)

- [ ] A booking is only confirmed after Stripe reports the payment; an abandoned checkout leaves the request open.
- [ ] The amount is 3 % of the declared night rate, shown before payment with the € after the number.
- [ ] A refund can be issued programmatically and appears in the payments record.
- [ ] Stripe keys live in environment variables and `.env.example` names them; the webhook is verified.

## Out of scope (this feature)

- Subscriptions, gift cards, promo codes [D-3]; any payment for the night itself [D-1].

## Notes for Define

- D-1, D-2, D-3.
- Open: the fee base at confirmation and whether a Stripe minimum forces a floor (3 % of 100 € is 3 €); whether the founders' Stripe account exists in the company's name and who administers it; VAT position.
- Load the `security-audit` skill before the push: keys, webhook secret.
- touches: src/db/schema.ts, drizzle/**, src/app/api/stripe/**, src/lib/stripe/**, src/app/(portail)/famille/reservations/**, src/app/(admin)/paiements/**, src/content/paiement.ts, package.json, package-lock.json, .env.example
