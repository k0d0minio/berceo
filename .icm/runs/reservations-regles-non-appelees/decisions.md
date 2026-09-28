# Decisions: reservations-regles-non-appelees

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none: the stub came from a release review, not a Scope; no `scope.md`.

## Made in this run

- D-153 — `isOnHerList`, `acceptTransition`, `declinedOnClose` and `canSendInPriority` are deleted
  with their unit tests, and the SQL that decides each rule is covered by built-never-run
  statement tests (`.toSQL()`), not a Neon-branch integration test: no page decides these apart
  from the SQL, and CI has no per-run database. Operator's choice, Define, 2026-09-28.
- D-154 — `canWithdraw` is wired: the professional's list shows « Retirer ma disponibilité » on
  `canWithdraw(answer, request, now)` instead of `answer === "en_attente"`. Operator's choice,
  Define, 2026-09-28.
