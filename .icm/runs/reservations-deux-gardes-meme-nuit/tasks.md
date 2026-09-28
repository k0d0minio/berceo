# Tasks: reservations-deux-gardes-meme-nuit

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `care_requests_one_open_per_night` in `src/db/schema.ts` is a unique index on `(family_user_id, night_date)` where `status IN ('ouverte', 'attribuee')`, and one new migration under `drizzle/` (with its snapshot and journal entry) drops and recreates it with exactly that predicate and changes nothing else.
- [ ] A family whose request for a night is `attribuee` who publishes a new request for that night gets the « doublon » error on the date field, and no row is written.
- [ ] A family who edits another open request's night onto a night she has booked gets the « doublon » error, and the request is unchanged.
- [ ] Republishing a cancelled garde whose night already carries a booked request of hers lands her on that request, and no second request is written, including when the two writes race (the index refuses the second).
- [ ] A night whose request is `annulee` (a cancelled request, a cancelled garde, a reported absence) can still be published or republished.
- [ ] Booking an answer on an open request still succeeds (the request moving to `attribuee` does not trip the index).
- [ ] The « doublon » text reads « Vous avez déjà une demande pour cette nuit. », is marked `@relecture`, and `vitrine.test.ts` passes.
- [ ] A test holds the index's predicate to `ouverte` and `attribuee` (read from the schema, not only from the migration), so narrowing it again fails CI.
- [ ] The read-only duplicate count ran on a branch of UAT and of production and found zero pairs, recorded in the run; the migration applies cleanly on the branch.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
