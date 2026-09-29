# Plan: suspension-one-predicate

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The helper** — `src/lib/auth/suspension.ts`: add `suspended(userId: AnyPgColumn | SQL): SQL`
   (`exists (select 1 from users as su where su.id = ${userId} and su.suspended_at is not null)`)
   and rebuild `notSuspended` as `` sql`not ${suspended(userId)}` ``; update the module comment to
   say every reader goes through these two — done when: `suspension.test.ts` passes unchanged
   (the emitted string is identical).
2. **The raw-SQL readers** — `raterActive` (`avis/ratings.ts`, the `case … end` expression as the
   id), `answerRequest` (`reservations/answers.ts`, `` sql`p.user_id` ``), `decide`
   (`admin/review.ts`, `` sql`professional_profiles.user_id` `` or the Drizzle column inside the
   raw update) — done when: `grep -rni suspended_at src/lib` lists only `suspension.ts` and
   `admin/accounts.ts`.
3. **The joined-`users` readers** — `loadQueue` (`admin/review.ts`), `publicProfile`
   (`reservations/profiles.ts`), `professionalsServing` (`demandes/requests.ts`), the priority
   notice (`reservations/notices.ts`): `notSuspended(professionalProfiles.userId)`; drop unused
   `isNull` imports; `acceptAnswer`'s facts (`reservations/bookings.ts`) take `suspended(…)` —
   done when: the second acceptance criterion's grep lists only `accounts.ts` and `schema.ts`.
4. **`messageNotice`** — `messagerie/conversations.ts`: select
   `familySuspended` as `suspended(conversations.familyUserId)` (typed `sql<boolean>`) and `professionalSuspended` on
   `professionalProfiles.userId` in place of the two `suspendedAt` fields; return null when the
   recipient's flag is true — done when: the file no longer names `suspendedAt` and the existing
   messagerie tests pass.
5. **The source test** — `src/lib/auth/suspension-isolation.test.ts` after
   `src/lib/admin/journal-isolation.test.ts`: walk `src/`, skip `*.test.ts(x)`, allowlist
   `lib/auth/suspension.ts`, `lib/admin/accounts.ts`, `db/schema.ts`; fail on `/suspended_at/i`,
   `/isN(?:ot)?Null\(\s*\w+\.suspendedAt\s*\)/`, `/\.suspendedAt\}\s*is\b/i`; a « has files
   to check » floor — done when: it passes, and failed once with a deliberate stray
   `isNull(users.suspendedAt)` before that was removed (noted in `notes.md`).

## Risks

- A wrong id column passed to the helper (the family's id where the professional's user id is
  meant) inverts who is held out without failing any build — each site's argument is checked
  against the column it replaced, and the UAT smoke suspends one professional end to end.
- `pg` returning the `exists` boolean selects as strings through `db.execute` — `messageNotice`
  uses the Drizzle builder (typed `sql<boolean>`), as `acceptAnswer` already does; keep it there.
- The unqualified `user_id` inside `decide`'s update: qualify it, or the correlated subquery may
  bind differently if `users` ever gains a `user_id` column.
