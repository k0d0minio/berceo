# Project: recherche-et-fiches-publiques

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/recherche-et-fiches-publiques.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/lib/recherche/**, src/components/recherche/**, src/content/recherche.ts, src/content/recherche.test.ts, src/app/(portail)/espace/famille/recherche/**, src/app/(portail)/espace/famille/page.tsx, src/components/shell/space-shell.tsx, src/content/portal.ts, src/app/(public)/professionnelles/**, src/app/(public)/garde-de-nuit/**, src/app/sitemap.ts, src/app/(auth)/actions.ts, src/app/(auth)/inscription-famille/**, src/app/(auth)/connexion/**, src/app/(auth)/verification-email/confirmer/**, src/components/auth/**, src/lib/auth/routing.ts, src/lib/auth/routing.test.ts, src/lib/communes/index.ts, src/lib/reservations/profiles.ts, src/app/(portail)/design-system/portail/page.tsx, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
