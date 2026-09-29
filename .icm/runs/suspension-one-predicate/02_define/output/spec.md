# Spec: One place that says what a suspended account hides from

- slug: suspension-one-predicate
- personas: parent, professionnel, admin
- touches: src/lib/auth/suspension.ts, src/lib/admin/review.ts, src/lib/reservations/answers.ts, src/lib/reservations/profiles.ts, src/lib/reservations/notices.ts, src/lib/reservations/bookings.ts, src/lib/demandes/requests.ts, src/lib/avis/ratings.ts, src/lib/messagerie/conversations.ts, src/lib/auth/suspension-isolation.test.ts
- complexity: standard

## Problem

A suspended account (back-office-admin, D-134) is shown to no one and put in front of no new
request, answer, booking, rating or e-mail; a deleted account stays suspended (D-136), so the same
rule hides it. Today that rule is written four ways across the readers that apply it:
`notSuspended()` from `src/lib/auth/suspension.ts` (recherche, `bookings.ts`, `answers.ts`
`acceptable`, `requests.ts` the priority check), the same `not exists (select 1 from users su …)`
copied as raw SQL (`raterActive` in `avis/ratings.ts`, `answerRequest` in `reservations/answers.ts`,
`decide` in `admin/review.ts`), `isNull(users.suspendedAt)` on an already-joined `users`
(`publicProfile` in `reservations/profiles.ts`, the priority notice in `reservations/notices.ts`,
`professionalsServing` in `demandes/requests.ts`, `loadQueue` in `admin/review.ts`), and a
JavaScript check on a selected `suspendedAt` (`messageNotice` in `messagerie/conversations.ts`).
Every reader works, but a change to the rule — an expiry, a different treatment of deleted
accounts — reaches only the readers that call the helper, and the next reader of validated
professionals may forget it, as `loadQueue` had until the release review. This is the second and
last stub of the back-office-admin-dedup epic, on the shape `admin-sql-helpers-dedupe` left in the
admin files.

## Proposed change

A chore — no persona sees a new behaviour; every statement keeps its result set.

1. **One enforcement point: the helper (D-165).** `src/lib/auth/suspension.ts` stays the only
   place that states what « suspended » means for a reader. It gains `suspended(userId)`, the
   positive form (`exists (select 1 from users as su where su.id = <id> and su.suspended_at is
   not null)`), and `notSuspended(userId)` becomes `not` of it. The SQL `notSuspended` emits stays
   byte-for-byte what it emits today, so `suspension.test.ts` and `recherche/professionals.test.ts`
   hold unchanged. No view, no migration.
2. **Every reader calls it.** Each site passes the column (or SQL expression) holding the id of
   the account being held out:
   - `raterActive` (`avis/ratings.ts`): `notSuspended(<the case expression picking the family's id
     or the professional's user id>)`; the doc comment stays.
   - `answerRequest` (`reservations/answers.ts`): `${notSuspended(sql\`p.user_id\`)}` inside the
     raw insert-select.
   - `decide` (`admin/review.ts`): `${notSuspended(...)}` on the updated profile's `user_id`,
     qualified (`professional_profiles.user_id`) so it does not rely on `users` having no
     `user_id` column.
   - `loadQueue` (`admin/review.ts`), `publicProfile` (`reservations/profiles.ts`),
     `professionalsServing` (`demandes/requests.ts`): `notSuspended(professionalProfiles.userId)`
     in place of `isNull(users.suspendedAt)`; the `users` join stays where the query selects from
     it, and `isNull` imports go if unused.
   - The priority notice (`reservations/notices.ts`): `notSuspended(professionalProfiles.userId)`
     in place of `isNull(professionalUser.suspendedAt)`.
   - `acceptAnswer`'s facts (`reservations/bookings.ts`): `suspended(professionalProfiles.userId)`
     in place of `not ${notSuspended(…)}`.
   - `messageNotice` (`messagerie/conversations.ts`): the recipient's suspension is read in SQL —
     select `suspended(conversations.familyUserId)` and `suspended(professionalProfiles.userId)`
     as booleans instead of the two `suspendedAt` columns — and the function still returns null
     when the recipient's is true (D-166).
