# Tasks: admin-sql-helpers-dedupe

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `grep -rniE "insert into (admin_journal|\$\{adminJournal\})" src --include=*.ts --include=*.tsx` matches only `src/lib/admin/journal.ts` (and the new test's own pattern strings).
- [ ] `journal-isolation.test.ts` passes on the branch and fails when an `insert into admin_journal` is added to any other file under `src/` (shown once locally or in CI, then removed).
- [ ] `reactivateAccount`, `markReportHandled`, `decide` and the founder's refund each still run as one SQL statement (one `db.execute`), write their change and its journal entry together, write neither when the guard fails (a second founder acted first), and return what they returned before.
- [ ] The journal entries they write carry the same `action`, subject id and name, admin id and name, `detail` and `occurred_at` as before: `compte_reactive` with no detail; `signalement_traite` naming the side that cancelled, detail the night as `YYYY-MM-DD`; the review action with the reason as detail; `frais_rembourses` naming the family with the catalogue's detail.
- [ ] `grep -n "localNow\|gardeAhead\|onEitherSide" src/lib/admin/accounts.ts` finds nothing; `upcomingGardes`, the deletion guard and the profile's booking count all build their condition from `bookingCondition`.
- [ ] On the UAT preview, for one account with a confirmed garde whose night has not ended: the account page's « gardes à venir » lists the same bookings as `/admin/reservations?compte=<id>&etat=en-cours`, and « Supprimer le compte » is still refused while it stands.
- [ ] On the UAT preview: reactivating a suspended account, marking a cancelled garde « traité », a verification decision and a founder's refund each still add their journal entry, visible on `/admin/journal` and the account's history.
- [ ] The existing admin, payments and journal tests (`src/lib/admin/*.test.ts`, `src/lib/paiements/*.test.ts`, `src/db/*migration*.test.ts`) pass unchanged.

## Queue

- [x] journal.ts: `JOURNAL_COLUMNS`, `journalSelect`, `journalInsertIf` rebuilt, `journalInsertAfter` — 708b438
- [x] the four CTE acts on `journalInsertAfter` (accounts, lists, review, payments) — 708b438
- [x] accounts.ts on `bookingCondition` (overloads in lists.ts) — 708b438
- [x] `journal-isolation.test.ts` — 708b438
