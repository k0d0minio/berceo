# Project: avis-etoiles

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/avis-etoiles.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/avis/**, src/components/avis/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/espace/famille/professionnelles/[id]/page.tsx, src/app/(portail)/espace/famille/demandes/[id]/page.tsx, src/app/(portail)/espace/professionnelle/demandes/page.tsx, src/app/(portail)/espace/famille/page.tsx, src/app/(portail)/espace/professionnelle/page.tsx, src/app/(portail)/admin/avis/**, src/app/(portail)/admin/page.tsx, src/app/(portail)/design-system/portail/page.tsx, src/app/api/cron/avis-invitations/**, .github/workflows/avis-invitations.yml, src/lib/reservations/answers.ts, src/lib/reservations/profiles.ts, src/lib/demandes/requests.ts, src/lib/email/templates.ts, src/content/avis.ts, src/content/avis.test.ts, src/content/emails.ts, src/content/admin.ts, src/lib/auth/routing.test.ts, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- Build waits for cycle-de-garde-et-annulation to merge; the garde's state is read from it, never re-implemented here.
- Stars only, no free text anywhere: no text column, no text input (D-18).
- Double-blind: a rating counts only once both sides have rated or 14 days after the garde's end (D-106).
- One rating per side per garde, no edit, no reminder e-mail (D-107).
- The professional's request card gains the family's note and gardes count, never an identity column (D-108).
- `src/lib/avis/` is the only reader and writer of `ratings` and `rating_invitations`.
- Every word in `src/content/`, `@relecture Surya` unless quoted from the guide (D-19); no red or green (D-24).

## Context budget

- Define read Surya's editorial guide (« Les e-mails »), the kick-off notes on ratings, `src/lib/reservations/`, `src/db/schema.ts` and `demandes-digest.yml` beyond its Inputs: to quote the guide's post-garde e-mail, to confirm bookings carry no state yet, and to model the scheduled pass.
