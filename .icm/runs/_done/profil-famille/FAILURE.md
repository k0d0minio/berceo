# Failures: profil-famille

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

### 2026-09-24 — the spec named a data source no session can fetch

- what happened: the spec said the commune list is "joined to Statbel's REFNIS codes"; Statbel's
  download is behind a bot challenge, Wikidata's SPARQL was down and its codes inconsistent, and
  Eurostat's LAU list still describes 2024. Build spent many turns finding a source.
- why: Define named Statbel from knowledge, without checking that a script could download it.
- fixed by: D-38 — Eurostat's LAU codes plus a listed table of the 13 codes from the 2025 mergers,
  a generator that fails on any unplaced commune, and a hand check of the 13 codes left to the
  operator.

## Learned rules

- When a spec names an external dataset, Define checks from a session that a script can download it, and names the fallback if it cannot.
