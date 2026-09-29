# Build notes: suspension-one-predicate

- commits: renumber decisions to D-169/D-170 · merge origin/main · the readers on one predicate + source test
- ci: see the last `ci-status.sh` verdict in `status.md`

## What changed

- `src/lib/auth/suspension.ts`: `suspended(userId)` (the `exists (…)` form) added; `notSuspended(userId)` is now `` sql`not ${suspended(userId)}` ``. Drizzle inlines a nested `sql` chunk without parentheses (`drizzle-orm` 0.45.3, `SQL.buildQueryFromSourceParams`), so the emitted string is byte-for-byte what `suspension.test.ts`, `recherche/professionals.test.ts` and `demandes/statements.test.ts` assert.
- `src/lib/avis/ratings.ts` `raterActive`: `notSuspended(<case expression>)` in place of the hand-written `not exists`.
- `src/lib/reservations/answers.ts` `answerRequest`: `` ${notSuspended(sql`p.user_id`)} `` inside the raw insert-select.
- `src/lib/admin/review.ts`: `decide` uses `${notSuspended(professionalProfiles.userId)}` (renders `"professional_profiles"."user_id"`, so the unqualified `user_id` is gone); `loadQueue` uses `notSuspended(professionalProfiles.userId)`; `isNull` import dropped.
- `src/lib/reservations/profiles.ts` `publicProfile`, `src/lib/reservations/notices.ts` (the priority notice), `src/lib/demandes/requests.ts` `professionalsServing`: `notSuspended(professionalProfiles.userId)` in place of `isNull(<users>.suspendedAt)`; unused `isNull` imports dropped (`requests.ts` still uses it elsewhere).
- `src/lib/reservations/bookings.ts` `acceptAnswer`'s facts: `suspended(…)` in place of `not ${notSuspended(…)}`.
- `src/lib/messagerie/conversations.ts` `messageNotice`: selects `suspended(conversations.familyUserId)` and `suspended(professionalProfiles.userId)` as `sql<boolean>` in place of the two `suspendedAt` columns; returns null when the recipient's flag is true (D-170).
- `src/lib/auth/suspension-isolation.test.ts` (new): walks `src/`, skips tests, allows `lib/auth/suspension.ts`, `lib/admin/accounts.ts`, `db/schema.ts`; fails on `suspended_at`, `is(Not)?Null(<x>.suspendedAt)`, `.suspendedAt} is`.

## Acceptance criteria status

- [x] `suspended_at` grep — matches only `src/db/schema.ts`, `src/lib/admin/accounts.ts`, `src/lib/auth/suspension.ts`.
- [x] `is(Not)?Null(…suspendedAt)` / `suspendedAt} is` grep — matches only `src/lib/admin/accounts.ts` (lines 340 and 447, the suspend and delete guards). The criterion's regex was corrected from `isN(ot)?Null`, which never matched `isNull` (FAILURE.md).
- [x] The nine readers build their condition from `notSuspended` / `suspended`, each on the id of the account held out (the professional's `professional_profiles.user_id`, the family's `conversations.family_user_id` / `bookings.family_user_id`).
- [x] `messageNotice` no longer selects `suspendedAt`; null for a suspended recipient, the notice otherwise.
- [x] `suspension-isolation.test.ts` — its patterns emulated over `src/` with node in the session (not the test runner): PASS on the branch (283 files); FAIL on `src/lib/reservations/profiles.ts` with a stray `isNull(users.suspendedAt)`, and with a stray `isNotNull(x.suspendedAt)`; FAIL on `src/lib/avis/rules.ts` with a stray `` sql`su.suspended_at is not null` ``; each stray removed. The runner's verdict is the advisory job on the ready head.
- [ ] Existing tests unchanged — read from the advisory quality job on the ready head.
- [ ] UAT preview, the suspended professional end to end — the operator's smoke.
- [ ] UAT preview, `/admin/dossiers` — the operator's smoke.

## Notes for Release

- Every change is a query rewrite with the same result set; the risk is a wrong id column passed to the helper. Check each call site's argument against the column the diff removed.
- `messageNotice` reads two `exists` booleans through the Drizzle builder, as `acceptAnswer`'s facts already did; no `db.execute` string-boolean path.
- Spec text changed in Build: decision ids renumbered D-165/D-166 → D-169/D-170 (collision with two sibling branches and `main`), and the second criterion's regex fixed. The PR body's criterion line was patched to match; no gate was re-projected.
