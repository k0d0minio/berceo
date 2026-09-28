# Failures: onboarding-upload-limit-race

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

### 2026-09-26 — every new PR's Vercel check failed in about a second

- what happened: the draft's Vercel status read `BUILD_FAILED: Resource provisioning failed`, no
  build log, on #52, #53 and #54 alike; `ci-status.sh` read RED on a `.icm/`-only diff.
- why: the Neon non-production project held 10 branches, the plan's cap — `main` and nine
  `preview/claude/*` branches of long-closed PRs, all created at once; `neon-cleanup.yaml` only
  deletes on a PR's close, so those were never collected and the integration could not create a
  preview branch.
- fixed by: the stale preview branches deleted (found gone on 2026-09-28); the next push built.

### 2026-09-26 — the stub offered a lone guarded insert as a fix

- what happened: the stub proposed `INSERT … SELECT … WHERE (SELECT count(*) …) < 3` "in one
  statement" as sufficient.
- why: under READ COMMITTED two such statements each read the count from their own snapshot;
  the probe on a Neon branch showed 7 of 10 parallel rounds end with four files.
- fixed by: Define specified the profile-row lock in an earlier statement of the same batch
  (run D-1); the probe showed 10 of 10 rounds hold.

## Learned rules

- When every new PR's Vercel check fails within seconds with "Resource provisioning failed" and no build log, count the branches of the Neon non-production project; at the cap, delete the stale `preview/*` branches of closed PRs before touching the code.
- Hold a per-row count limit by locking the parent row (`select … for update`) in an earlier statement of the same `db.batch` as the guarded insert; a lone `INSERT … SELECT … WHERE count < n` lets two parallel statements both pass under READ COMMITTED.
