# Project: disponibilites-indicatives

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/disponibilites-indicatives.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/disponibilites/**, src/app/(portail)/espace/professionnelle/disponibilites/**, src/app/(portail)/espace/professionnelle/page.tsx, src/app/(portail)/design-system/portail/page.tsx, src/components/disponibilites/**, src/components/shell/space-shell.tsx, src/content/disponibilites.ts, src/content/disponibilites.test.ts, src/content/comptes.ts, src/lib/auth/routing.test.ts, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- Availability filters nothing and blocks nothing (D-12): no file under `src/lib/demandes/`, no
  e-mail and no digest reads `professional_availability`.
- Two states only (D-72): only available nights are stored; « Indisponible » deletes.
- The window is tonight to today + 56 days, Brussels (D-70); dates reuse `src/lib/demandes/rules.ts`.
- No family-facing page mounts the block in this run (D-69); stubs 8 and 15 do.
- Only a `valide` profile marks nights, and `nextAvailableNights` returns none for any other.
- Words from the guide verbatim; everything else `@relecture Surya` (D-19); no red or green (D-24).

## Context budget

- Define read Surya's editorial guide (« Les disponibilités », « La recherche» in
  `.icm/processed/2026-09-23-guidelines-ditoriale-seo-berceo.txt`), the professional's space pages
  and `src/lib/demandes/rules.ts`, to quote the guide exactly and reuse the Brussels date helpers.
