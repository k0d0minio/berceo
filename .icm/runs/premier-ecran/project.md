# Project: premier-ecran

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/finition-accueil/premier-ecran.md
- scope: .icm/runs/finition-accueil/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/components/shell/public-header.tsx, src/app/(public)/page.tsx, src/components/vitrine/page-header.tsx, src/components/vitrine/photo.tsx, src/components/vitrine/cta-pair.tsx, src/app/globals.css (only if a type token moves)
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- No word changes: `src/content/` untouched, the H1 included (D-5).
- No colour changes: the tokens encres-contraste set stay; `contrast.test.ts` stays green.
- The fix lives in the shared components (header, hero, `PageHeader`, `Photo`), not a homepage fork (D-4).
- H1 within the DA's scale: 56–64 px from md, 38–44 px below; ≤ 4 lines at 1280 and 1440; never overflowing 320–1920 (D-6).
- Full nav from xl (1280 px), menu panel below; photo fills the text block's height from lg (operator, 2026-09-25).
- The bands below the hero are blocs-accueil's; keep `page.tsx` edits to the hero section.
- Never run build/lint/typecheck/dev locally beyond the session's `format.sh`/`lint.sh` (AGENTS.md: CI is the source of truth).

## Context budget

- Define read `src/components/shell/public-header.tsx`, `src/components/vitrine/page-header.tsx`, `cta-pair.tsx`, `photo.tsx`, the hero section and the type tokens in `globals.css` to settle the header breakpoint with a width estimate — targeted reads, within the contract's allowance.
