# Failures: comptes-neon-auth

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

### <YYYY-MM-DD> — <what failed, one line>

- what happened: <the observable — the check, the error, the wrong file>
- why: <the cause, once it was known>
- fixed by: <the commit, or the action>

## Learned rules

- <one sentence, imperative, general enough to apply to the next run in this repo>

## 2026-09-23 — Build stopped before the ready flip (blocked on the operator)

- What happened: the env audit reported 5 gaps. This session's permission settings deny any
  write to `.env*`, so `.env.example` could not take the four names, even after the operator
  approved it (a deny rule, not a prompt). Separately, `NEON_AUTH_COOKIE_SECRET`,
  `RESEND_API_KEY` and `EMAIL_FROM` exist on no Vercel environment, and the Neon Auth settings
  the spec needs (verification by link, the webhook) are not exposed by the Neon MCP and
  `NEON_API_KEY` is not in this environment.
- Why stop: flipping ready would build previews whose account pages throw (no cookie secret),
  so the operator's smoke would test nothing.
- Resumes with: `build comptes-neon-auth` once handoff.md → Blockers is cleared.

## Learned rules

- A run that adds env vars in a session whose settings deny `.env*` writes: declare the
  `.env.example` block to the operator at the start of Build, not at the flip.
