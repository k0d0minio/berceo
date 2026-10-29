# Stub: A family's credit pays her next service fee

- feature-slug: credits-au-paiement
- epic: annulations-credits
- sequence: 4 of 5
- depends-on: credits-registre
- complexity: high
- priority: P1

## Problem

A credit that nothing spends is worth nothing. The answers [9.2] say a credit is « utilisable
pour une prochaine réservation ».

## Proposed change

When the family accepts an answer, the fee's Checkout reads her balance first. A balance that
covers the fee books the garde at once, spends the credit and opens no Checkout. A smaller
balance spends itself and sends the rest to Stripe. The payment row records the part paid by
credit and the part paid at Stripe. The récapitulatif and the confirmation e-mail name both.

## Acceptance criteria

- [ ] With a balance above the fee, « Accepter et réserver » books the garde with no Checkout, and the credit's spent amount grows by the fee.
- [ ] With a smaller balance, the Checkout asks the difference, and the booking is made when it completes.
- [ ] A Checkout that expires or is abandoned spends no credit.
- [ ] The payment row and the family's récapitulatif show the part paid by credit.
- [ ] `/admin/paiements` shows the part paid by credit on each fee.

## Out of scope

- A refund of a credit to a card.
- A credit on a subscription.

## Notes

- Question, with a default: the breakdown's question 2.
- The spend and the booking land in one statement, or the spend is reserved and confirmed by
  the webhook, like the booking by the payment (D-100). Decide at Spec approved.
- Files: `src/lib/paiements/payments.ts`, `src/lib/reservations/bookings.ts`, `src/lib/credits/`,
  `src/app/api/webhooks/stripe/route.ts`, `src/content/paiement.ts`, `src/content/emails.ts`, `src/content/admin.ts`.
