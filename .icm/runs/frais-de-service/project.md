# Project: frais-de-service

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/frais-de-service.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/paiements/**, src/lib/reservations/bookings.ts, src/lib/reservations/notify.ts, src/app/api/webhooks/stripe/**, src/app/(portail)/espace/famille/demandes/actions.ts, src/app/(portail)/espace/famille/demandes/[id]/page.tsx, src/app/(portail)/espace/famille/professionnelles/[id]/page.tsx, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/admin/paiements/**, src/app/(portail)/admin/page.tsx, src/components/reservations/accept-answer.tsx, src/components/admin/**, src/content/paiement.ts, src/content/admin.ts, src/content/emails.ts, src/lib/email/templates.ts, package.json, package-lock.json, .env.example, README.md, AGENTS.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- Berceo never takes money for the night (D-1); only the fee, 3 % all-in (D-2, D-87). No subscriptions, promo codes, gift cards (D-3).
- The click never books; Stripe's report does (D-90). Every rule of `acceptAnswer` stays held in its transaction.
- Keys and the webhook secret live in the environment only; load `.icm/skills/security-audit/` before the first push; `security-check.sh` before every commit.
- One forward migration (`.icm/skills/database-migration/`), generated on the merged tree.
- Every word in `src/content/`, to Surya's guide (D-19); red and green only in the confirmation dialogs (D-24).
- Cancelling a booking is stub 11's: this run only exports `refundFee` (D-94).

## Context budget

- Define read `src/lib/reservations/bookings.ts`, the accept action, `accept-answer.tsx`, the schema's booking and journal tables, `.env.example`, `src/proxy.ts` and the admin journal page, to place the payment exactly where candidature-et-reservation left the seam.
