# Failures: admin-sql-helpers-dedupe

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

### 2026-09-28 — the stub named two of the four hand-written journal inserts

- what happened: the stub listed `reactivateAccount` and `markReportHandled`; a grep at Define
  found the same column list also in `decide` (`src/lib/admin/review.ts`) and the founder refund
  (`src/lib/paiements/payments.ts`).
- why: the release review that cut the stub read `accounts.ts` and `lists.ts` only.
- fixed by: the operator widened the scope at Define (D-151); all four moved, and a source test
  holds the rule.

## Learned rules

- When a stub asks to write a duplicated rule once, Define greps all of `src/` for every copy of it rather than trusting the stub's list, and adds a source test refusing it outside its one home.
