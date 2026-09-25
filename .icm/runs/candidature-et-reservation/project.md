# Project: candidature-et-reservation

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/candidature-et-reservation.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/demandes/**, src/lib/reservations/**, src/lib/famille/**, src/lib/professionnelle/rules.ts, src/app/api/fichiers/[id]/route.ts, src/app/(portail)/espace/famille/**, src/app/(portail)/espace/professionnelle/demandes/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/espace/professionnelle/page.tsx, src/components/demandes/**, src/components/reservations/**, src/components/shell/space-shell.tsx, src/content/demandes.ts, src/content/reservations.ts, src/content/emails.ts, src/lib/email/templates.ts, src/lib/auth/routing.test.ts, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
