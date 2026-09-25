# Stub: The back-office's journal inserts and garde clock written once

- lane: chore
- found-by: back-office-admin release review · 2026-09-25
- complexity: low
- priority: P3

## Problem

Two pieces of SQL are hand-written more than once in the back-office (back-office-admin):

- The `admin_journal` insert's column list: `journalInsertIf` in `src/lib/admin/journal.ts`, and
  again inside the CTEs of `reactivateAccount` (`src/lib/admin/accounts.ts`) and
  `markReportHandled` (`src/lib/admin/lists.ts`). A renamed or added journal column would be
  updated in one place and fail at runtime in the others, on an append-only ledger.
- The garde's clock and the either-side filter: `localNow`, the night's end and « this account on
  either side » exist in `accounts.ts` (`gardeAhead`, `onEitherSide`) and again in `lists.ts`
  (`bookingCondition`). The account page's « gardes à venir » and the bookings list
  `?compte=…&etat=en-cours` are two definitions of the same set (D-133 is about exactly that).

## Proposed change

Build the two CTE inserts from `journalInsertIf` (or a batch of the update and
`journalInsertIf(…, condition)`), and have `accounts.ts` use `bookingCondition("en-cours", id)`
for its upcoming gardes and the deletion guard. Behaviour unchanged.

## Prompt

In the berceo repo, read `.icm/intake/triage/admin-sql-helpers-dedupe.md`, `src/lib/admin/journal.ts`,
`accounts.ts` and `lists.ts`. Make every journal insert go through the journal module's helpers and
every « garde not ended, this account on either side » through `bookingCondition`, keeping behaviour.
Run it through `/pipeline chore admin-sql-helpers-dedupe`.
