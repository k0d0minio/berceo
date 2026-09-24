# Project: onboarding-professionnelle

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/onboarding-professionnelle.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/espace/professionnelle/**, src/app/(portail)/admin/**, src/app/api/fichiers/**, src/lib/professionnelle/**, src/lib/documents/**, src/lib/communes/**, src/lib/settings/**, src/components/professionnelle/**, src/content/professionnelle.ts, src/content/admin.ts, scripts/communes/**, package.json, package-lock.json, .env.example, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
