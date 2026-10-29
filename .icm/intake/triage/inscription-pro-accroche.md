# Stub: The professional's sign-up opens with a line written for her

- lane: tweak
- found-by: the UAT review of 2026-10-29 · 2026-10-29
- complexity: low
- priority: P2

## Problem

`/inscription-professionnelle` opens with « L'inscription prend 3 minutes. Votre première nuit
de repos est plus proche que vous ne le pensez. » The line is `t.inscription.message` in
`src/content/comptes.ts:64`, shared by both sign-ups through
`src/app/(auth)/inscription-professionnelle/page.tsx:30`. The night of rest is the family's. A
professional reads a promise that is not for her.

## Proposed change

Give the professional's sign-up its own first line, written to the guide and tagged
`@relecture`, for example « L'inscription prend 3 minutes. L'équipe Berceo vérifie votre dossier
dans les 24 heures ouvrables. » The family's line does not change.

## Acceptance criteria

- [ ] `/inscription-professionnelle` opens with a line about her, and no longer with the family's line.
- [ ] `/inscription-famille` keeps its line.
