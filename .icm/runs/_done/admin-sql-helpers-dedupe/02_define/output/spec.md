# Spec: The back-office's journal inserts and garde clock written once

- slug: admin-sql-helpers-dedupe
- personas: admin
- touches: src/lib/admin/journal.ts, src/lib/admin/accounts.ts, src/lib/admin/lists.ts, src/lib/admin/review.ts, src/lib/paiements/payments.ts, src/lib/admin/journal-isolation.test.ts
- complexity: standard

## Problem

The `admin_journal` insert — its seven-column list and the casts of each value — is written in
`journal.ts` (`journalInsert`, `journalInsertIf`) and again by hand in four one-statement CTEs:
`reactivateAccount` (`src/lib/admin/accounts.ts`), `markReportHandled` (`src/lib/admin/lists.ts`),
`decide` (`src/lib/admin/review.ts`) and the founder's refund in `refundPayment`
(`src/lib/paiements/payments.ts`). The journal is append-only and records every founder act
(D-54): a column renamed or added would be updated in the helpers and fail at runtime in the
others, on the one ledger that cannot be patched afterwards. Separately, the garde clock and « this
account on either side » exist twice: `gardeAhead` / `onEitherSide` / `localNow` in
`accounts.ts`, and `bookingCondition` in `lists.ts`. The account page's « gardes à venir », the
deletion guard and the bookings list `?compte=<id>&etat=en-cours` are three readings of one set,
the case D-133 exists to prevent. This is the first of the back-office-admin-dedup epic; the
suspension sweep (`suspension-one-predicate`) builds on the shape it leaves in the same files.

## Proposed change

A chore — no persona sees a new behaviour; every SQL statement keeps its semantics.

1. **One journal insert (D-152).** `journal.ts` owns the only `insert into admin_journal`. It
   gains a helper for the CTE case: given a `with` clause (one or more CTEs, as SQL), the name of
   the CTE row source, and an entry whose values may each be a JS value or a SQL expression read
   off that row (`decided.user_id`, `subject.name`, …), it builds
   `with … insert into admin_journal (…) select … from <source> returning id` as one statement,
   awaited or unawaited like `journalInsertIf`. The column list and the value casts
   (`::timestamptz`, `::admin_action`, `::uuid`, `::text`) are written once and shared by
   `journalInsertIf` and the new helper; `journalInsert` (Drizzle's `.values`) stays as it is,
   typed by the schema. The exact signature is Build's choice.
2. **The four CTE sites use it (D-151).** `reactivateAccount`, `markReportHandled`, `decide`
   and the refund keep their CTEs (`lifted`, `handled`/`subject`, `decided`, `done`), their
   `where` conditions and their return value (`rows.length > 0`, the journal id for `decide`);
   only the insert-select at the end is built by the helper. `reactivateAccount` gains no
   `detail` (null, as today); the refund keeps its `detail` from the content catalogue.
3. **One garde clock.** `accounts.ts` drops `localNow`, `gardeAhead` and `onEitherSide` and
   calls `bookingCondition("en-cours", userId)` from `./lists` for `upcomingGardes`, for the
   deletion guard inside `deleteAccount`'s `not exists`, and `bookingCondition(null, userId)`
   for the profile's booking count. `bookingCondition`'s result for a non-null filter or account
   is always defined; Build gives accounts.ts a non-optional `SQL` without an unchecked cast
   leaking the `undefined` case (an overload or a small wrapper is fine).
4. **A source test.** A new `src/lib/admin/journal-isolation.test.ts`, in the shape of
   `src/lib/disponibilites/isolation.test.ts`, walks every `.ts`/`.tsx` under `src/` (test files
   excluded) and fails when `insert into admin_journal` or
   `insert into ${adminJournal}` (case-insensitive) appears outside `src/lib/admin/journal.ts`.

## Acceptance criteria

- [ ] `grep -rniE "insert into (admin_journal|\\$\\{adminJournal\\})" src --include=*.ts --include=*.tsx` matches only `src/lib/admin/journal.ts` (and the new test's own pattern strings).
- [ ] `journal-isolation.test.ts` passes on the branch and fails when an `insert into admin_journal` is added to any other file under `src/` (shown once locally or in CI, then removed).
- [ ] `reactivateAccount`, `markReportHandled`, `decide` and the founder's refund each still run as one SQL statement (one `db.execute`), write their change and its journal entry together, write neither when the guard fails (a second founder acted first), and return what they returned before.
- [ ] The journal entries they write carry the same `action`, subject id and name, admin id and name, `detail` and `occurred_at` as before: `compte_reactive` with no detail; `signalement_traite` naming the side that cancelled, detail the night as `YYYY-MM-DD`; the review action with the reason as detail; `frais_rembourses` naming the family with the catalogue's detail.
- [ ] `grep -n "localNow\|gardeAhead\|onEitherSide" src/lib/admin/accounts.ts` finds nothing; `upcomingGardes`, the deletion guard and the profile's booking count all build their condition from `bookingCondition`.
- [ ] On the UAT preview, for one account with a confirmed garde whose night has not ended: the account page's « gardes à venir » lists the same bookings as `/admin/reservations?compte=<id>&etat=en-cours`, and « Supprimer le compte » is still refused while it stands.
- [ ] On the UAT preview: reactivating a suspended account, marking a cancelled garde « traité », a verification decision and a founder's refund each still add their journal entry, visible on `/admin/journal` and the account's history.
- [ ] The existing admin, payments and journal tests (`src/lib/admin/*.test.ts`, `src/lib/paiements/*.test.ts`, `src/db/*migration*.test.ts`) pass unchanged.

## Out of scope

- The suspension predicate written three ways, including the raw `not exists (select 1 from users su …)` inside `decide` — `suspension-one-predicate`, next in this epic, on the shape this run leaves.
- `localNow` / the night's end restated in `src/lib/gardes/gardes.ts` and `src/lib/avis/ratings.ts`: outside the back-office; a shared clock across modules is not this stub's.
- `journalInsert` (the Drizzle `.values` insert used by the purge, the settings switch and `accountContact`): already the one helper, typed by the schema.
- Converting the CTE statements to `db.batch` + `journalInsertIf`: rejected at Define (D-152).
- Any change to the journal's columns, the append-only trigger, or what an entry says.

## Open questions

- none — the two choices the stub left open were settled with the operator on 2026-09-28: all four hand-written inserts move, with a source test (D-151), and the CTE statements stay one statement through a CTE-aware helper in `journal.ts` (D-152).
