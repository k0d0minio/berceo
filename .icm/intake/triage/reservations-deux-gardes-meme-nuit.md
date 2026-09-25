# Stub: A family can book two gardes for the same night

- lane: bug
- found-by: candidature-et-reservation release review · 2026-09-25
- complexity: standard

## Problem

`care_requests_one_open_per_night` (D-65) only covers `status = 'ouverte'`. Once a request is
booked it becomes `attribuee` and leaves the index, so the family can publish a second request
for the same night, receive answers and book a second professional: `bookings_family_night_idx`
is not unique.

## Proposed change

Hold « one open or booked request per family and night »: widen the partial unique index to
`status IN ('ouverte', 'attribuee')` in a migration of its own (Postgres refuses a value added by
`ALTER TYPE … ADD VALUE` in the transaction that adds it, so it cannot ride with 0007), and
return the form's existing « doublon » error on the date.

## Prompt

In the berceo repo, read `.icm/intake/triage/reservations-deux-gardes-meme-nuit.md`. In
`src/db/schema.ts`, widen `care_requests_one_open_per_night` to `status IN ('ouverte','attribuee')`,
generate one migration with `npm run db:generate -- --name one_request_per_night`, and add a test
or a probe showing a second request for a booked night is refused with « doublon ». Run it
through `/pipeline bug reservations-deux-gardes-meme-nuit`.
