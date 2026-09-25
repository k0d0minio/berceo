# Build notes: avis-etoiles

- commits: (filled at the stop)
- ci: (filled at the stop)

## The garde facts this run reads (plan Pass 0)

cycle-de-garde-et-annulation merged as #48. The state is computed, never stored (its D-109).

- **terminée**: `gardeState(facts, now) === "terminee"` in `src/lib/gardes/rules.ts`, where `facts = { status, nightDate, startTime }`. `bookings.status` is `confirmee | annulee`; `startTime` comes from `care_requests.start_time`.
- **annulée**: `bookings.status = 'annulee'`. This covers both a cancellation before the start and an absence reported until end + 24 h (`cancellation_kind = 'absence'`).
- **the end instant**: `nightEnd(nightDate, startTime)` in `src/lib/gardes/rules.ts` (Brussels wall clock, start + `NIGHT_HOURS` = 11). In SQL it is `(r.night_date + r.start_time + interval '11 hours')` compared with `now() AT TIME ZONE 'Europe/Brussels'`, the form `src/lib/gardes/gardes.ts` already uses.

A terminée garde can still turn annulée by an absence within 24 h of its end. This run holds that as D-122.

## What changed

## Acceptance criteria status

## Notes for Release
