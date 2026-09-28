# Project: admin-sql-helpers-dedupe

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/back-office-admin-dedup/admin-sql-helpers-dedupe.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/admin/journal.ts, src/lib/admin/accounts.ts, src/lib/admin/lists.ts, src/lib/admin/review.ts, src/lib/paiements/payments.ts, src/lib/admin/journal-isolation.test.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- No behaviour change: every SQL statement keeps its semantics, each CTE act stays one
  statement (D-152), and every journal entry carries the same values as before.
- `admin_journal` is append-only (D-54, the trigger in `drizzle/0004_verification_back_office.sql`):
  nothing here updates or deletes it, and no migration is part of this run.
- The suspension predicate in `decide` and elsewhere is `suspension-one-predicate`'s — leave it
  as written.

## Context budget

- Define read `journal.ts`, `accounts.ts`, `lists.ts`, `review.ts` and the refund in `payments.ts` to find the hand-written inserts and confirm `bookingCondition("en-cours")` equals `gardeAhead` — beyond targeted greps, needed to size the stub's scope question.
