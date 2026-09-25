# Project: back-office-admin

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/back-office-admin.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/admin/**, src/components/admin/**, src/app/(portail)/admin/**, src/content/admin.ts, src/content/admin.test.ts, src/content/comptes.ts, src/content/emails.ts, src/lib/email/templates.ts, src/lib/auth/guard.ts, src/lib/auth/current-user.ts, src/lib/auth/routing.ts, src/lib/auth/routing.test.ts, src/app/(auth)/actions.ts, src/app/(auth)/connexion/**, src/lib/recherche/**, src/app/sitemap.ts, src/lib/reservations/answers.ts, src/lib/reservations/bookings.ts, src/lib/reservations/profiles.ts, src/lib/demandes/requests.ts, src/lib/demandes/notify.ts, src/lib/gardes/gardes.ts, src/lib/avis/ratings.ts, src/lib/messagerie/conversations.ts, src/lib/paiements/payments.ts, src/lib/documents/**, src/lib/disponibilites/**, src/lib/famille/**, src/components/gardes/absences-table.tsx, src/app/(portail)/design-system/portail/page.tsx, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
