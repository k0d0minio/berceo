# Failures: reservations-reponse-suspendue

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

### 2026-09-26 — the stub named a trigger that cannot fire

- what happened: the stub asked for the withdrawal in `src/lib/admin/review.ts` and in the professional's reopening; the founders' review never moves a `valide` file (`refuseDecision` accepts only `en_attente` and `complement_demande`), so only `reopenFile` can.
- why: the release review that found the gap described the trigger as "a profile leaving `valide`" and guessed where that happens without listing the writes of `professional_profiles.status`.
- fixed by: Define grepped every write of the status column and wrote D-146; `review.ts` untouched.

### 2026-09-28 — a concurrent answer can outlive the withdrawal

- what happened: the release code review noted that `answerRequest`'s INSERT reads `valide` without a row lock, so an answer committed during the reopen's batch can stay waiting.
- why: the guard pattern copied from the suspension withdraws only what is committed when the batch runs; the writer it races does not lock the row it checks.
- fixed by: parked as `triage/reservations-reponse-pendant-reouverture.md` (P3, milliseconds window, two tabs).

## Learned rules

- When a stub names where a state transition happens, Define greps every write of that column (`.update(<table>)` and raw `update <table>`) before accepting the list, and writes the real set into the spec.
- A withdrawal that must catch every row a concurrent writer might add needs that writer to lock the row it checks (`FOR SHARE`), not only a guard in the withdrawing batch.
