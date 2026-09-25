# Failures: back-office-admin

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

### 2026-09-25 — a reader of a suspended account's file was missed

- what happened: the release code review found that the verification queue (`loadQueue`) and the decision in `src/lib/admin/review.ts` still listed and acted on a suspended or deleted professional's waiting file; the overview's count carried it too.
- why: Build listed the readers to hide a suspended account from by grepping `status, "valide"` (the readers that show a professional to others), and missed the readers keyed on the other statuses, in the admin's own module.
- fixed by: bdf7a81 (the queue and the decision's SQL hold a suspended account out; proven on the run's Neon branch).

### 2026-09-25 — the stub named a route group that does not exist

- what happened: the stub's `touches` guessed `src/app/(admin)/**`; the admin pages live in `src/app/(portail)/admin/`.
- why: Scope wrote the guess before the verification stub had placed `/admin` under `(portail)`.
- fixed by: Define wrote the real paths in the spec's `touches:`.

## Learned rules

- When a change must hide an account (suspended, deleted) everywhere, list its readers by the table it lives on (`users`, `professional_profiles` joins), in every module including `src/lib/admin/`, not by one status predicate; then hold each one out in the SQL of the read and of the write it guards.
