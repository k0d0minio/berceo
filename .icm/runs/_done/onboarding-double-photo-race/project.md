# Project: onboarding-double-photo-race

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/onboarding-fichiers-concurrence/onboarding-double-photo-race.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/professionnelle/uploads.ts, src/app/(portail)/espace/professionnelle/actions.ts, src/lib/professionnelle/rules.ts, src/lib/professionnelle/rules.test.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- One photo per profile is held by the profile-row lock `recordUpload` already takes
  (`onboarding-upload-limit-race`, run D-1 there); no schema change, no index (run D-1 here).
- No cleanup of existing duplicate photo rows or stray objects (run D-2).
- Object-before-row ordering belongs to `onboarding-orphaned-objects` (3 of 3); do not change
  `removeDocuments` / `removeFile` here.
- `_shared/project-rules.md` and `AGENTS.md` standing rules: CI is the source of truth, no local
  build/lint/typecheck/dev.

## Context budget

- The Define map's cahier des charges lives in icm-board, unreachable from this cloud session;
  the stub, `onboarding-upload-limit-race`'s spec and a few greps of the actions and uploads
  files stood in.
