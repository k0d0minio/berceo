# Stub: The founders set the cancellation delay, and each cancellation carries a reason

- feature-slug: annulations-delai-et-motif
- epic: annulations-credits
- sequence: 1 of 5
- depends-on: none
- complexity: medium
- priority: P1

## Problem

The table of the answers [9.2] turns on one delay, 24 hours before the start, that the founders
must change without a build. The rule in `src/lib/gardes/rules.ts` knows no delay. A
cancellation stores its side and its kind, never a reason. The answers ask for the date, the
author, the selected reason and the state of every cancellation.

## Proposed change

`app_settings` gets `delai_annulation_heures`, 24 by default, shown and changed under
« Réglages » on `/admin/dossiers` like the students switch, with a journal entry. The rules read
it. The cancel dialog of each side asks one reason from a short list, stored on the booking.
The founders read the reason on the garde and on `/admin/signalements`. Nothing else changes
yet: the fee rule of today stands until `annulations-table`.

## Acceptance criteria

- [ ] A founder changes the delay on `/admin/dossiers`, with a confirmation and a journal entry, and the new value is read by the rules.
- [ ] A cancellation by either side stores a reason from the list and the moment.
- [ ] The garde's page of each side and `/admin/signalements` show the reason.
- [ ] The migration adds the column and the setting's default.

## Out of scope

- The credit and the fee rule (`annulations-table`).
- Free text as a reason (D-20).

## Notes

- Question, with a default: the reasons. Default, family: « Nous n'avons plus besoin de la
  garde », « Un imprévu », « Nous avons trouvé une autre solution », « Autre ». Professional:
  « Je suis malade », « Un empêchement », « Je ne peux plus assurer cette garde », « Autre ».
  All `@relecture`.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/gardes/rules.ts`, `src/lib/gardes/gardes.ts`,
  `src/lib/admin/settings` beside the students switch, `src/components/gardes/`,
  `src/content/gardes.ts`, `src/content/admin.ts`.
