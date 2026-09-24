# Status: comptes-neon-auth

Where the run is, in five lines. Updated at every stage start and stop, and whenever a flag
flips. A resuming session reads this first, then `handoff.md` (`_shared/stage-preamble.md`).

- phase: build
- step: 9 (env names declared, audit OK, uat webhook set; stopped before the ready flip)
- ci: GREEN (cheap tier, cafeee8)
- blocked: yes — Neon refuses link verification with its shared e-mail provider (handoff.md → Blockers 3)
- updated: 2026-09-24
