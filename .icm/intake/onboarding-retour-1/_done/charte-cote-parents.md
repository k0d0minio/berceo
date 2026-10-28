# Stub: A parent reads the charter the professionals accept

- feature-slug: charte-cote-parents
- epic: onboarding-retour-1
- sequence: 5 of 10
- depends-on: declarations-charte
- complexity: low
- priority: P2

## Problem

The founders want parents to be able to read, from their side, the charter every professional
accepts.

## Proposed change

A button « Lire la charte des professionnelles » on the family's space home and on the parents'
« Comment ça marche » page, under « Ce que garantit Berceo ». Both open
`/charte-des-professionnelles`.

## Acceptance criteria

- [ ] `/espace/famille` shows the button and it opens the charter page.
- [ ] The parents' « Comment ça marche » page shows the button under the guarantees block.
- [ ] The button follows the DA: an outlined capsule, no new colour.

## Out of scope

- A charter for families.

## Notes

- If `comment-ca-marche-par-persona` has not shipped, put the button on today's
  `/comment-ca-marche` under the guarantees block.
- Files: `src/app/(portail)/espace/famille/page.tsx`, `src/content/famille.ts`,
  `src/content/comment-ca-marche.ts`, `src/app/(public)/comment-ca-marche/`.
