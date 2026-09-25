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

- No word on a public page changes (D-5); the only new words are the two swatch names on the
  noindex `/design-system`, flagged `@relecture`.
- The five DA values stay as they are (D-1); colour values live in `src/app/globals.css` only.
- No layout or size change: that is premier-ecran and blocs-accueil (D-4, D-6).
- The signed-in spaces receive the tokens and the rename, and are checked, not redesigned (D-3).
- Red and green stay in `confirm-dialog.tsx` only (D-24).
- The sage ink is `#3c584b`, one token, and the sage band's button is deep sage filled: both the
  operator's choices on 2026-09-25, recorded in the spec.

## Context budget

- Define read the button, card, striped section, section, footer, reason grid, parts of the step
  header, the availability calendar, the design system catalogue and the homepage beyond its
  Inputs, to fix the button rows and every white-on-light pair.
