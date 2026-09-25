# Failures: cycle-de-garde-et-annulation

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

### 2026-09-25 — two runs took the same decision ids

- what happened: avis-etoiles (branch `claude/hopeful-wright-505ax0`) numbered D-105 to D-111
  a minute after this run pushed its own D-105 to D-111.
- why: both Define sessions read the highest `D-n` at numbering time, before either had pushed.
- fixed by: this run kept its ids (first pushed, and the other depends on it); avis-etoiles
  renumbers from D-114, noted in decisions.md and the stop reports.

### 2026-09-25 — republishing could book a night twice

- what happened: the Release code review found that « Republier ma demande » on a cancelled
  garde stayed offered after the republished request was booked, so a second request, and a
  second booking and fee, could follow for the same night.
- why: the guard looked only for an `ouverte` request, like the unique index it mirrored; a
  booked (`attribuee`) request escaped both.
- fixed by: 0d50dd7 (`liveRequestOn`: open or booked).

### 2026-09-25 — the reminder claimed the whole batch before sending

- what happened: the review found that claiming every garde first, then sending, loses the
  reminders a timeout or a refused send never reached; parallel sends then risked Resend's rate.
- why: the digest's claim-first pattern was copied onto a per-item e-mail.
- fixed by: c5e3482 (claim each garde in turn, release the claim on a failed send).

## Learned rules

- Right before Define commits its decisions, re-read the highest `D-n` on every remote branch again, not only when numbering them: a sibling Define an hour earlier or later takes the same ids otherwise.
- A path that reopens or republishes something for a slot (a night, a date) checks for any live record of that slot (open or already booked again), not only the open one a partial unique index covers.
- When a job sends one e-mail per claimed row, claim each row just before its send and release the claim when the send fails; never claim the whole batch first.
