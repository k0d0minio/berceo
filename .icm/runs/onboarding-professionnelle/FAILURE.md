# Failures: onboarding-professionnelle

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

### 2026-09-24 — two sibling runs built the same commune register

- what happened: this run and profil-famille (#34) each built `src/lib/communes/` and each
  numbered a migration `0002`; the merge of main at Release conflicted on both, and this run's
  register (and a turn of dataset hunting in Build) was thrown away for main's.
- why: the breakdown listed the commune list under several stubs but gave it no single owner, and
  Build did not look at what the live sibling run on the same data was writing.
- fixed by: the merge commit 28abd52 (main's list adopted, migration regenerated as 0003), D-49.

### 2026-09-24 — production's storage key refused by the session's permission check

- what happened: minting a Neon storage credential on production's project was refused mid-run;
  the operator created it in the Console instead.
- why: writing a credential to a production secret store needs the operator's own hand here.
- fixed by: the operator, in the Neon Console and Vercel; the CORS rule stays owed (handoff).

## Learned rules

- Before building a module other stubs of the same scope also name (a shared list, a shared component), check `main` and the live sibling runs' branches for it, and build on the one that exists rather than a second copy.
