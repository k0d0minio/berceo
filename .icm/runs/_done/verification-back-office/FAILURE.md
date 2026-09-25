# Failures: verification-back-office

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

### 2026-09-25 — the acceptance-criteria ticks in the PR body were refused

- what happened: Build's step 6 PATCH of the PR body (the 15 criteria to `[x]`) was denied by the session's auto-mode classifier as self-approval.
- why: the harness treats a session ticking boxes on its own PR as approving its own work.
- fixed by: each criterion's status recorded in `03_build/output/notes.md`; the boxes left for the operator.

### 2026-09-25 — `/security-review` failed on its first call

- what happened: the skill's `git diff origin/HEAD...` found no `origin/HEAD` in the cloud clone.
- why: a fresh cloud checkout has no `origin/HEAD` symbolic ref.
- fixed by: `git remote set-head origin main`, then the skill ran.

### 2026-09-25 — the first live probe of `decide()` did not run

- what happened: a throwaway `.ts` script under `scripts/` failed on top-level await (tsx compiles `.ts` there as CJS), then on `users.auth_user_id` being required.
- why: the package is CJS by default; `users` rows are joined to Neon Auth.
- fixed by: a `.mts` script run with `npx tsx --conditions=react-server`, users inserted with a fake `auth_user_id`, on the run's own Neon branch.

## Learned rules

- Never tick acceptance-criteria boxes in the PR body from a session (it is refused as self-approval); record each criterion's status in `03_build/output/notes.md` for the operator.
- Before `/security-review` in a cloud session, run `git remote set-head origin main`; the skill diffs against `origin/HEAD`, which a fresh clone lacks.
- To prove server code against the run's Neon branch, run a throwaway `scripts/.probe-*.mts` with `npx tsx --conditions=react-server` (`.mts` for top-level await; `users` rows need an `auth_user_id`), then delete it before committing.
