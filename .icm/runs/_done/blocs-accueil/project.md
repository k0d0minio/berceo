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

- No word changes: `src/content/` stays untouched (D-5); no sixth reason card.
- No colour changes: colour tokens in `src/app/globals.css` and the ink classes stay (encres-contraste owns them); `contrast.test.ts` and `vitrine.test.ts` stay green.
- The type tokens (`--taille-*`) keep their values: every band fits at the DA's sizes.
- Fixes live in the shared components (D-4): `step-list.tsx`, `reason-grid.tsx`, `striped-section.tsx`; `card.tsx`'s default rhythm stays for the portal.
- The header and the hero are premier-ecran's (merged, k0d0minio/berceo#46) — not touched here.

## Context budget

- Define read the four shared components, the homepage and its content catalogue, and the type tokens beyond its Inputs, to size the layouts and settle the stub's two open points and the stripes' alignment with arithmetic rather than guesses.
