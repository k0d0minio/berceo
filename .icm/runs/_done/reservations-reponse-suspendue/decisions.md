# Decisions: reservations-reponse-suspendue

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none (no scope.md for this epic; the stub and D-85, D-73, D-134 from earlier runs are the context)

## Made in this run

- D-146 — The only path out of `valide` today is the professional's own reopening (`reopenFile`, `valide → brouillon`); the founders' review decides only `en_attente` and `complement_demande` files and answers need `valide`, so `src/lib/admin/review.ts` carries no withdrawal. Define, 2026-09-26.
- D-147 — The reopen dialog tells her, before she confirms, that her waiting availabilities will be withdrawn (one sentence, `@relecture`). Operator's call, Define, 2026-09-26.
- D-148 — A one-off data migration withdraws the `en_attente` answers of every profile already out of `valide`, so no row from before the fix can come back. Operator's call, Define, 2026-09-26.
