# Failures: vitrine-publique

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

### 2026-09-24 — ci-status.sh settled on the previous head right after a push

- what happened: twice in Build (after the `uat` merge push and after the post-flip push), the
  first `ci-status.sh` call printed `head <old sha>` and `RESULT: GREEN` from the previous
  commit's checks.
- why: GitHub had not yet moved the PR's head to the just-pushed commit when the script read
  it, so it settled the old head's finished checks.
- fixed by: re-running the call until its `head` line matched `git rev-parse --short HEAD`.

### 2026-09-24 — the spec asked for two guide titles "verbatim" and for 50–60 characters

- what happened: the guide's home title is 45 characters and its Comment ça marche title 67;
  both could not be kept verbatim under the spec's length criterion.
- why: Define quoted the guide's examples without measuring them against its own rule.
- fixed by: Build rewrote both around the same keyword (decision B-1), tagged `@relecture`.

## Learned rules

- After a push, trust a `ci-status.sh` verdict only when its `head` line matches `git rev-parse --short HEAD`; re-run it otherwise.
- When a spec quotes Surya's guide verbatim for a title or meta description, measure it against the guide's own length rules in Define, not in Build.
