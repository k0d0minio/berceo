# Decisions: gardes-refund-failure-unflagged

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

No scope file: the stub came from the cycle-de-garde-et-annulation release review (2026-09-25).
The earlier decisions it rests on:

- D-2 — A professional's cancellation refunds the family's 3 % fee in full; a family's cancellation keeps it.
- D-93 — The founders' « Paiements des frais de service » list: every fee, newest first.
- D-101 — « Rembourser les frais » on a paid fee, from the back office, with a motif in the journal.
- D-106 — An absence is reported against the absent side; nothing is refunded automatically, the founders decide.
- D-133 — Each overview number is counted by the same condition its list filters on.

## Made in this run

- D-162 — A fee is « à rembourser » when it is `payee` or `remboursement_echoue` and its booking is `annulee`, `cancelled_by = 'professionnelle'`, `cancellation_kind = 'annulation'`; absences are not flagged. Computed from the booking, no new column. Define, 2026-09-29.
- D-163 — A back-office refund of a flagged fee still records reason `berceo`; the founder's motif in the journal carries the why. Operator's choice, Define, 2026-09-29.
- D-164 — Flagged fees are shown three ways: a mark on the row (with a variant refund dialog), a « À rembourser » filter on `/admin/paiements`, and a « {n} frais à rembourser » line in the overview's « Paiements récents » block, shown only when n > 0. Operator's choice (row + filter + overview, dialog variant), Define, 2026-09-29; the n > 0 rule is Define's.

*Ids:* D-153 to D-161 are already taken on open sibling branches; this run starts at D-162.
