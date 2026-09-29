# Decisions: messagerie-profil-non-valide

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — the epic was cut from triage (two release reviews, 2026-09-25), not from a scope. The
  run rests on D-89 (a conversation closes when its request is cancelled or its night ends, and
  stays readable), D-134 (suspension) and D-146 (a profile leaves `valide` only through the
  professional's own reopening).

## Made in this run

- D-156 — A conversation also closes while its professional's profile is not `valide`, except the conversation of her `retenue` answer (her confirmed booking), which follows D-89 alone. The operator's call in Define (2026-09-28): the booking is untouched by this epic, so its channel stays.
- D-157 — Closed for both sides and still readable by both, with the existing « Fermée » words; nothing is hidden from her. The operator's call in Define (2026-09-28).
- D-158 — The rule reads the profile's current status; nothing is stored, so a professional validated again before the night ends can write again. The operator's call in Define (2026-09-28).
