# Failures: gardes-shared-helpers

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

### 2026-09-28 — the stub called a dedup "no behaviour change" when its copies differed

- what happened: the stub proposed "one `isCronAuthorised`… no behaviour change", but the purge's existing `isCronRequest` also refuses a secret under 16 characters, which the three hourly copies did not. The stub had also gone stale: the avis run added a third cron copy, a third `otherSide` (`ratedSide` plus an inline ternary) and a second `gardeNotice` caller after the stub was written.
- why: the stub listed the copies from one review pass and never compared their edge cases.
- fixed by: Define grepped every copy, compared them, and put the choice to the operator (D-153: the stricter check wins, and its one behaviour change is named in the spec and the notes, with an after-merge check of the three Actions runs).

## Learned rules

- When a dedup merges copies of a guard or a check, compare each copy's edge cases (empty, short, null) in Define; if they differ, the surviving one is a decision with its behaviour change named, never "no behaviour change".
