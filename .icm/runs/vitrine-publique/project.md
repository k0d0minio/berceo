# Project: vitrine-publique

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/vitrine-publique.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/app/(public)/**, src/app/(holding)/**, src/app/layout.tsx, src/app/sitemap.ts, src/app/robots.ts, src/app/fonts.ts, src/app/theme-color.ts, src/app/globals.css, src/content/**, src/components/vitrine/**, public/og.png, public/photos/**, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
