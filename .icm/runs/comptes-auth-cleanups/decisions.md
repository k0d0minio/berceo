# Decisions: comptes-auth-cleanups

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — no scope run; the epic was cut from the comptes-neon-auth release review (2026-09-24).

## Made in this run

- D-144 — `requestPasswordReset` passes `${siteUrl}/nouveau-mot-de-passe` as `redirectTo` rather than dropping it; the webhook ignores it either way. The operator's choice in Define, 2026-09-26.
- D-145 — the query reaches `requireAccess` through its callers (the `/espace` pages that read `searchParams`), not a proxy header; the guard strips it before the role check. The operator's choice in Define, 2026-09-26.
