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

- [x] Schema: widen `care_requests_one_open_per_night` to `ouverte`, `attribuee` (`src/db/schema.ts`)
- [x] Migration `drizzle/0014_one_request_per_night.sql` + snapshot + journal (`npm run db:generate`)
- [x] D-158 probe: duplicate count on the run's Neon branch (UAT copy) and on production; migration applied and verified on the run branch; behaviour probed
- [x] Wording D-157 (`src/content/demandes.ts`) and the comments in `src/lib/demandes/requests.ts`
- [x] Test `src/lib/demandes/one-per-night.test.ts` (index read from the schema)
- [x] README line on `care_requests`
- [x] Pre-flip: `lint.sh`, `env.sh audit --changed`, `ci-status.sh` on the draft head, merge `origin/main`, `security-check.sh --branch`
- [ ] Flip ready, push, settle the full gate
