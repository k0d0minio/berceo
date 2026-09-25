# Failures: candidature-et-reservation

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

### 2026-09-25 — a sibling's migration took this run's number after the preview had applied it

- what happened: disponibilites-indicatives (#41) merged its `0006` while this run's `0006` was already applied on the run's Neon branch and on the PR's preview branch; the merge of main conflicted in `drizzle/meta`, and the stale preview database would have skipped the sibling's `0006` (its `when` stamp was earlier) and failed on this run's `0007`.
- why: two runs touching the schema were built in parallel, which the breakdown sequences; the learned rule on renumbered migrations applied, but only after the flip was close.
- fixed by: regenerating the migration as `0007` on the merged tree, resetting `run/candidature-et-reservation`, and deleting the preview branch with the operator's go-ahead (merge commit f40c721).

### 2026-09-25 — Build decision ids collided again with a sibling

- what happened: Build numbered its decisions D-79 to D-82; disponibilites-indicatives had meanwhile renumbered its own to D-79 to D-81 on main to avoid this run's D-70 to D-78.
- why: Build read the next free id from this run's ledger, not from `main` and the open branches.
- fixed by: renumbering to D-82 to D-85 in the merge commit f40c721.

### 2026-09-25 — the release review found six in-ticket defects

- what happened: `/code-review high` found the edit lock checked only before the UPDATE, a priority request sendable to a declined professional, a double e-mail to the priority professional, a photo's file name reaching families, and a mis-routed error message.
- why: the rules module was written and tested apart from the SQL that enforces them, so the SQL paths added later (edit, priority) missed the same checks.
- fixed by: eb1c129, re-reviewed at low with no finding; four larger findings parked in triage.

## Learned rules

- Before Build numbers a decision, read the highest `D-n` on `main` and on every open run's branch, the same as Define does.
- A rule a pure module states must be held again in the SQL of every write it governs (an UPDATE's WHERE, not a read before it); review each write path against the rules list before the flip.
- Never use an enum value added by `ALTER TYPE … ADD VALUE` in a check, index or default of the same Drizzle migration; Postgres refuses it in that transaction, so put that use in the next migration.
