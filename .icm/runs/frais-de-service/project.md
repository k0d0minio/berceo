# Project: frais-de-service

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/frais-de-service.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/paiements/**, src/lib/reservations/bookings.ts, src/lib/reservations/notify.ts, src/app/api/webhooks/stripe/**, src/app/(portail)/espace/famille/demandes/actions.ts, src/app/(portail)/espace/famille/demandes/[id]/page.tsx, src/app/(portail)/espace/famille/professionnelles/[id]/page.tsx, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/admin/paiements/**, src/app/(portail)/admin/page.tsx, src/components/reservations/accept-answer.tsx, src/components/admin/**, src/content/paiement.ts, src/content/admin.ts, src/content/emails.ts, src/lib/email/templates.ts, package.json, package-lock.json, .env.example, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
