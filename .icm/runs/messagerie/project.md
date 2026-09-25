# Project: messagerie

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/messagerie.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/messagerie/**, src/lib/reservations/answers.ts, src/lib/reservations/bookings.ts, src/lib/email/templates.ts, src/components/messagerie/**, src/components/reservations/**, src/components/shell/space-shell.tsx, src/components/shell/portal-shell.tsx, src/components/shell/mobile-menu.tsx, src/app/(portail)/espace/famille/messages/**, src/app/(portail)/espace/professionnelle/messages/**, src/app/(portail)/espace/famille/demandes/[id]/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/professionnelle/demandes/**, src/app/(portail)/espace/professionnelle/gardes/**, src/content/messagerie.ts, src/content/messagerie.test.ts, src/content/emails.ts, src/content/portal.ts, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
