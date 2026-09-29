# Breakdown: The back-office's duplicated rules, in one place each

## What was understood

The back-office-admin release review (2026-09-25) found two rules restated in more than one
place across `src/lib/admin/accounts.ts` and `src/lib/admin/lists.ts`: the `admin_journal`
insert's column list (`journalInsertIf` in `journal.ts`, then hand-written again in
`reactivateAccount` and `markReportHandled`), the garde clock and the either-side filter
(`gardeAhead`, `onEitherSide` in `accounts.ts`, restated as `bookingCondition` in `lists.ts`),
and — the wider case of the same problem — suspension held out of about twelve readers across
eight modules, written three different ways (`notSuspended()`, raw `not exists` SQL, and
`isNull(users.suspendedAt)` on an already-joined table). Grouped because both are the same
finding at different scope: a rule that changes reaches only the readers that call the shared
helper, and `accounts.ts`/`lists.ts` carry hand-written instances of both. Doing the narrower
SQL dedup first keeps its diff small and settled before the suspension sweep — which touches
many of the same functions in the same two files — moves through it.

## Build order

1. **admin-sql-helpers-dedupe** (chore, P3) — build the two `admin_journal` CTE inserts from
   `journalInsertIf`, and have `accounts.ts` call `bookingCondition("en-cours", id)` instead of
   restating `gardeAhead`/`onEitherSide`. No behaviour change.
2. **suspension-one-predicate** (chore, P3) — depends on 1. Move every reader named in the stub
   (about a dozen across eight modules, `accounts.ts` and `lists.ts` included) onto one
   enforcement point, against the shape 1 already settled in those two files, and add a source
   test refusing the rule written anywhere else.

No behaviour change in either stub; the existing suspension, recherche and back-office tests
hold both.
