# Failures: comptes-auth-cleanups

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

### 2026-09-26 — every preview failed at provisioning, no build log

- what happened: from 12:10 UTC every Vercel preview (this run's draft and two sibling runs') ended `BUILD_FAILED — Resource provisioning failed` within a second, with an empty build log; `main`'s production deploy was READY.
- why: the `uat-berceo` Neon project held 10 branches (`main` + 9 `preview/claude/*` the Vercel integration made at 11:02 for old proposal-era branches), Neon's per-project cap, so the integration could not create one for a new preview branch. `Neon cleanup` only deletes on PR close; those branches had no PR to close.
- fixed by: the operator's go-ahead, then deleting the 9 stale preview branches through the Neon connection; the next push built (81f846f).

### 2026-09-26 — decision ids collided with a sibling Define

- what happened: this run's Define numbered D-144/D-145 while `reservations-reponse-suspendue` took D-144 to D-146 in the same minutes.
- why: the ids were read from `main` only, not from every remote branch right before the commit (a Learned rule this repo already holds).
- fixed by: marked provisional at Define, renumbered D-149/D-150 at Build after grepping every remote branch (D-148 highest).

## Learned rules

- When every preview fails within seconds with `Resource provisioning failed` and an empty build log, count the branches of the `uat-berceo` Neon project before touching code: at 10 the Vercel integration cannot create a preview branch, and the stale `preview/*` ones are deleted with the operator's go-ahead.
