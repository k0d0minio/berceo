# Stub: A paid fee whose booking was deleted with an account reads as « still being settled »

- lane: bug
- found-by: frais-de-service release review · 2026-09-25
- complexity: standard

## Problem

`bookings` cascade-delete with their request, answer, profile or family, while
`payments.booking_id` is `ON DELETE SET NULL` (D-96). A fee whose booking was really made then
reads `payee` with no booking, which `src/lib/paiements/payments.ts` treats as « paid, not yet
settled »: the return URL, or `startCheckout`'s in-flight guard after a republish, runs
`settle()` on it and refunds it automatically as `reservation_impossible`, with the refund
e-mail, instead of as the cancellation it was (D-2 says a professional's cancellation is
refunded in full, so the money is right; the reason and the family's message are not).

## Proposed change

Tell « booked then lost » from « not yet booked »: a `booked_at` (or `settled_at`) moment on
`payments`, set with `booking_id` in `acceptAnswer`'s transaction, so `settle()` and the guard
only act on a fee never booked; decide with cycle-de-garde-et-annulation which reason a lost
booking's refund carries.

## Prompt

In the berceo repo, read `.icm/intake/triage/frais-paiement-sans-reservation.md`, then
`src/lib/paiements/payments.ts` (`confirmPayment`, `settle`, `startCheckout`) and
`src/lib/reservations/bookings.ts` (`acceptAnswer`'s last statement). Add a moment on
`payments` that records a booking was made (one migration), set it where `booking_id` is set,
and make `settle()` and `startCheckout`'s in-flight guard act only on fees never booked. Run it
through `/pipeline bug frais-paiement-sans-reservation`.
