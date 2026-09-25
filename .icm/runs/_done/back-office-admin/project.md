# Project: back-office-admin

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/back-office-admin.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/admin/**, src/components/admin/**, src/app/(portail)/admin/**, src/content/admin.ts, src/content/admin.test.ts, src/content/comptes.ts, src/content/emails.ts, src/lib/email/templates.ts, src/lib/auth/guard.ts, src/lib/auth/current-user.ts, src/lib/auth/routing.ts, src/lib/auth/routing.test.ts, src/app/(auth)/actions.ts, src/app/(auth)/connexion/**, src/lib/recherche/**, src/app/sitemap.ts, src/lib/reservations/answers.ts, src/lib/reservations/bookings.ts, src/lib/reservations/profiles.ts, src/lib/demandes/requests.ts, src/lib/demandes/notify.ts, src/lib/gardes/gardes.ts, src/lib/avis/ratings.ts, src/lib/messagerie/conversations.ts, src/lib/paiements/payments.ts, src/lib/documents/**, src/lib/disponibilites/**, src/lib/famille/**, src/components/gardes/absences-table.tsx, src/app/(portail)/design-system/portail/page.tsx, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- The journal is append-only (D-54): every new admin action goes through `journalInsert` in the same transaction as its change; the trigger is never touched.
- Suspension never cancels or refunds a confirmed garde (D-134); deletion anonymises, never hard-deletes a `users` row (D-136, D-137).
- A family's address is read only by `src/lib/famille/` and never shown in the back-office (D-15).
- Module ownership from AGENTS.md holds: requests are written through `src/lib/demandes/`, answers and bookings through `src/lib/reservations/`, booking status columns through `src/lib/gardes/`, payments through `src/lib/paiements/`, ratings through `src/lib/avis/`, documents through `src/lib/documents/`. `src/lib/admin/` orchestrates by calling them.
- Every word in the catalogue under the guide's rules (D-19); red and green only in confirmation dialogs (D-24); no invented contact address (Reply-To is the founder's own account e-mail, D-138).
- One forward-only migration (D-140), generated with `npm run db:generate -- --name back_office_admin`; `.icm/skills/database-migration/`.
- Never run build/lint/typecheck/dev locally: CI is the source of truth (AGENTS.md).

## Context budget

- Define read beyond its Inputs: the guide's « Le backoffice » section (verbatim labels), `src/db/schema.ts`, `src/lib/admin/journal.ts`, `src/lib/auth/guard.ts`, the current `/admin` page, and the archived specs that deferred work to this stub (onboarding-professionnelle, verification-back-office, frais-de-service, avis-etoiles, recherche-et-fiches-publiques).
