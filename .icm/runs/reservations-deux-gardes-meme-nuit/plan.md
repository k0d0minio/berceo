# Plan: reservations-deux-gardes-meme-nuit

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The index and its migration** — `src/db/schema.ts`: `care_requests_one_open_per_night`
   `.where(sql`${table.status} in ('ouverte', 'attribuee')`)`, comment citing D-156 (widening D-65).
   Load `.icm/skills/database-migration/`, then `npm run db:generate -- --name one_request_per_night`
   → `drizzle/0014_one_request_per_night.sql` (DROP INDEX + CREATE UNIQUE INDEX … WHERE status IN
   ('ouverte','attribuee')), its snapshot and `_journal.json` entry. No data statement (D-158).
   — done when: the SQL file holds only the drop and the create, and `check-migrations.sh` is OK.
2. **The existing-rows probe (D-158)** — on a Neon branch of UAT and of production
   (`.icm/scripts/db-branch.sh`, read-only): `select family_user_id, night_date, count(*) from
   care_requests where status in ('ouverte','attribuee') group by 1,2 having count(*) > 1`. Zero on
   both → apply the migration on the branch and record both counts in `notes.md`. Any row → STOP,
   `error.log` + `handoff.md` blocker, report the pairs to the operator, change nothing.
   — done when: both counts are recorded and the migration applied cleanly on a branch.
3. **The wording (D-157)** — `src/content/demandes.ts` → `erreurs.doublon`:
   « Vous avez déjà une demande pour cette nuit. », `@relecture` comment updated to name D-156.
   Comments on `isUniqueViolation` and `liveRequestOn` (`src/lib/demandes/requests.ts`) say
   « open or booked » (D-156). No logic change in any writer: publish, edit and `republishGarde`
   already map 23505 to « doublon ». — done when: `vitrine.test.ts` passes in CI.
4. **The test** — `src/lib/demandes/*.test.ts` (pure, the repo's style, no database):
   `getTableConfig(careRequests)` (drizzle-orm/pg-core) → find `care_requests_one_open_per_night`,
   assert unique, columns `family_user_id, night_date`, and its `where` rendered SQL names
   `ouverte` and `attribuee` and not `annulee`. — done when: vitest passes in CI and fails if the
   predicate is narrowed back to `ouverte`.
5. **README** — the care request section: « one open or booked request per night ». — done when:
   the line matches D-156.

## Risks

- A parallel run lands `0014_` first: renumber at the merge of `main` (signal: two `0014_` files or a
  journal conflict).
- `drizzle-kit` renders the predicate from the schema; if it quotes or casts the enum values
  differently from the hand-written expectation, the test should assert on the value names, not the
  exact SQL string.
- The probe finds a duplicate on UAT or production: the index cannot be created there, the release
  workflow's migration would fail. That is a STOP for the operator (D-158), never a data fix here.
- Drop-then-create leaves a moment without the index during the migration; acceptable at this
  traffic (the migration runs in the release workflow, one statement pair in one transaction).
