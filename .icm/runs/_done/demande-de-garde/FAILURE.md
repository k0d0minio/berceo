# Failures: demande-de-garde

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

### 2026-09-25 — decision ids collided with a sibling run

- what happened: verification-back-office and this run were both defined on 2026-09-25 and both took D-50 onwards; the merge of main (#39) brought two D-50 to D-58 ledgers.
- why: Define took the next free id from `main` and the archive only; the sibling's ids were on its open branch.
- fixed by: renumbering this run's decisions to D-60 to D-68 in the merge commit (72a1757).

### 2026-09-25 — the migration renumbered, the preview database stale

- what happened: main's `0004_verification_back_office` took this run's number; the migration was regenerated as `0005_care_requests`, and the PR's Neon preview branch still held the old `0004`.
- why: two runs of one scope both generated a migration; the learned rule of onboarding-professionnelle applied.
- fixed by: resetting `preview/claude/eloquent-mayer-rgaufe` from its parent in `uat-berceo` before the push; the preview migrated cleanly.

### 2026-09-25 — the release review found two spec-level bugs

- what happened: an edit re-applied the normal window to the stored night, so a request could not be edited in its last two days; in summer the 19:00 call could send a second digest.
- why: the spec's "window recomputed from the day of the edit" and "send from 18:00" were taken literally in Define and in Build.
- fixed by: d23e976 (the stored night is kept as it is; one digest a day at most).

## Learned rules

- Before Define numbers a new decision, read the highest `D-n` on `main` and on every open run's branch, not only `main` and the archive: sibling runs defined the same day otherwise take the same ids.
- When an edit re-checks a value against a rule that depends on today (a date window), accept the stored value unchanged; only a new value is held to today's rule.
- Build a link sent to other people (an e-mail) from the host the request reached, never from the client's `Origin` header, whose scheme and path the caller chooses.
