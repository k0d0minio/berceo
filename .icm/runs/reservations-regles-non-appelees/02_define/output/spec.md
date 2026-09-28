# Spec: The reservation rules are tested where the app decides them

- slug: reservations-regles-non-appelees
- personas: professionnel, parent
- touches: src/lib/reservations/rules.ts, src/lib/reservations/rules.test.ts, src/lib/reservations/answers.ts, src/lib/reservations/bookings.ts, src/lib/reservations/*.test.ts, src/lib/demandes/requests.ts, src/lib/demandes/*.test.ts, src/app/(portail)/espace/professionnelle/demandes/page.tsx, README.md
- complexity: standard

## Problem

Five helpers in `src/lib/reservations/rules.ts` are exported and unit-tested but never called in
production: `isOnHerList`, `canWithdraw`, `acceptTransition`, `declinedOnClose` and
`canSendInPriority`. The decisions they describe are taken by SQL in
`src/lib/demandes/requests.ts`, `src/lib/reservations/answers.ts` and `bookings.ts`, so their
tests can pass while the SQL disagrees. Found by the candidature-et-reservation release review
(2026-09-25). This is the second stub of the `reservations-revue-candidature` batch, which cleans
up the answer and booking code before the sibling stub
`reservations-compte-reponses-une-demande` touches `answers.ts`.

## Proposed change

Each helper is either called where the app decides the same thing, or deleted. When one is
deleted, its rule is tested on the SQL that decides it. These choices were settled with the
operator in Define on 2026-09-28.

**`canWithdraw`: wired.** On `/espace/professionnelle/demandes`, the list page decides whether a
card shows « Retirer ma disponibilité » with `canWithdraw(request.answer, request, now)`. Today it
checks `answer === "en_attente"`. `professionalRequests` adds the request's `status` to what it
selects, and `ProfessionalRequest` carries it. The signature narrows to the fields the rule reads
(`status`, `nightDate`, `startTime`) so a caller doesn't need `priorityProfileId`. Its unit tests
stay. `withdrawAnswer`'s SQL guard is unchanged, and so is the action's `erreur=retrait` message.

**`isOnHerList`, `acceptTransition`, `declinedOnClose`, `canSendInPriority`: deleted, with their
unit tests.** No page or action decides what these helpers describe. The SQL statement is the only
decision:

- `isOnHerList` restates the WHERE of `professionalRequests`: open, night ahead, in a commune she
  serves or sent to her in priority, not declined (`non_retenue`), and no confirmed booking of
  hers that night.
- `canSendInPriority` restates the WHERE of `priorityCandidates` and `setPriority`: her request,
  open, night ahead, `priority_sent_at` null, and `reachableBy` (not declined, no confirmed
  booking that night). The SQL keys on `priority_sent_at`, which `setPriority` writes together
  with `priority_profile_id`. The « Lui envoyer ma demande en priorité » link stays unconditional
  because that page also offers a new request.
- `declinedOnClose` restates the answer UPDATE in `cancelRequest` and in `republishRequest`: that
  request's `en_attente` answers become `non_retenue`, and nothing else changes.
- `acceptTransition` restates statements 4 and 5 of the `acceptAnswer` batch. Statement 4 sets the
  request's other `en_attente` answers to `non_retenue`, never the chosen one. Statement 5 sets
  her `en_attente` answers on other requests the same night to `retiree`.

**The SQL gets statement tests.** Each of those statements is extracted into a named builder
beside its function, as `cancelBookedRequestStatement` and `bonneGardeStatement` already are. The
functions keep their behaviour, their batches and their order. New `*.test.ts` files build each
statement without running it (`.toSQL()`, or the dialect's query for a raw `sql` template), in
the style of `src/lib/reservations/reopening.test.ts`. They assert the conditions listed above,
which carry over the cases the deleted unit tests covered. No database is needed.

**What stays.** `answerRefusal`, `acceptRefusal`, `canRepublish`, `hasAddress` and `isPriorityFor`
are already called (or used by a called helper) and stay as they are. The module comment in
`rules.ts` and the `isOnHerList` sentence in `requests.ts`'s comment are updated to name where
each rule now lives. The README's answer-and-booking section notes that the list, priority and
decline rules are held by statement tests on the SQL.

## Acceptance criteria

- [ ] `isOnHerList`, `acceptTransition`, `declinedOnClose` and `canSendInPriority` no longer exist in `src/lib/reservations/rules.ts`, and no test or comment names them. The types used only by them (`AnswerRow`, `AcceptTransition`) are gone too.
- [ ] `canWithdraw` has a production caller: on `/espace/professionnelle/demandes`, « Retirer ma disponibilité » shows exactly when `canWithdraw(answer, request, now)` is true. The card for a waiting answer on an open request whose night is ahead shows it, as it does today.
- [ ] `professionalRequests` returns each request's `status`. The list's contents and order are unchanged.
- [ ] A statement test holds the professional's list to its rule. The request is `ouverte` with the night ahead, in her communes or `priority_profile_id` = her, her answer is absent or not `non_retenue`, and she has no `confirmee` booking that night.
- [ ] A statement test holds the priority candidates (and `setPriority`) to their rule. The request is hers, `ouverte`, night ahead, `priority_sent_at` null, she was not declined on it, and she has no `confirmee` booking that night.
- [ ] Statement tests hold the cancel and republish declines to their rule. The UPDATE sets `non_retenue` on that request's `en_attente` answers and names no other status.
- [ ] Statement tests hold `acceptAnswer`'s statements 4 and 5 to their rule. 4 sets `non_retenue` on the request's `en_attente` answers other than the chosen one. 5 sets `retiree` on her `en_attente` answers on other requests of the same night.
- [ ] Every extracted builder is the statement its function runs. `cancelRequest`, `republishRequest`, `acceptAnswer`, `priorityCandidates`, `setPriority` and `professionalRequests` behave as before, with the same batches in the same order.
- [ ] `vitest` passes in CI, and the Vercel deployment check is green.

## Out of scope

- An integration test that runs this SQL against a Neon branch. The repo has no per-run database in CI, and the operator chose statement tests.
- Any change to what the SQL decides. This run makes it testable and changes no rule.
- The helpers that are already called (`answerRefusal`, `acceptRefusal`, `canRepublish`, `hasAddress`, `isPriorityFor`).
- The double booking on one night (`reservations-deux-gardes-meme-nuit`) and the single-request answer count (`reservations-compte-reponses-une-demande`), the batch's other two stubs.
- Showing or hiding the « en priorité » link on the family's view of a professional's profile.

## Open questions

- none

Context budget: read `src/lib/reservations/rules.ts`, parts of `answers.ts`, `bookings.ts`, `src/lib/demandes/requests.ts`, the professional's list page, the priority page and the family's view of a professional's profile, and `reopening.test.ts` for the statement-test style. The knowledge map was not loaded: the stub and the code were enough for a refactor that changes no rule.
