# Stub: A family marks a professional as a favourite

- feature-slug: favoris-marquer
- epic: favoris
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P1

## Problem

A family who liked a professional has no way to keep her. The devis sells favourites.

## Proposed change

A `favourites` table, one row per family and professional. On the full profile and on the
search card, a subscribed family sees « Ajouter à mes professionnelles », and
« Retirer de mes professionnelles » once marked. The mark is hers alone: the professional and
the founders do not see it. A deleted account loses its rows.

## Acceptance criteria

- [ ] A subscribed family marks and unmarks a professional from the full profile and from the search card, and the mark survives a reload.
- [ ] A family without a subscription sees no mark (the gate `familyMay`).
- [ ] The professional's pages and the back-office show nothing of it.
- [ ] The migration adds the table, and one module holds its statements, held by an isolation test.

## Out of scope

- The list (`favoris-liste`).
- A mark from a past garde's page. The list shows those professionals without a mark.

## Notes

- Question, with a default: the words. Default: « Ajouter à mes professionnelles » and
  « Retirer de mes professionnelles », `@relecture`. A heart icon beside, from the DA's
  iconography.
- Files: `src/db/schema.ts`, `drizzle/`, a new `src/lib/favoris/`, `src/lib/abonnements/rules.ts`
  (one action more in `familyMay`), `src/components/recherche/`, `src/app/(portail)/espace/famille/professionnelles/[id]/`,
  `src/lib/admin/accounts.ts` (the deletion), a new `src/content/favoris.ts`.
