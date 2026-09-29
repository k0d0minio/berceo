# Decisions: comptes-welcome-email-no-retry

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — no scope run; the epic was cut from the comptes-neon-auth release review (2026-09-24).

## Made in this run

D-164 was the highest id on `main` and every remote branch on 2026-09-29.

- D-165 — a failed welcome e-mail is retried from the family's home (`/espace/famille`), after the response, while `welcome_sent_at` is null; the claim release stays. Not every family page through `requireAccess`, not sign-in. The operator's choice in Define, 2026-09-29.
- D-166 — the verification confirmer schedules the welcome with `after()` and redirects without waiting on Resend. The operator's choice in Define, 2026-09-29.
