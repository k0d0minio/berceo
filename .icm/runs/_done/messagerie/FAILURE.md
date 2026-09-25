# Failures: messagerie

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

### 2026-09-25 — main moved under Release with a repo-wide source test the new files broke

- what happened: at Release, `main` had gained #43 (encres-contraste), whose
  `src/app/contrast.test.ts` refuses `text-sauge` and `text-taupe` anywhere under `src/`; the
  merge conflicted in the two shell files, and every new messagerie component still used the old
  classes, which the advisory job would have failed on the merged head.
- why: Build merged `main` before the flip (nothing new then); #43 merged while the PR waited for
  the smoke.
- fixed by: the merge commit `ebe09eb` took `main`'s inks in the conflicts and moved the new
  components to `text-encre-sauge` / `text-encre-taupe`, on the pairs the test lists.

### 2026-09-25 — the router hook routed a skill's prompt to Scope

- what happened: the `/security-review` skill's expanded body drew an authoritative
  `[pipeline-router] Route: /pipeline scope` line mid-Release; ignored.
- why: the canonical hook classifies any long prompt as a story; cause of the missed `review` bail
  unconfirmed.
- fixed by: a template change request, `triage/template-change-router-skill-prompts.md`.

## Learned rules

- After merging `main` at Release, grep the branch's new files for every pattern a repo-wide source test on `main` refuses (for example `src/app/contrast.test.ts`), since the advisory job only reads it after the push.