3. **What stays as it is (D-166).** The column's writer and the account's own state are not
   readers holding someone out: `admin/accounts.ts` (suspend, reactivate and delete write or guard
   on the account's own row, and project `suspendedAt` to the founders), `admin/lists.ts` and
   `admin/rules.ts` (the founders' view of the state), `auth/current-user.ts` and the sign-in
   action in `src/app/(auth)/actions.ts` (the account's own session), and `db/schema.ts` (the
   column and the `users_deleted_suspended` check). `suspendedAtExactly` / `deletedAtExactly` stay
   in `suspension.ts` unchanged.
4. **A source test.** A new `src/lib/auth/suspension-isolation.test.ts`, in the shape of
   `src/lib/admin/journal-isolation.test.ts`, walks every `.ts`/`.tsx` under `src/` (test files
   excluded) and, outside `lib/auth/suspension.ts`, `lib/admin/accounts.ts` and `db/schema.ts`,
   fails on:
   - `suspended_at` (the raw column name, case-insensitive);
   - a condition built on the Drizzle column: `isNull(<x>.suspendedAt)`,
     `isNotNull(<x>.suspendedAt)`, or `<x>.suspendedAt}` followed by `is` inside a `sql` template.
   Selecting `<x>.suspendedAt` as a value stays allowed (the founders' pages, the session). It
   includes a « has files to check » floor.

## Acceptance criteria

- [ ] `grep -rniE "suspended_at" src --include=*.ts --include=*.tsx | grep -v "\.test\.tsx\?:"` matches only `src/lib/auth/suspension.ts`, `src/lib/admin/accounts.ts` and `src/db/schema.ts`.
- [ ] `grep -rnE "isN(ot)?Null\([A-Za-z]+\.suspendedAt\)|suspendedAt\}\s*is" src --include=*.ts --include=*.tsx` matches only `src/lib/admin/accounts.ts` and `src/db/schema.ts`.
- [ ] `raterActive`, `answerRequest`, `decide`, `loadQueue`, `publicProfile`, `professionalsServing`, the priority notice, `acceptAnswer`'s facts and `messageNotice` each build their suspension condition from `notSuspended` or `suspended` in `src/lib/auth/suspension.ts`, on the id of the account being held out.
- [ ] `messageNotice` no longer selects `suspendedAt`; it returns null when the recipient is suspended and the notice otherwise, as before.
- [ ] `suspension-isolation.test.ts` passes on the branch and fails when `isNull(users.suspendedAt)` or a raw `suspended_at is not null` is added to any other file under `src/` (shown once locally or in CI, then removed).
- [ ] The existing tests pass unchanged — `src/lib/auth/suspension.test.ts` (the emitted `not exists (…)` string), `src/lib/recherche/professionals.test.ts`, `src/lib/admin/*.test.ts`, and every other `*.test.ts` under `src/`.
- [ ] On the UAT preview, with a validated professional serving a commune: once a founder suspends her account, she is absent from the family's search and the commune page, her public profile and the family's view of her profile answer « introuvable », she cannot answer an open request, and no request e-mail or message e-mail reaches her; once reactivated, each of these is back.
- [ ] On the UAT preview: a professional whose file waits in the verification queue disappears from `/admin/dossiers` while suspended and returns when reactivated.

## Out of scope

- A database view (`visible_professionals`, `active_users`) as the enforcement point: rejected at Define (D-165).
- An `isSuspended(row)` JavaScript twin for `currentUser`, the sign-in action and `admin/rules.ts`: they read the account's own state, not a hold-out (D-166).
- The writes and guards in `admin/accounts.ts` (suspend, reactivate, delete): the column's only writer states its own conditions.
- Any change to what suspension hides, to deleted accounts, or an expiry on suspension.
- `localNow` / the night's end restated in `gardes/gardes.ts` and `avis/ratings.ts`: not this epic's.

## Open questions

- none — the two choices the stub left open were settled with the operator on 2026-09-29: every reader calls `notSuspended()` / `suspended()` with a source test, no view (D-165); the in-memory checks on the account's own state stay, only `messageNotice` moves to SQL (D-166).
