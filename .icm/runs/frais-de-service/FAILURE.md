# Failures: frais-de-service

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

### 2026-09-25 — Define numbered D-87 to D-94 over ids a sibling run had taken the same day

- what happened: Build's check of every open branch found `messagerie` (branch `claude/tender-albattani-vje2w4`, defined the same day) using D-87 to D-91 for its own decisions; this run's Define had read only `main` and the archive before numbering D-99 to D-94.
- why: Define skipped the learned rule « read the highest `D-n` on `main` and on every open run's branch »; the sibling's branch existed when this run was defined.
- fixed by: Build numbered its own decisions from D-95, clear of both; messagerie merged first (#44), so Release renumbered this run's D-87 to D-91 as D-99 to D-103, and regenerated this run's migration as 0009 on the merged tree.

### 2026-09-25 — Release's first review found money-path bugs Build's self-check had not

- what happened: `/code-review high` at Release found that a paid fee could end with neither a booking nor a refund (the put-back of D-98 relied on a webhook retry that does not always come), a second Checkout could open while a paid one was being settled, and a refused refund was told to the family as done.
- why: Build reasoned about the webhook and the return page as two paths to one lock, not about what happens after the lock when the one who holds it fails.
- fixed by: Release, in-ticket (D-104): a paid unbooked fee is settled by whoever comes next, the in-flight guard in `startCheckout`, the refund's outcome said as it is, the admin refund and its journal line in one statement; the fix itself re-reviewed.

## Learned rules

- Before Define numbers a decision, list every remote branch (`git branch -r`) and grep each for its highest `D-n`; a same-day sibling's branch counts even before it has a PR.
- When a payment is taken before the work it pays for, design for the holder of the lock failing: whatever state it leaves must be one the next caller (webhook retry, return page, refresh) can finish, never one only a retry that may not come can.
