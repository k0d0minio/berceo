# Handoff jam-248

## Next action

Q1 to Q8 have answers (Jamie, 2026-11-19), recorded in `spec.md`. Q4, Q5 and Q8 differ from the default. Jamie ticks Spec approved on pull request #135, then says `build JAM-248`.

## How to test

On the preview, sign in as a founder. Open « Signalements », filter « Litige », and grant a credit on a garde. Open « Crédits » and see the new credit, then sign in as that family and see « Offert par Berceo » in « Mes crédits ».

## Blockers

- none

## Do not touch

- `.icm/_system/`
- The checks of `bookings` and the index `credits_booking_live_key` keep their meaning: a migration may add values, not remove a rule.

## Notes

- Already on `main` (do not build again): the reason column, the « Litige » mark and the « devenus crédit » line on « Signalements » (annulations-table), the origins `annulation_berceo` and `geste_berceo` and their family words (credits-registre), `outcomeOf` for `by: "berceo"`.
- The release has a migration: `migrate-production.yml` before `promote.sh run`.
- Build moves the stub `.icm/intake/annulations-credits/annulations-back-office.md` to `_done/` in this pull request.
