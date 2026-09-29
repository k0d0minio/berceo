# Build notes: reservations-deux-gardes-meme-nuit

- commits: `feat: reservations-deux-gardes-meme-nuit — one open or booked request per night` (schema, migration 0014, wording, test, README, run files)
- ci: GREEN on ece9e38 (full gate: Vercel preview pass, Quality (advisory) pass — vitest, the new test included)

## What changed

- `src/db/schema.ts`: `care_requests_one_open_per_night` now `WHERE status in ('ouverte', 'attribuee')` (D-156, widening D-65); same name and columns.
- `drizzle/0014_one_request_per_night.sql` (+ `meta/0014_snapshot.json`, `_journal.json`): drop and recreate the index with that predicate; no data statement (D-158).
- `src/content/demandes.ts`: `erreurs.doublon` → « Vous avez déjà une demande pour cette nuit. », `@relecture` (D-157).
- `src/lib/demandes/requests.ts`: comments on `isUniqueViolation` and `liveRequestOn` say « open or booked ». No logic change: publish, edit and `republishGarde` already map 23505 to « doublon ».
- `src/lib/demandes/one-per-night.test.ts`: reads the index from the schema (`getTableConfig`) and holds it to unique, `(family_user_id, night_date)`, `ouverte` and `attribuee`, never `annulee`.
- `README.md`: the `care_requests` line names the widening.

## The probes (D-158)

- **UAT** — the run's Neon branch `run/reservations-deux-gardes-meme-nuit` (a copy of the UAT database, project `dawn-scene-70949411`): 0 duplicate `(family_user_id, night_date)` pairs among `ouverte`/`attribuee` (1 request in all). `npm run db:migrate` applied 0014, `db:verify` → all 15 journal entries applied; `pg_indexes` shows `WHERE (status = ANY (ARRAY['ouverte', 'attribuee']))`.
- **Behaviour on that branch** (throwaway probe, rows deleted after): an open request moved to `attribuee` → ok; a second `ouverte` on the booked night → refused 23505; another open request's night moved onto the booked night → refused 23505; once the booked one is `annulee`, a new `ouverte` on that night → ok.
- **Production** — project `tiny-cell-08223046`, one read-only aggregate on `main` (the operator's choice over a branch, 2026-09-29): production has no `care_requests` table yet (only `users`, `user_consents`; it is migrated at promotion), so 0 pairs by construction. The table will be created empty with every migration in the batch, 0014 included.

## Acceptance criteria status

- [x] Index and one migration with exactly that predicate — schema, `0014_one_request_per_night.sql` (drop + create only), snapshot and journal entry.
- [x] Publishing on a booked night → « doublon », no row — the index refuses the insert (probe: 23505); `publishRequest` maps it to `doublon`, the action puts it on the date field.
- [x] Editing another open request onto a booked night → « doublon », unchanged — probe: the UPDATE is refused (23505); `updateRequest` returns `doublon`.
- [x] Republishing a cancelled garde onto a booked night lands on it, race included — `liveRequestOn` already reads open or booked; a concurrent second write is now refused by the index, and `republishGarde` then returns `doublon` with the live id.
- [x] An `annulee` night can be published again — probe: ok after the booked request becomes `annulee`; cancelled requests, cancelled gardes and absences all set `annulee` (`cancelBookedRequestStatement`).
- [x] Booking still succeeds — probe: `ouverte` → `attribuee` on the same row is accepted.
- [x] The wording and `vitrine.test.ts` — text changed and marked `@relecture`; the quality job passed on ece9e38.
- [x] The test holding the predicate — passed in the quality job on ece9e38 (its assumptions about Drizzle's rendered predicate were checked in the session: `"care_requests"."status" in ('ouverte', 'attribuee')`).
- [x] The duplicate count and a clean migration on the branch — see The probes.

## Notes for Release

- D-n renumbering: Define took D-153–D-155, which three sibling runs defined the same minutes also took; Build renumbered this run's to D-156–D-158 (spec, run files, code comments). The approved spec's content is otherwise unchanged; see `FAILURE.md`. The siblings `reservations-regles-non-appelees`, `gardes-shared-helpers` and `messagerie-profil-non-valide` still collide with each other on D-153–D-155.
- The migration is drop-then-create in one transaction; at this traffic the moment without the index is not a concern.
- `vitrine.test.ts` does not read `src/content/demandes.ts`; the new text holds D-19 by inspection (no `!`, `…` or `—`, vouvoiement).

Context budget: beyond the Inputs, read `src/lib/avis/no-text.test.ts` for the repo's schema-test idiom and `package.json` for the migrate scripts.
