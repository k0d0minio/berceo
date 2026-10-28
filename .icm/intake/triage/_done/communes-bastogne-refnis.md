# Stub: Bastogne carries the REFNIS code of its 2025 merger

- lane: bug
- found-by: onboarding-retour-1/profil-zone-rayon, the AdminVector check · 2026-10-28
- complexity: medium
- priority: P2

## Problem

Bastogne and Bertogne merged on 1 January 2025. NGI-IGN AdminVector carries the merged commune as
`82039`. `src/lib/communes/data.ts` carries Bastogne, Bertogne's localities included, as the old
`82003`. `MERGERS_2025` in `scripts/communes/generate.py` lists 13 mergers and not this one.

## Proposed change

Verify `82039` against Statbel's REFNIS list. Then add the merger to `MERGERS_2025`, regenerate
`data.ts`, and move every stored `82003` to `82039` in one migration.

## Acceptance criteria

- [ ] `MERGERS_2025` lists Bastogne with the code Statbel gives it.
- [ ] `data.ts` carries Bastogne and Bertogne's localities under that code, and 565 communes.
- [ ] One migration moves `82003` to the new code in `family_profiles`, `professional_communes` and `care_requests`, and in any other column that holds a REFNIS code.
- [ ] `/garde-de-nuit/bastogne` still opens, with the same slug.
- [ ] The override for `82039` in `scripts/communes/generate.py`, if `communes-centres` added one, is removed.
