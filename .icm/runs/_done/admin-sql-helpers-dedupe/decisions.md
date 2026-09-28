# Decisions: admin-sql-helpers-dedupe

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — no scope run; the epic was cut from the back-office-admin release review (2026-09-25). D-54 (the append-only journal) and D-133 (one condition per overview block and its list) are inherited from verification-back-office and back-office-admin.

## Made in this run

D-150 was the highest id on `main` and every remote branch on 2026-09-28.

- D-151 — every hand-written `admin_journal` insert moves into `journal.ts`, the two the stub named and the two it missed (`decide` in `review.ts`, the founder refund in `payments.ts`), with a source test refusing the insert anywhere else. The operator's choice in Define, 2026-09-28.
- D-152 — the CTE acts stay one SQL statement: `journal.ts` gains a CTE-aware helper building the insert-select from the CTE's row, rather than splitting each act into `db.batch` + `journalInsertIf`. The operator's choice in Define, 2026-09-28.
