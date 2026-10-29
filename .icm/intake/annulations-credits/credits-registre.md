# Stub: A family sees her Berceo credits and when they expire

- feature-slug: credits-registre
- epic: annulations-credits
- sequence: 2 of 5
- depends-on: annulations-delai-et-motif
- complexity: medium
- priority: P1

## Problem

No credit exists. The table of the answers turns a fee into a Berceo credit in six of its
lines. A credit lasts 24 months (the answers [9.2]) and pays a later fee.

## Proposed change

A `credits` table: one row per credit with the family, the amount in cents, the origin (the
payment and the cancellation that made it, or the founder who granted it), the issue date, the
expiry at 24 months, and the amount spent. `src/lib/credits/` holds the only reads and writes:
the balance of a family at a moment, the issue of a credit, its spending. « Mes crédits » on
the family's home and on `/espace/famille/reservations` shows her balance and each credit with
its expiry. Nothing issues a credit yet, bar a test.

## Acceptance criteria

- [ ] The migration adds the table, and `src/lib/credits/` holds the only statements on it, held by an isolation test.
- [ ] The balance at a moment ignores expired credits and spent amounts, covered by `rules.test.ts`.
- [ ] The family's home and « Mes réservations » show her balance and her credits with their expiry, or one line when she has none.
- [ ] A credit's row keeps its origin, so the founders read why it exists.

## Out of scope

- Issuing a credit from a cancellation (`annulations-table`).
- Spending a credit (`credits-au-paiement`).

## Notes

- The amount is the fee's amount in cents (`amount_cents` on `payments`). A credit never
  carries a night rate.
- Files: `src/db/schema.ts`, `drizzle/`, a new `src/lib/credits/`, `src/app/(portail)/espace/famille/page.tsx`,
  `src/app/(portail)/espace/famille/reservations/page.tsx`, a new `src/content/credits.ts`.
