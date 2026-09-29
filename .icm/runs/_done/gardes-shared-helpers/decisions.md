# Decisions: gardes-shared-helpers

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none. There is no scope run: the epic was cut from the cycle-de-garde-et-annulation release review (2026-09-25). This run inherits D-89 (the conversation closes when the night ends), D-110 (the address is visible until the night ends), D-68 (one `CRON_SECRET` shared by UAT and production) and D-41/D-55 (the purge's cron).

## Made in this run

D-152 was the highest id on `main` and on every remote branch on 2026-09-28.

- D-153: the one cron bearer check is the purge's existing `isCronRequest`, 16-character floor included, moved to `src/lib/cron.ts` and called by all four cron routes. Each route keeps its own refusal (401 or 404). Operator's choice in Define, 2026-09-28.
- D-154: one `otherSide` in `src/lib/demandes/rules.ts` covers messagerie, gardes and avis (`ratedSide` goes), and the inline copy in `ratings-table.tsx` switches to it too. Operator's choice in Define, 2026-09-28.
- D-155: `checkedId()` in the two gardes actions files stays as is, like the same inline UUID check across the other actions. Operator's choice in Define, 2026-09-28.
