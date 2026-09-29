# Failures: reservations-regles-non-appelees

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

### 2026-09-29 — Define's decision ids collided with three sibling runs

- what happened: Define numbered this run's decisions D-153 and D-154 after reading only `main` and
  the working tree. Build's `git branch -r` sweep found `gardes-shared-helpers`,
  `messagerie-profil-non-valide` and `reservations-deux-gardes-meme-nuit` all holding D-153 to D-155,
  committed within the same two minutes on 2026-09-28.
- why: Define skipped the learned rule that asks it to grep every remote branch for the highest
  `D-n` right before committing. Four Defines ran in parallel, so even that check would have raced.
- fixed by: Build renumbered this run's decisions to D-156 and D-157, after the highest id on any
  branch at the time. By Release, two sibling runs (#58, #59) had merged to `main` using D-156 to
  D-158, and other open branches reached D-166. Release renumbered again to D-167 and D-168 (spec,
  decisions, project, handoff, notes, the tests' headers, the README).

### 2026-09-29 — the Build-time renumbering was overtaken before the merge

- what happened: Build's renumbering to D-156/D-157 held for about an hour. Siblings then renumbered
  their own clash into the same range and merged first.
- why: the ids are a single global counter written by parallel sessions with no reservation step.
  Each run picks "highest + 1" at a different moment, so any check before the merge can go stale.
- fixed by: Release re-read every branch after merging `main` and renumbered to D-167/D-168.

## Learned rules

- Build re-reads the highest `D-n` on every remote branch before its first commit and renumbers its own decisions on a clash, because Defines run in parallel can race even the Define-time check.
- Release re-reads the highest `D-n` on `main` and every remote branch after merging `main`, and renumbers this run's decisions on a clash, since the last check before the merge is the only one that sticks.
