# Failures: suspension-one-predicate

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

### 2026-09-29 — decision ids taken by sibling runs between Define and Build

- what happened: Define numbered D-165/D-166 after reading every remote branch (highest D-164); by Build, `comptes-welcome-email-no-retry` and `comptes-orphaned-auth-identity` held D-165/D-166 and `main` had merged D-167/D-168.
- why: siblings defined the same day; the id race is already parked as `triage/template-change-decision-id-race.md`.
- fixed by: renumbered to D-169/D-170 in Build before any code commit.

### 2026-09-29 — the spec's regex never matched what it named

- what happened: criterion 2's grep and the planned test pattern used `isN(ot)?Null`, which matches `isNNull`/`isNotNull` but not `isNull`; the grep passed only through its other alternative, and the first emulation of the test passed a stray `isNull(users.suspendedAt)`.
- why: the pattern was written in Define and never run against a positive example.
- fixed by: `is(Not)?Null` in the test, the spec, the plan and the PR's criterion line; the emulation then failed on each stray form.

## Learned rules

- Prove every regex a spec or a source test states against one string it must match and one it must not, before relying on its passing.
