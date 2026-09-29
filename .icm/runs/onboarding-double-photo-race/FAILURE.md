# Failures: onboarding-double-photo-race

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

### 2026-09-29 — no Neon branch could be created for the proof

- what happened: `db-branch.sh onboarding-double-photo-race up` answered `HTTP 422: branches
  limit exceeded` on the non-production project.
- why: its 10 branches were `main`, one sibling run's `run/*` branch and eight `preview/*`
  branches, every one of them belonging to an open PR, so the earlier rule (collect the stale
  previews of closed PRs) found nothing to collect.
- fixed by: the proof ran on this PR's own preview branch, which is non-production, disposable
  and this run's alone; fixtures deleted after.

## Learned rules

- When the Neon non-production project is at its branch cap and every `preview/*` branch belongs to an open PR, run the proof on the run's own PR preview branch (clean up its fixtures) rather than deleting another run's branch.
