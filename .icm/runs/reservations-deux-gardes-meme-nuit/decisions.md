# Decisions: reservations-deux-gardes-meme-nuit

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — the epic came from a triage batch (candidature-et-reservation release review, 2026-09-25), no `scope.md`. It widens D-65 (demande-de-garde: « a family holds at most one open request per night »).

## Made in this run

- D-153 — A family holds at most one open or booked request per night: the unique index covers `ouverte` and `attribuee`; `annulee` never counts, so a cancelled request, garde or absence frees the night. Widens D-65. Define, 2026-09-28.
- D-154 — The « doublon » error keeps one neutral text for both cases, « Vous avez déjà une demande pour cette nuit. », `@relecture`; no separate message or redirect for a booked night on the forms. Operator's call, Define, 2026-09-28.
- D-155 — The migration is the index change only, no data fix. Build counts existing open-or-booked duplicates read-only on a branch of UAT and of production before the ready flip; any hit stops the run and goes to the operator. Operator's call, Define, 2026-09-28.
