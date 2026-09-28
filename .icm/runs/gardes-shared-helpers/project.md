# Project: gardes-shared-helpers

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/gardes-annulation-suivi/gardes-shared-helpers.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/demandes/rules.ts, src/lib/messagerie/rules.ts, src/lib/gardes/rules.ts, src/lib/avis/rules.ts, src/components/avis/ratings-table.tsx, src/lib/reservations/notices.ts, src/lib/gardes/gardes.ts, src/lib/gardes/notify.ts, src/lib/avis/notify.ts, src/lib/cron.ts, src/lib/admin/purge.ts, src/app/api/cron/demandes-digest/route.ts, src/app/api/cron/gardes-rappel/route.ts, src/app/api/cron/avis-invitations/route.ts, src/app/api/cron/purge-dossiers-refuses/route.ts, and the matching `*.test.ts`
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
