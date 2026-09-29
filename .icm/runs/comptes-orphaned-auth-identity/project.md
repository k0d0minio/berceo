# Project: comptes-orphaned-auth-identity

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/comptes-auth-recuperation/comptes-orphaned-auth-identity.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/app/(auth)/actions.ts, src/lib/auth/users.ts, src/lib/auth/, src/app/(auth)/connexion/page.tsx, src/content/comptes.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
