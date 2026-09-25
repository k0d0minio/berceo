# Project: blocs-accueil

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/finition-accueil/blocs-accueil.md
- scope: .icm/runs/finition-accueil/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/app/(public)/page.tsx, src/components/vitrine/step-list.tsx, src/components/vitrine/reason-grid.tsx, src/components/ui/striped-section.tsx, src/components/vitrine/section.tsx (only if a band-level rule lands there), src/components/ui/card.tsx (only if the reason cards' rhythm cannot be set from reason-grid.tsx)
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
