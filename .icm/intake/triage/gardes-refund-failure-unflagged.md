# Stub: Flag a professional's cancellation whose refund failed

- lane: tweak
- found-by: cycle-de-garde-et-annulation release review · 2026-09-25
- complexity: low

## Problem

When a professional cancels a confirmed garde, `refundOnCancellation` in `src/lib/gardes/gardes.ts`
calls `refundFee(…, "annulation_professionnelle")` after the cancellation commits. If Stripe
errors, the fee stays `payee` (or becomes `remboursement_echoue`) and only a server log records
it. On `/admin/paiements` that row looks like any other paid fee, so the D-2 promise (a
professional's cancellation refunds the fee in full) depends on someone reading the Vercel logs.
The family's page says « Remboursement des frais de service en cours » indefinitely.

## Proposed change

On `/admin/paiements` (or `/admin/absences`' sibling), mark a paid fee whose booking is `annulee`
with `cancelled_by = 'professionnelle'` and `cancellation_kind = 'annulation'` as « À rembourser »,
so the founders' existing refund button (D-101) closes it. No new table: the booking already
carries the facts.

## Prompt

In the berceo repo, read `.icm/intake/triage/gardes-refund-failure-unflagged.md`. Make `/admin/paiements` flag a `payee` or `remboursement_echoue` fee whose booking was cancelled by the professional (`bookings.cancelled_by = 'professionnelle'`, `cancellation_kind = 'annulation'`) as awaiting a refund, with its words in `src/content/admin.ts` (`@relecture`). Read the fee through `src/lib/paiements/payments.ts` (the only reader of `payments`). Run it through `/pipeline tweak gardes-refund-failure-unflagged`.
