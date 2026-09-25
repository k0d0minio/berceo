# Project: cycle-de-garde-et-annulation

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/cycle-de-garde-et-annulation.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/gardes/**, src/lib/reservations/bookings.ts, src/lib/reservations/format.ts, src/lib/demandes/requests.ts, src/lib/demandes/rules.ts, src/lib/famille/profile.ts, src/lib/paiements/payments.ts, src/lib/paiements/rules.ts, src/lib/email/templates.ts, src/components/gardes/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/famille/demandes/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/admin/absences/**, src/app/(portail)/admin/page.tsx, src/app/api/cron/gardes-rappel/**, .github/workflows/gardes-rappel.yml, src/content/gardes.ts, src/content/gardes.test.ts, src/content/emails.ts, src/content/reservations.ts, src/content/admin.ts, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
