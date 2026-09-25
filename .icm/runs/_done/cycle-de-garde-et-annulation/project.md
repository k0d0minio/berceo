# Project: cycle-de-garde-et-annulation

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/cycle-de-garde-et-annulation.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/gardes/**, src/lib/reservations/bookings.ts, src/lib/reservations/format.ts, src/lib/demandes/requests.ts, src/lib/demandes/rules.ts, src/lib/famille/profile.ts, src/lib/paiements/payments.ts, src/lib/paiements/rules.ts, src/lib/email/templates.ts, src/components/gardes/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/famille/demandes/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/admin/absences/**, src/app/(portail)/admin/page.tsx, src/app/api/cron/gardes-rappel/**, .github/workflows/gardes-rappel.yml, src/content/gardes.ts, src/content/gardes.test.ts, src/content/emails.ts, src/content/reservations.ts, src/content/admin.ts, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- D-2: refund only on the professional's cancellation, through `refundFee` (D-94); never on a
  family's cancellation, never automatically on an absence (D-106).
- D-17: no start or end confirmation, no in-app dispute; the state is derived by time (D-109).
- D-15 / D-77: the address stays read through `src/lib/famille/` only, and only on a confirmed
  garde whose night has not ended (D-110).
- D-8, D-19: no insurance wording; every word in `src/content/`, `@relecture` unless quoted.
- D-24: red and green only in the confirmation dialogs.
- One migration, forward-only; `vercel.json` untouched (Vercel Cron does not reach UAT).
- Out of scope: ratings (stub 12), the full bookings view and absence review (stub 14).

## Context budget

- Define read `src/db/schema.ts`, `src/lib/paiements/payments.ts` (`refundFee`),
  `src/lib/messagerie/rules.ts`, `src/lib/demandes/rules.ts`, the digest workflow and Surya's
  editorial guide beyond its Inputs, to settle the data model, the refund call and the e-mail
  wording.
