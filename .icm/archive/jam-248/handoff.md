# Handoff jam-248

## Next action

Jamie tests the preview, ticks Ready to merge on pull request #135, then says `release JAM-248`.

## How to test

On the preview, sign in as a founder. On « Réservations », cancel a garde to come with « Annuler la garde » and a note: both sides see « Annulée par Berceo », and the family has a credit. On « Signalements », filter « Litige » or find a late family cancellation, grant a credit with a note, then open « Crédits » and the family's « Mes crédits ».

## Criteria

- Met by the green CI run (`ci` at 68a060c): the « Litige » filter, the overview count and the list read one condition, no second credit and no button on a refunded fee or a garde with no fee, a garde already ended or cancelled is refused, the admin-only pages and actions (rules, content and e-mail tests).
- Met by the agent: the stub `annulations-back-office.md` is in `.icm/intake/annulations-credits/_done/`.
- For the operator on the preview: the delay and the fee outcome on « Signalements », the list « Crédits », the grant with its journal entry, the credit in « Mes crédits » and the e-mail, and the cancellation by Berceo with its credit and journal entry.

## Blockers

- none

## Do not touch

- `.icm/_system/`

## Notes

- The release has a migration (`drizzle/0035_annulations-back-office.sql`): run `migrate-production.yml` before `promote.sh run`.
- A cancellation by Berceo is the value `berceo` of `booking_side`. The TypeScript type `BookingSide` stays the two sides. `CancellationAuthor` has the three.
- The founders' note: 500 characters at most (`NOTE_MAX`). The reason dialog takes an optional shorter limit.
- A litige that the founders closed with a credit now reads as that credit on both sides' garde pages.
- The preview database is `uat-berceo` (no branch per preview), so the preview build migrates that database.
