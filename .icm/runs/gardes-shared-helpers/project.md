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

- No behaviour change a persona can see. The only accepted difference is D-153's 16-character floor on the three hourly cron routes.
- Every existing test assertion survives, moved or re-imported, never weakened.
- `gardes.ts` keeps its writes and its `care_requests` reads where they are, because `care-requests-read-ownership` (next in the epic) moves those.
- `src/lib/demandes/rules.ts` stays pure and client-safe, with no `server-only` and no db import. `src/lib/cron.ts` is server-side (`node:crypto`).

## Context budget

- Define read the seven helper sites and their callers directly (targeted greps plus the files' relevant ranges) to find the copies the stub missed. That is the reason for D-153 and D-154.
