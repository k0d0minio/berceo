# Stub: The founders read every cancellation and credit, and grant a credit by hand

- feature-slug: annulations-back-office
- epic: annulations-credits
- sequence: 5 of 5
- depends-on: annulations-table
- complexity: medium
- priority: P2

## Problem

The answers [9.2] keep « un historique de toutes les annulations » and give force majeure and
the litige to the founders' judgement. `/admin/signalements` lists cancelled gardes and
absences. Nothing lists credits, and the founders cannot grant one.

## Proposed change

`/admin/signalements` shows the reason, the delay line that applied and the credit or fee
outcome on each row, and a « Litige » filter. A new `/admin/credits` lists every credit, newest
first, 50 per page, with the family, the amount, the origin, the expiry and the spent amount,
and a « Vue d'ensemble » block. On a garde in litige or on a fee kept, a founder grants a credit
of the fee with a confirmation, a reason and a journal entry.

## Acceptance criteria

- [ ] `/admin/signalements` shows the reason and the outcome of each cancellation and absence, and filters the litiges.
- [ ] `/admin/credits` lists the credits with the columns above, and « Vue d'ensemble » counts the live credits.
- [ ] A founder grants a credit of the fee on a litige or a kept fee, once per garde, with a journal entry.
- [ ] A granted credit shows in the family's space with its origin.

## Out of scope

- Editing or deleting a credit.
- A credit of a free amount.

## Notes

- Files: `src/app/(portail)/admin/signalements/`, a new `src/app/(portail)/admin/credits/`,
  `src/lib/admin/lists.ts`, `src/lib/credits/`, `src/lib/admin/journal.ts` (a new action),
  `src/components/admin/admin-shell.tsx`, `src/content/admin.ts`.
