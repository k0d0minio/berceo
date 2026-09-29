# Plan: reservations-regles-non-appelees

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Extract the statements** — `src/lib/demandes/requests.ts`, `src/lib/reservations/answers.ts`,
   `src/lib/reservations/bookings.ts`. The approach: lift each statement into an exported builder
   beside its function, taking what the statement needs (`userId`, `requestId`, `profileId`,
   `applicationId`, `now`/`at`). The pattern is `cancelBookedRequestStatement` and
   `bonneGardeStatement`. The functions then call the builders, with the same batches in the same
   order:
   - the professional's list query → `herListQuery(profile.id)` (select + joins + where + order,
     not awaited)
   - `priorityCandidates` → `priorityCandidatesQuery(userId, profileId)`. `reachableBy` stays
     shared with `setPriority`, which can be built through a `setPriorityStatement(…)`.
   - `cancelRequest`'s answer UPDATE → `cancelDeclinesAnswers(userId, id, now)`
   - `republishRequest`'s answer UPDATE → `republishDeclinesAnswers(userId, requestId, now)`
   - `acceptAnswer`'s statement 4 → `acceptDeclinesOthers(requestId, applicationId, now)`, and
     statement 5 (raw `sql`) → `acceptWithdrawsHersThatNight(requestId, at)`

   Done when: no function's behaviour changed (a diff reviewer can match each builder line for line
   against the removed inline code).
2. **Statement tests** — new `src/lib/demandes/requests-statements.test.ts` and
   `src/lib/reservations/bookings-statements.test.ts` (or one per module; name to taste), in the
   `reopening.test.ts` style: set a dummy `DATABASE_URL`, dynamically import, `.toSQL()` (for a
   raw `sql` template use `new PgDialect().sqlToQuery(...)`), and assert the conditions each
   acceptance criterion lists, including the statuses that must *not* appear in `params`. Done
   when: vitest passes in CI.
3. **Wire `canWithdraw`** — `rules.ts`: narrow its request parameter to
   `Pick<RequestFacts, "status" | "nightDate" | "startTime">`. `requests.ts`: `professionalRequests`
   selects `status: careRequests.status`, and `ProfessionalRequest` gains `status: RequestStatus`.
   `espace/professionnelle/demandes/page.tsx`: `const now = new Date()` once. The withdraw form
   renders when `canWithdraw(request.answer, request, now)`. The « répondu » note and the
   conversation link stay on `answer === "en_attente"`. Done when: the page imports and calls
   `canWithdraw`.
4. **Delete the four helpers** — `rules.ts`: remove `isOnHerList`, `acceptTransition`,
   `AcceptTransition`, `AnswerRow`, `declinedOnClose` and `canSendInPriority`. `rules.test.ts`:
   remove their `describe` blocks and imports. Rewrite the module comment to say which rules are
   pure and called, and which live only in SQL, held by the statement tests. Drop the
   `isOnHerList` sentence in `professionalRequests`' comment. Done when:
   `grep -rn "isOnHerList\|acceptTransition\|declinedOnClose\|canSendInPriority" src` is empty.
5. **README** — the answer-and-booking section gets one line saying the professional's list, the
   priority candidates and the declines on cancel, republish and accept are held by statement
   tests on the SQL. Done when: the line is there.

## Risks

- Extracting a statement from inside `db.batch([...])` must keep it a builder (not awaited) and in
  the same array position; `acceptAnswer` destructures results by position. Signal: a type error on
  the destructuring, or a moved index.
- `toSQL()` on a select that embeds subqueries (`inArray(..., db.select(...))`, `notExists`) renders
  them inline with numbered params. Assert on quoted column names and `params`, not on exact
  placeholder numbers, or the tests break on harmless reorderings.
- `nightAhead` uses `now()` in Postgres, and `canWithdraw` uses JS `now` in Brussels time. At the
  exact start minute the list (SQL) and the button (JS) can disagree for one render. That is the
  existing SQL-vs-rule edge and the action's SQL guard still decides. Don't try to unify the clocks
  here.
