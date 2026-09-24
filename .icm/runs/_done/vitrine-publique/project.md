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

- Every word in `src/content/` (D-19); `@relecture` on anything not verbatim from the guide.
- No insurance wording (D-8), no Facebook group (D-23), no price but 100–300 € and 3 % (D-2,
  D-3, D-4), no blanket "diplômées" (D-7), the CTA rule (D-25).
- No colour value or literal text in a component; no shadow (socle's rules, D-9).
- The sign-up routes are `comptes-neon-auth`'s: link to them, never create them here.
- No legal text and no founders' story is written; placeholders only, `noindex`.
- Base branch is `uat` (D-22); the run merges there, production is the promotion.

## Context budget

- Define read `origin/uat`'s shipped socle build notes, shell components and `src/content/` to
  set `touches:` against the real tree (the stub guessed `src/app/(vitrine)/**`; socle shipped the
  `(public)` group), and the four image-bank PNGs to settle D-20's reach.
