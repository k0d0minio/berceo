# Plan: admin-sql-helpers-dedupe

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The journal helper** — `src/lib/admin/journal.ts`: factor the column list and the cast
   values of `journalInsertIf` into one private builder (the `insert into ${adminJournal} (…)
   select <values>` part); add the CTE-aware helper (a `with` SQL, the source name, an entry
   whose fields may be `SQL` read off the source row) returning the unawaited
   `db.execute<{ id: string }>` of `with … insert … select … from <source> returning id`;
   `journalInsertIf` rebuilt on the same builder — done when: `journalInsertIf`'s emitted SQL
   is unchanged for the suspension and deletion batches, and the column list appears once.
2. **The four sites** — `reactivateAccount` (`accounts.ts`, CTE `lifted`, subject id
   `lifted.id`), `markReportHandled` (`lists.ts`, CTEs `handled` + `subject`, subject
   `subject.id` / `subject.name`, detail `to_char(subject.night_date, 'YYYY-MM-DD')`), `decide`
   (`review.ts`, CTE `decided`, subject `decided.user_id`, detail the reason), the refund in
   `refundPayment` (`payments.ts`, CTE `done`, the family's id and name, the catalogue detail)
   — each keeps its CTE text, its guard and its return value; drop the `adminJournal` import
   from `review.ts` if it becomes unused — done when: the grep in the first acceptance
   criterion matches only `journal.ts`.
3. **The garde clock** — `accounts.ts`: remove `localNow`, `gardeAhead`, `onEitherSide`;
   `upcomingGardes` and the deletion guard use `bookingCondition("en-cours", userId)`, the
   profile's count `bookingCondition(null, userId)`; give accounts a non-optional `SQL`
   (overload on `bookingCondition` or a tiny `accountBookings(filter, id): SQL` beside it in
   `lists.ts`); drop the `NIGHT_HOURS` / `TIME_ZONE` import from `accounts.ts` if unused —
   done when: the fifth acceptance criterion's grep is empty.
4. **The source test** — `src/lib/admin/journal-isolation.test.ts` after
   `src/lib/disponibilites/isolation.test.ts`: walk `src/`, skip `*.test.ts(x)`, fail on
   `/insert\s+into\s+(admin_journal|\$\{adminJournal\})/i` outside `lib/admin/journal.ts`;
   include a "has files to check" floor — done when: it passes, and failed once with a
   deliberate stray insert before that was removed (noted in `notes.md`).

## Risks

- A value's cast changing type (e.g. `subject.name` already `text`, the refund's uncast name)
  — Postgres would refuse at runtime, not at build; the UAT smoke of all four acts is the
  signal, so do it on the preview before the Ready-to-merge tick.
- `sql.raw` for the CTE source name would open an injection seam — the source name must be a
  fixed identifier (`sql.identifier` or a literal in the helper's call), never user input.
- The deletion guard's `not exists` sits inside a `where` on `users`: `bookingCondition` names
  `bookings` and `care_requests` unaliased, exactly as `gardeAhead` did — keep the subquery's
  `from bookings join care_requests` so the column references resolve.
- `payments.ts` importing `@/lib/admin/journal` beyond its `type Person`: no cycle today
  (journal.ts imports only `@/db` and `./rules`) — keep it that way.
