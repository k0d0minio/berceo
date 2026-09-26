# Decisions: onboarding-upload-limit-race

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — the epic was cut from release-review findings, with no `scope.md`.

## Made in this run

- run D-1 — the limit is held by a `for update` lock on the profile row taken earlier in the same
  `db.batch` as a guarded insert; a lone guarded `INSERT … SELECT` is not enough under READ
  COMMITTED. Define.
- run D-2 — the same-key double confirm is folded into this run (operator's answer in Define): the
  guard also refuses a key already recorded, and that refusal never deletes the object and
  answers `echec`, like today's pre-check. Define.
