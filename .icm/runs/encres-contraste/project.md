# Project: encres-contraste

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/finition-accueil/encres-contraste.md
- scope: .icm/runs/finition-accueil/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/app/globals.css, src/app/contrast.test.ts (new), src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/input.tsx, src/components/ui/tabs.tsx, src/components/ui/striped-section.tsx, src/components/vitrine/section.tsx, src/components/shell/public-footer.tsx, src/components/shell/public-header.tsx, src/components/shell/portal-shell.tsx, src/components/shell/mobile-menu.tsx, src/components/professionnelle/steps-header.tsx, src/components/professionnelle/file-slot.tsx, src/components/disponibilites/availability-calendar.tsx, src/app/(public)/design-system/page.tsx, src/content/design-system.ts, and every file under src/ that names `text-sauge` or `text-taupe` (67 files, 241 uses, a mechanical rename)
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
