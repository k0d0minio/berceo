# Build notes: admin-sql-helpers-dedupe

- commits: 708b438 chore: every admin_journal insert through journal.ts, the garde clock from bookingCondition; run-pack and ready commits after it
- ci: GREEN on 2271407 — Vercel preview pass; Quality (advisory) pass (lint, typecheck, 67 test files / 2116 tests)

## What changed

- `src/lib/admin/journal.ts`: `JOURNAL_COLUMNS` and a private `journalSelect(entry)` hold the column
  list and the cast values once; a value is a bound JS value or SQL read off the source row
  (wrapped in parentheses before its cast). `journalInsertIf` is rebuilt on them (same SQL,
  same parameters). New `journalInsertAfter(ctes, source, entry)`: `with <ctes> insert … select
  … from "<source>" returning id` — one statement, the source name quoted by `sql.identifier`.
- `src/lib/admin/accounts.ts` `reactivateAccount`, `src/lib/admin/lists.ts` `markReportHandled`,
  `src/lib/admin/review.ts` `decide`, `src/lib/paiements/payments.ts` `refundFee` (the founder
  refund, `by` set): each keeps its CTE text, guard and return value; only the final
  insert-select comes from `journalInsertAfter`. `review.ts` drops its unused `adminJournal`
  import; `decide` keeps one instant (`at`) for the update and the entry, as before.
- `src/lib/admin/accounts.ts`: `localNow`, `gardeAhead`, `onEitherSide` and the
  `NIGHT_HOURS`/`TIME_ZONE` import gone; `upcomingGardes` and the deletion guard read
  `bookingCondition("en-cours", userId)`, the profile's count `bookingCondition(null, userId)`.
- `src/lib/admin/lists.ts` `bookingCondition`: two overloads return a non-optional `SQL` when a
  filter or an account is given; the general signature is unchanged for the list and overview.
- `src/lib/admin/journal-isolation.test.ts`: walks `src/` (test files excluded) and refuses
  `insert into admin_journal` / `insert into ${adminJournal}` outside `lib/admin/journal.ts`.

## Acceptance criteria status

Recorded here, not ticked in the PR body (learned rule, verification-back-office).

- [x] The grep matches only `src/lib/admin/journal.ts` — checked on 708b438 (two lines, the two helpers).
- [x] `journal-isolation.test.ts` passes (285 cases, Quality (advisory) on 2271407) and fails on a stray insert — the failing half shown by running the test's exact regex over the four files as they are on `main` (all four match) and on this branch (none match).
- [x] The four acts stay one `db.execute` each, with their guards and return values — by construction: `journalInsertAfter` is one `db.execute`; the CTE text, `where` and `rows` reads are unchanged.
- [x] Same entry values — `compte_reactive` with no detail, `signalement_traite` with `subject.id`/`subject.name` and `to_char(subject.night_date, 'YYYY-MM-DD')`, the review action with the reason, `frais_rembourses` with the family (null when the payment has none) and the catalogue detail. The emitted SQL was rendered with drizzle-orm 0.45.3's `PgDialect` in a scratch install: valid, same columns, casts and parameters. The refund's name, admin name and detail now carry `::text` casts they lacked; the columns are text, so nothing changes.
- [x] The grep for `localNow|gardeAhead|onEitherSide` in `accounts.ts` is empty; the three readers use `bookingCondition`.
- [ ] UAT preview: « gardes à venir » equals `/admin/reservations?compte=<id>&etat=en-cours`, and deletion still refused — the operator's smoke.
- [ ] UAT preview: the four acts still write their journal entries — the operator's smoke.
- [x] Existing admin, payments and migration tests pass unchanged — Quality (advisory) on 2271407: 67 files, 2116 tests; no test file was edited.

## Notes for Release

- The one behaviour-sensitive surface is the SQL of the four journal-writing acts; nothing
  tests it against a database. Smoke all four on the preview (the last acceptance criterion)
  before ticking Ready to merge.
- `accounts.ts` now imports `./lists` (no cycle: `lists.ts` imports `journal`, `rules`,
  `paiements/payments`, `gardes/rules`, `demandes/rules`, none of which import `accounts`).
- Neither `format.sh` nor `lint.sh` is wired here (both `SKIP`); the advisory job is the first
  lint and typecheck of this diff.

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on 0772993 (ci-status.sh, full gate: Vercel pass, Quality (advisory) pass); re-read after the last push before the merge
- reviews: code medium (/code-review: no findings) · security security-check.sh --branch --audit: OK (npm audit clean) + /security-review — no findings (every CTE source name is a literal quoted by `sql.identifier`, every inlined `SQL` value a code literal, every user value bound; each act's guard unchanged) · readiness env.sh audit --changed: OK · /production-readiness n/a — not shipped in this repo's skills; no migration, no env var, no auth change
- parked: none
- migrations: skip — none of this run's own
- learned: skip — no error.log; 1 rule from FAILURE.md via close-out (grep all of `src/` for every copy before deduplicating)
- docs: README.md → The founders' verification (the journal's one column list and its source test) · announce: deferred to promotion
