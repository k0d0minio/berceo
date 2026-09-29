# Project: onboarding-orphaned-objects

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/onboarding-fichiers-concurrence/onboarding-orphaned-objects.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/app/(portail)/espace/professionnelle/actions.ts, src/lib/professionnelle/removals.ts, src/lib/professionnelle/removals.test.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- Object before row on every removal path; a row goes only once its own object is gone.
- The purge (D-41, D-55) and the account deletion (D-137) start from the rows: a row must never
  be lost while its object stays.
- `saveProfile` answers a successful save even when stale documents could not be removed
  (decided at Define with the operator, 2026-09-29).
- No schema change, no migration, no new catalogue text.

## Context budget

- Define: the cahier des charges in icm-board is not reachable from a cloud session; personas
  and touches came from the stub, `AGENTS.md` and greps of `actions.ts`, `purge.ts`,
  `accounts.ts` and `storage.ts`.
