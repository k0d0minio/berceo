# Project: avis-etoiles

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/avis-etoiles.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/avis/**, src/components/avis/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/espace/famille/professionnelles/[id]/page.tsx, src/app/(portail)/espace/famille/demandes/[id]/page.tsx, src/app/(portail)/espace/professionnelle/demandes/page.tsx, src/app/(portail)/espace/famille/page.tsx, src/app/(portail)/espace/professionnelle/page.tsx, src/app/(portail)/admin/avis/**, src/app/(portail)/admin/page.tsx, src/app/(portail)/design-system/portail/page.tsx, src/app/api/cron/avis-invitations/**, .github/workflows/avis-invitations.yml, src/lib/reservations/answers.ts, src/lib/reservations/profiles.ts, src/lib/demandes/requests.ts, src/lib/email/templates.ts, src/content/avis.ts, src/content/avis.test.ts, src/content/emails.ts, src/content/admin.ts, src/lib/auth/routing.test.ts, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
