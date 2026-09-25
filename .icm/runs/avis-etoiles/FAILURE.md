# Failures: avis-etoiles

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

### 2026-09-25 — Build stopped at the preamble: the dependency was not built

- what happened: the operator chose to define this run before cycle-de-garde-et-annulation. The first `build` found no garde state on `main` and stopped until that run merged.
- why: the stub's `depends-on` was known at Define, and bookings had no terminée or annulée state until stub 11.
- fixed by: waiting for cycle-de-garde to merge (#48), then Pass 0 named the three garde facts this run reads in `notes.md`.

### 2026-09-25 — Decision ids collided with the dependency's

- what happened: Define took D-105 to D-111. cycle-de-garde, defined afterwards, took D-105 to D-114 and merged first.
- why: Define numbered from `main` while stub 11 had no branch yet, so no check could see its ids.
- fixed by: renumbering to D-115 to D-121 at Build (spec, decisions, plan).

### 2026-09-25 — A spec gap: a terminée garde can still become annulée

- what happened: the spec said an annulée garde is never rated, but cycle-de-garde lets either side report an absence up to 24 h after the end, so a garde can be rated and then cancelled.
- why: the spec was written before the dependency's rules existed, and Define could not read its absence window.
- fixed by: D-122 at Build (ratings of a garde later cancelled are stored, shown to the founders as not counting, and counted nowhere), flagged for Release.

## Learned rules

- When Define specifies a run ahead of the stub it depends on, it names the facts it will read from that stub and lets Build re-read that stub's merged rules for any later transition (a window that changes the state after the fact) before writing code.
- A run defined ahead of its dependency numbers its decisions only at Build, after that dependency has merged; until then its spec uses the numbers provisionally and says so.
