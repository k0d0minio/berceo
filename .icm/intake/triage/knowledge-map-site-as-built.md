# Stub: The knowledge map still describes the holding page

- lane: chore
- found-by: vitrine-publique release · 2026-09-24
- complexity: low

## Problem

`.icm/_shared/knowledge-map.md` says "the holding page as built is described at the root" and
describes README.md as "where every file of the holding page lives, and the design notes (the
page is a night; committed to dark)". The vitrine replaced the holding page and README.md and
AGENTS.md now describe the light platform (D-9), so every stage reading the map is pointed at
a description that no longer exists.

## Proposed change

Rewrite the two lines: README.md is where the vitrine, accounts and spaces live plus the design
system, the content catalogue and the vitrine's rules; AGENTS.md carries the light-DA and
editorial standing rules. Prove it with `validate-knowledge-map.sh`.

## Prompt

In the berceo repo, read `.icm/intake/triage/knowledge-map-site-as-built.md`, then run `/pipeline knowledge edit "the site-as-built lines of .icm/_shared/knowledge-map.md: the holding page is gone; README.md describes the vitrine, accounts and the light design system, AGENTS.md its standing rules"`.
