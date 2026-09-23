# Project: socle-design-system

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/socle-design-system.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/app/globals.css, src/app/layout.tsx, src/app/fonts.ts, src/app/page.tsx, src/app/(holding)/**, src/app/(public)/**, src/app/api/health/route.ts, src/components/ui/**, src/components/shell/**, src/components/berceo-logo.tsx, src/content/**, package.json, package-lock.json, .icm/project.json, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- D-9: the DA is applied literally, including text/button colours below AA contrast (operator, Define).
- D-24: red/green confirmation tokens live only in `src/components/ui/confirm-dialog.tsx`.
- D-19/D-25: every rendered word comes from `src/content/`; the two CTA entries are distinct.
- The holding page at `/` must look and read exactly as before; AGENTS.md's dark rule is not touched.
- No shadows, no gadget animations, no gendered pink/blue, no naïve illustrations (the DA's "à éviter").
- Fraunces stands in for Comodo behind `src/app/fonts.ts`; no other file names the display face.

## Context budget

- Define read the DA and editorial guide extracts in `.icm/processed/` to fill the button table, type scale and palette.
