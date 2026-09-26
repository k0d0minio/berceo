# Plan: onboarding-upload-limit-race

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The pure decision** — `src/lib/professionnelle/rules.ts` gains the outcome type (recorded /
   over the limit / key already recorded / failed) and the function mapping it to the answer
   (`ok`, `nombre`, `echec`) and to whether the uploaded object is deleted; unit tests in
   `rules.test.ts`, one per outcome. — done when: `npm test` passes on the rules file and only
   "over the limit" and "failed" delete.
2. **The locked recording** — `confirmUpload` in
   `src/app/(portail)/espace/professionnelle/actions.ts`: replace the lone `db.insert` with one
   `db.batch` — `select id from professional_profiles where id = $profile for update`, then the
   insert guarded by `count(kind) < FILES_PER_DOCUMENT_MAX` (documents only) and `not exists`
   on the storage key, `returning id`, plus whatever read tells a limit refusal from a key
   refusal (a CTE flag or a third statement in the same batch). Map the result through pass 1's
   function; a key refusal must not reach `discard`. The pre-checks and the photo's replacement
   step after the insert are left as they are. — done when: the action has no branch deciding
   the answer itself, and the photo path still records under the lock without a count.
3. **The proof** — a throwaway script (not committed under `src/`) that creates a Neon branch
   of the non-production project (`dawn-scene-70949411`, `NEON_API_KEY`), seeds one profile with
   two `diplome` rows, fires the pass-2 batch twice in parallel for a third and fourth file, then
   twice for one key, and prints the rows; the branch is deleted after. — done when: `notes.md`
   records the command and the rows (three `diplome` rows; one row for the key).

## Risks

- The Neon HTTP batch not running as one transaction would void the lock — signal: the parallel
  proof ends with four rows. `acceptAnswer` relies on the same guarantee, so a failure here is a
  failure there too; say so in `notes.md` rather than working around it.
- `drizzle-orm/neon-http`'s batch typing rejects a raw `db.execute` among typed statements —
  `bookings.ts` already mixes them; copy its cast.
- A key refusal reaching `discard` would delete the winner's file — the unit test on pass 1's
  mapping and the parallel same-key proof both catch it.
