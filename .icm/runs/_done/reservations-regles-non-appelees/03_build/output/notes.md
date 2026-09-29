# Build notes: reservations-regles-non-appelees

- commits: feat: reservations-regles-non-appelees — the SQL-only rules become tested builders; canWithdraw wired
- ci: GREEN on 146b736 (full gate: Vercel preview pass, Quality (advisory) pass); the draft head 108c75d was GREEN with Quality (advisory) pass too

## What changed

- `src/lib/reservations/rules.ts`: `isOnHerList`, `acceptTransition` (and `AcceptTransition`,
  `AnswerRow`), `declinedOnClose` and `canSendInPriority` deleted (D-167). `canWithdraw`'s request
  parameter narrowed to `status`, `nightDate`, `startTime`. The module comment now names where the
  SQL-only rules live.
- `src/lib/reservations/rules.test.ts`: the four helpers' tests removed. One `canWithdraw` case
  added: a night already started refuses withdrawal.
- `src/lib/demandes/requests.ts`: `herListQuery` (the list query, now also selecting `status`),
  `priorityCandidatesQuery`, `setPriorityStatement` and `cancelDeclinesAnswers` extracted,
  verbatim, and called from their functions. `ProfessionalRequest` gains `status`.
- `src/lib/reservations/answers.ts`: `republishDeclinesAnswers` extracted from `republishRequest`'s
  batch, same position.
- `src/lib/reservations/bookings.ts`: `acceptDeclinesOthers` (statement 4) and
  `acceptWithdrawsHersThatNight` (statement 5, raw `sql`) extracted from `acceptAnswer`'s batch,
  same positions. The `booked` exists-clause became `bookingMade(requestId)`, shared by statement
  3 and statement 4.
- `src/app/(portail)/espace/professionnelle/demandes/page.tsx`: « Retirer ma disponibilité »
  renders on `canWithdraw(request.answer, request, now)` (D-168). The « répondu » note and the
  conversation link still follow `answer === "en_attente"`.
- `src/lib/demandes/statements.test.ts`, `src/lib/reservations/statements.test.ts`: built, never
  run (`.toSQL()`, `PgDialect.sqlToQuery` for the raw statement). Each asserts the condition and
  the value bound to it, and that no other status is named.
- `README.md`: one line in the answer-and-booking section.

## Acceptance criteria status

- [x] The four helpers and their two types are gone. `grep -rn "isOnHerList\|acceptTransition\|declinedOnClose\|canSendInPriority\|AcceptTransition\|AnswerRow" src` is empty.
- [x] `canWithdraw` has a production caller: the list page decides the withdraw button with it. A waiting answer on an open request ahead still shows the button.
- [x] `professionalRequests` returns `status`. The WHERE and ORDER BY are the same text as before (see the diff), so contents and order are unchanged.
- [x] Her list's statement test: `ouverte`, night ahead, her communes or priority to her, her answer absent or not `non_retenue`, no `confirmee` booking of hers that night, the order.
- [x] Priority candidates and `setPriority`'s statement tests share one assertion: hers, `ouverte`, night ahead, `priority_sent_at` null, not declined, no `confirmee` booking that night. `setPriority` also holds a validated, unsuspended professional.
- [x] Cancel and republish declines: `non_retenue` on that request's `en_attente` answers, guarded by `annulee` / `republished_at = now`, and no other status named.
- [x] `acceptAnswer` statements 4 and 5: 4 excludes the chosen answer, only `en_attente`, only once a booking exists. 5 sets `retiree` on her `en_attente` answers on other requests of the booked night.
- [x] Each builder is the code it replaced, moved (the diff shows the lines moving unchanged), and it sits at the same index of the same `db.batch`.
- [x] `vitest` passes in CI and the Vercel deployment is green: Quality (advisory) and Vercel both pass on 146b736.

## Notes for Release

- Neither `format.sh` nor `lint.sh` is wired in this repo (both `SKIP`), and the local test run is
  blocked, so the tests were never run here. Every asserted fragment was taken from a throwaway
  probe (`scripts/.probe-statements.mts`, deleted before the commit) that printed each builder's SQL
  and params with `tsx`. The advisory quality job then ran them on 108c75d and 146b736: pass.
- `canSendInPriority` also required `priority_profile_id` to be null. The SQL keys on
  `priority_sent_at` alone, which is right: the deleted unit test shows the professional's id is
  cleared while `priority_sent_at` stays when she leaves. The new test holds the SQL's rule.
- At the start-of-night minute, the list (Postgres `now()`) and the button (JS clock, Brussels)
  can disagree for one render. `withdrawAnswer`'s own guard still decides. Not unified here.
- Decision ids renumbered at Build (D-153/D-154 → D-156/D-157) and again at Release
  (→ D-167/D-168), after #58 and #59 merged D-156 to D-158 to `main` first (FAILURE.md).

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on 9f412ad before the record (ci-status.sh, full gate); re-read after the last push
- reviews: code medium (`/code-review` on origin/main...HEAD: no findings; each builder is its inline code moved, same batch positions, the four deleted helpers had no non-test caller, `status` on her list exposes nothing about the family) · security `security-check.sh --branch --audit`: OK (gitleaks absent, built-in patterns only) + `/security-review` (the diff moves `acceptAnswer`'s statements, the payment path): no findings, every builder keeps its ownership and status guards, none is reachable from a server action or route · readiness `env.sh audit --changed`: OK (one WARN: the token cannot read GitHub secrets, no key added by this branch) · /production-readiness n/a: no such skill ships in this repo or this session, and the diff changes no schema, env or auth
- parked: `triage/template-change-decision-id-race.md` (new: parallel runs race for `D-n`); new evidence added to `triage/template-change-router-skill-prompts.md` (the router sent `/security-review`'s body to Scope again)
- migrations: skip — none of this run's own (`check-migrations.sh` SKIP after merging main)
- learned: skip — no error.log (FAILURE.md's two rules reach the rules at close-out)
- docs: README answer-and-booking line (Build, D-167); no page under `.icm/docs` changes · announce: deferred to promotion
- decisions: renumbered D-156/D-157 → D-167/D-168 after merging main (#58 and #59 merged D-156–D-158 first; open branches reach D-166)
