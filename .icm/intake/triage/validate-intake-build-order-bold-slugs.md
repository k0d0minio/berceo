# Stub: The intake validator's Build order check never actually agrees

- lane: chore
- found-by: triage sweep · 2026-09-26
- complexity: trivial
- priority: P2

## Problem

`.icm/scripts/validate-intake.sh`'s `## Build order` check (point 4) strips an optional
backtick around each line's slug before comparing it to the stub at that sequence:

```
ord_slug="$(printf '%s' "$line" | sed -E 's/^[0-9]+\.[[:space:]]+//; s/^`?([A-Za-z0-9_-]+)`?.*/\1/')"
```

Every existing `breakdown.md` under `.icm/intake/` writes the slug in bold markdown, no
backticks (`1. **comptes-auth-cleanups** (chore, P2) — extract the one...`), so the sed never
strips the `**` and the comparison always fails. `validate-intake.sh .icm/intake/<any epic>`
reports every line as disagreeing with its stub today — `comptes-auth-recuperation`,
`onboarding-fichiers-concurrence`, `professionnelle-invalidee-consequences` and the three
newly cut in the 2026-09-26 triage sweep (`back-office-admin-dedup`, `gardes-annulation-suivi`,
`reservations-revue-candidature`) all fail this one check. It is advisory (warns, never blocks
a PR), so nothing downstream broke, but the check has never once agreed with a real breakdown.

## Proposed change

Extend the sed to also strip a leading/trailing `**` (keep accepting a bare or
backtick-wrapped slug too, in case that style is ever used), then confirm every epic under
`.icm/intake/` validates clean on the Build order point specifically.

## Prompt

In the berceo repo, read `.icm/intake/triage/validate-intake-build-order-bold-slugs.md` and
`.icm/scripts/validate-intake.sh` (the `## Build order` check, point 4, around line 232-266).
Fix the slug-extraction sed so it strips `**` around a Build order slug (as well as backticks),
then run `.icm/scripts/validate-intake.sh` against every epic under `.icm/intake/` that has a
`breakdown.md` and confirm the Build order point no longer fires a false "must agree". Run it
through `/pipeline chore validate-intake-build-order-bold-slugs`.
