# Decisions: onboarding-double-photo-race

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — the epic was cut from release-review findings, with no `scope.md`.

## Made in this run

- run D-1 — one photo per profile is held by the existing profile-row lock in `recordUpload`: the
  photo's recording deletes every other `photo` row of the profile in the same locked batch, only
  when its insert wrote; the last confirm to commit wins. No partial unique index (operator's
  answer in Define).
- run D-2 — profiles already holding two photo rows are not cleaned up: the pages show the latest
  by `uploaded_at`, and her next photo upload removes every other row (operator's answer in
  Define).
- run D-3 — the proof ran on this PR's own Neon preview branch (`preview/claude/zen-clarke-6b3scp`,
  non-production) because the project was at its branch cap with no stale branch to collect; the
  spec's "a Neon branch of the non-production project" holds. Build.
