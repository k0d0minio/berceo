# Spec: A family can hold only one open or booked request per night

- slug: reservations-deux-gardes-meme-nuit
- personas: parent
- touches: src/db/schema.ts, drizzle/**, src/lib/demandes/**, src/content/demandes.ts
- complexity: standard

## Problem

`care_requests_one_open_per_night` (D-65) is a partial unique index on `(family_user_id,
night_date)` that only covers `status = 'ouverte'`. When the family books an answer the request
becomes `attribuee` and leaves the index, so she can publish a second request for the same night
(or move another open request onto it), receive answers and book and pay a second professional:
`bookings_family_night_idx` is not unique. Two professionals then come for one night and the
family paid two service fees. Found by the candidature-et-reservation release review
(2026-09-25); it is the P1 of the « reservations-revue-candidature » epic and ships first. The
republication of a cancelled garde already refuses a night with a live request
(`liveRequestOn`, open or booked), but only by a read before the insert, so it races; the
publication and the edit forms do not check at all.

## Proposed change

**The rule (D-156).** A family holds at most one **open or booked** request per night: D-65
widened from `ouverte` to `ouverte` and `attribuee`. A cancelled request (`annulee`) never counts,
so a cancelled request, a garde cancelled by either side and a reported absence (all of which set
the request to `annulee`) leave the night free to publish or republish again, as today.

**The index.** `care_requests_one_open_per_night` in `src/db/schema.ts` becomes
`WHERE status IN ('ouverte', 'attribuee')` (same name and columns; the comment says D-156). One
Drizzle migration of its own, generated with `npm run db:generate -- --name one_request_per_night`
(drop and recreate the index). It carries no data change (D-158). The `attribuee` enum value
already exists on every environment, so nothing ties this migration to another.

**What the family sees.** Every path that writes a night onto a request already maps a unique
violation to « doublon »: publishing (`publishRequest`, including a request published from a
professional's profile « en priorité »), editing (`updateRequest`) and republishing a cancelled
garde (`republishGarde`, which lands her on the live request). With the wider index they now also
refuse a night she has already booked, with no new branch in the code. The form's « doublon » text
(`src/content/demandes.ts`) becomes the neutral « Vous avez déjà une demande pour cette nuit. »,
marked `@relecture` (D-157), since it now also covers a booked night. The comments on
`isUniqueViolation` and `liveRequestOn` in `src/lib/demandes/requests.ts` are brought in line
with D-156.

**Booking.** Moving a request from `ouverte` to `attribuee` keeps it in the index, so the booking
statement is unchanged and cannot collide with itself.

**The existing rows (D-158).** Creating the unique index fails if any family already holds two
open-or-booked requests for one night. Before the ready flip, Build runs a read-only count of such
`(family_user_id, night_date)` pairs on a Neon branch of UAT and of production
(`.icm/scripts/db-branch.sh`, per the database-migration skill). Zero on both: carry on. Any hit:
STOP and report the pairs to the operator; no row is changed by this run.

## Acceptance criteria

- [ ] `care_requests_one_open_per_night` in `src/db/schema.ts` is a unique index on `(family_user_id, night_date)` where `status IN ('ouverte', 'attribuee')`, and one new migration under `drizzle/` (with its snapshot and journal entry) drops and recreates it with exactly that predicate and changes nothing else.
- [ ] A family whose request for a night is `attribuee` who publishes a new request for that night gets the « doublon » error on the date field, and no row is written.
- [ ] A family who edits another open request's night onto a night she has booked gets the « doublon » error, and the request is unchanged.
- [ ] Republishing a cancelled garde whose night already carries a booked request of hers lands her on that request, and no second request is written, including when the two writes race (the index refuses the second).
- [ ] A night whose request is `annulee` (a cancelled request, a cancelled garde, a reported absence) can still be published or republished.
- [ ] Booking an answer on an open request still succeeds (the request moving to `attribuee` does not trip the index).
- [ ] The « doublon » text reads « Vous avez déjà une demande pour cette nuit. », is marked `@relecture`, and `vitrine.test.ts` passes.
- [ ] A test holds the index's predicate to `ouverte` and `attribuee` (read from the schema, not only from the migration), so narrowing it again fails CI.
- [ ] The read-only duplicate count ran on a branch of UAT and of production and found zero pairs, recorded in the run; the migration applies cleanly on the branch.

## Out of scope

- Any data fix for existing duplicates (D-158): a hit stops the run and goes back to the operator.
- Making `bookings_family_night_idx` unique: a booking follows its request, and the request's index now holds the rule; a second guard is not asked for.
- A distinct message or redirect for a booked night on the publish and edit forms (D-157: one neutral text).
- The epic's other two stubs, `reservations-regles-non-appelees` and `reservations-compte-reponses-une-demande`.

## Open questions

- none

Context budget: read `src/db/schema.ts` (care_requests), `src/lib/demandes/requests.ts`, `src/lib/gardes/gardes.ts` (republishGarde), the two family action files and `src/content/demandes.ts` to confirm every writer of a night maps a unique violation to « doublon »; the cahier des charges lives outside this repo (icm-board) and was not read.
