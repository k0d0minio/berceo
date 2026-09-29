# Failures: comptes-orphaned-auth-identity

The run's retrospective — what cost a turn, and the rule that would have prevented it. Two
files share this job and split it cleanly: `error.log` (in the stage's `output/`) is the ledger
of errors a **tool** reported, written verbatim at the moment of the fix with its `- resolved:`
and `- rule:` lines, which `retrospective.sh` reads and counts across runs; **this file** is
what the run as a whole learned — a wrong assumption, a STOP, a skipped step, a gate that
blocked, a plan that had to be rewritten — which no tool ever logged. On close-out the
`## Learned rules` bullets below are copied into `_shared/project-rules.md` → Learned rules
(`run-pack.sh <slug> --sync-rules`, called by `close-out.sh`, the same shape as
`retrospective.sh --apply`), so the next run in this repo starts with them. Keep the rules
general; keep the retrospectives specific; never restate an `error.log` entry here.

## Retrospectives

### 2026-09-29 — the orphan test deleted an in-flight sign-up

- what happened: Release's `/code-review` found that the retry path took any identity with no `users` row for an orphan, including one whose own sign-up (a second tab, a resubmitted form) was still writing its row; deleting it left that row joined to nothing and locked the address out for good, the very fault the run fixes. The fix (a five-minute grace) was itself re-reviewed and needed a second change: a young orphan got a false-success redirect.
- why: Define and Build reasoned about "no row" as a state, not as a moment; a Neon identity and its `users` row are written by two systems, so "no row yet" and "no row ever" look the same until the writer's maximum duration has passed.
- fixed by: b2c694f and the Release commit — `orphanByEmail` returns the identity with no row and whether it is past the grace; inside it the form answers `inscriptionEnCours` and deletes nothing (D-172).

### 2026-09-29 — decision ids collided twice

- what happened: D-161 (Define) collided with `claude/adoring-dijkstra-o6099q`; renumbered D-165 at Build, it collided again when `comptes-welcome-email-no-retry` merged its own D-165 to `main` during this Release; Release's new decision (D-169) also collided with `claude/hopeful-lovelace-ivr63t`.
- why: sibling runs of the same day number from the same highest id, and a merge of `main` at Release brings in ids that did not exist at Build.
- fixed by: renumbered D-171 and D-172 after the merge of `main`, with every remote branch re-read.

## Learned rules

- When a cleanup deletes a record because its companion row is missing (an identity with no `users` row), treat a record younger than the writer's maximum duration as in flight, never as orphaned, and answer it distinctly from both outcomes.
- After merging `main` at Release, re-read the highest `D-n` on `main` and every remote branch and renumber this run's decisions if a sibling that merged first took the same ids.
