# Project: reservations-reponse-suspendue

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/professionnelle-invalidee-consequences/reservations-reponse-suspendue.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/app/(portail)/espace/professionnelle/actions.ts, src/lib/reservations/**, src/content/professionnelle.ts, drizzle/**
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- Withdrawal is silent and uses the existing `retiree` state (D-73); no new status, no e-mail.
- Only `reopenFile` triggers it (D-144); suspension already withdraws (D-134) and is not touched.
- The status change and the withdrawal land in one write, and only when the status actually moved.
- Conversations are the epic's second stub (`messagerie-profil-non-valide`): not touched here.
- The backfill migration is data-only and idempotent (D-146).

## Context budget

- Define read review.ts, admin/rules.ts, answers.ts, professionnelle/rules.ts, espace/professionnelle/actions.ts and accounts.ts to establish D-144; the cahier des charges (icm-board) was not read.
