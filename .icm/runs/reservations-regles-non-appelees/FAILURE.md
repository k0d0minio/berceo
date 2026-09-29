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
- fixed by: Build renumbered this run's decisions to D-156 and D-157 (spec, decisions, project,
  handoff, the tests' headers, the README), after the highest id on any branch. The three siblings
  still collide with each other; the operator is told.

## Learned rules

- Build re-reads the highest `D-n` on every remote branch before its first commit and renumbers its own decisions on a clash, because Defines run in parallel can race even the Define-time check.
