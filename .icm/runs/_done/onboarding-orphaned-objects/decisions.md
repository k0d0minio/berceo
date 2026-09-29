# Decisions: onboarding-orphaned-objects

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — the epic was cut from release-review findings, with no `scope.md`. The spec cites the
  project's D-41 and D-55 (the 30-day purge of refused files) and D-137 (files erased on account
  deletion) as the rules the defect breaks.

## Made in this run

- run D-1 — every removal deletes the object first and the row second, per file; a row goes only
  once its own object is gone. A dangling row (object gone, row delete failed) is the accepted
  failure: visible and retried, where an orphaned object is invisible. Define.
- run D-2 — a profession change whose stale documents could not be removed answers a successful
  save, keeps those rows, logs, and still clears the INAMI number (operator's answer in Define,
  2026-09-29). Define.
- run D-3 — the removal is one step in `src/lib/professionnelle/removals.ts` with storage and row
  deletion injected, the shape of `purge.ts`, so the order is unit-tested without a bucket or a
  database. Define.
