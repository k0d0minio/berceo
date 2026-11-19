# Handoff jam-248

## Next action

Jamie answers Q1 to Q8 on the HUD card or in the body of pull request #135, then says `new JAM-248`. That session runs `questions.sh JAM-248`, puts the answers in `spec.md`, and runs `new-run.sh JAM-248 --refresh-body`. Then Jamie ticks Spec approved and says `build JAM-248`.

## How to test

On the preview, sign in as a founder. Open « Signalements », filter « Litige », and grant a credit on a garde. Open « Crédits » and see the new credit, then sign in as that family and see « Offert par Berceo » in « Mes crédits ».

## Blockers

- Q1 to Q8 wait for answers. Do not use a default while a question waits.

## Do not touch

- `.icm/_system/`
- The checks of `bookings` and the index `credits_booking_live_key` keep their meaning: a migration may add values, not remove a rule.

## Notes

- Already on `main` (do not build again): the reason column, the « Litige » mark and the « devenus crédit » line on « Signalements » (annulations-table), the origins `annulation_berceo` and `geste_berceo` and their family words (credits-registre), `outcomeOf` for `by: "berceo"`.
- The release has a migration: `migrate-production.yml` before `promote.sh run`.
- Build moves the stub `.icm/intake/annulations-credits/annulations-back-office.md` to `_done/` in this pull request.
