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

- Only `valide` profiles are ever read by `src/lib/recherche/`; any other status reads as unknown (D-75).
- No surname, e-mail, phone, INAMI, rate, documents or declarations leave the reader; no photo on a public page (D-14, D-126).
- The note and gardes count come only from `src/lib/avis/`, the nights only from `src/lib/disponibilites/`; nothing about a care request reads availability.
- The zone is the only filter; no sort control (D-11, D-123).
- Every word in `src/content/recherche.ts`, to Surya's guide, `@relecture` where not quoted (D-19); « Trouver une professionnelle » as the nav label (D-25).
- `safeReturnPath` keeps accepting only space paths; `robots.ts` unchanged (only production crawled).
- No schema change.

## Context budget

- Define read Surya's editorial guide (« La recherche », the SEO chapter), the avis-etoiles spec, `src/lib/auth/` (routing, guard), `src/app/(auth)/actions.ts`, the confirmation route and `src/lib/communes/index.ts` beyond its Inputs, to quote the guide and trace the way back through sign-up.
