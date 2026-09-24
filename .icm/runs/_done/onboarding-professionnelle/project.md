# Project: onboarding-professionnelle

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/onboarding-professionnelle.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/espace/professionnelle/**, src/app/(portail)/admin/**, src/app/api/fichiers/**, src/lib/professionnelle/**, src/lib/documents/**, src/lib/communes/**, src/lib/settings/**, src/components/professionnelle/**, src/content/professionnelle.ts, src/content/admin.ts, scripts/communes/**, package.json, package-lock.json, .env.example, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- Only a `valide` profile may ever be shown to anyone but its owner and the admins; nothing in
  this run shows one to anyone else.
- No store URL for reading reaches a browser; every file goes through `/api/fichiers/[id]`.
- Night rate: whole euros, 100 to 300, no automatic tariff, no student range [D-4].
- Criminal record is a declaration, not an upload [D-6]; qualifications only, no identity check
  [D-5]; students gated by the `app_settings` switch [D-7]; communes as NIS codes [D-11].
- Every word in `src/content/`, guide verbatim or `@relecture Surya` [D-19]; no insurance wording
  [D-8]; red and green only in confirmation dialogs [D-24].
- One migration, drizzle-kit generated; production's Neon project is never written (D41).
- Out of scope: the founders' review and the 30-day purge of refused files (stub 5), showing
  profiles (stubs 7, 8, 15), availability (stub 13).

## Context budget

- Define read the guide's "Les comptes", "Le profil professionnel" and "L'outil de
  vérification", the `comptes-neon-auth` spec, `src/db/schema.ts`, `src/lib/auth/routing.ts`,
  and Neon's object-storage docs, plus a live read of both projects' storage settings.
