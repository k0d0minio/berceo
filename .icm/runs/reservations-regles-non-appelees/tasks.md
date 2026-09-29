# Tasks: reservations-regles-non-appelees

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] `isOnHerList`, `acceptTransition`, `declinedOnClose` and `canSendInPriority` no longer exist in `src/lib/reservations/rules.ts`, and no test or comment names them. The types used only by them (`AnswerRow`, `AcceptTransition`) are gone too.
- [x] `canWithdraw` has a production caller: on `/espace/professionnelle/demandes`, « Retirer ma disponibilité » shows exactly when `canWithdraw(answer, request, now)` is true. The card for a waiting answer on an open request whose night is ahead shows it, as it does today.
- [x] `professionalRequests` returns each request's `status`. The list's contents and order are unchanged.
- [x] A statement test holds the professional's list to its rule. The request is `ouverte` with the night ahead, in her communes or `priority_profile_id` = her, her answer is absent or not `non_retenue`, and she has no `confirmee` booking that night.
- [x] A statement test holds the priority candidates (and `setPriority`) to their rule. The request is hers, `ouverte`, night ahead, `priority_sent_at` null, she was not declined on it, and she has no `confirmee` booking that night.
- [x] Statement tests hold the cancel and republish declines to their rule. The UPDATE sets `non_retenue` on that request's `en_attente` answers and names no other status.
- [x] Statement tests hold `acceptAnswer`'s statements 4 and 5 to their rule. 4 sets `non_retenue` on the request's `en_attente` answers other than the chosen one. 5 sets `retiree` on her `en_attente` answers on other requests of the same night.
- [x] Every extracted builder is the statement its function runs. `cancelRequest`, `republishRequest`, `acceptAnswer`, `priorityCandidates`, `setPriority` and `professionalRequests` behave as before, with the same batches in the same order.
- [x] `vitest` passes in CI, and the Vercel deployment check is green.

## Queue

- [x] Extract the statements into named builders: `herListQuery`, `priorityCandidatesQuery`, `setPriorityStatement`, `cancelDeclinesAnswers` (`src/lib/demandes/requests.ts`); `republishDeclinesAnswers` (`answers.ts`); `acceptDeclinesOthers`, `acceptWithdrawsHersThatNight` (`bookings.ts`)
- [x] Statement tests: `src/lib/demandes/statements.test.ts`, `src/lib/reservations/statements.test.ts`
- [x] Wire `canWithdraw` on `/espace/professionnelle/demandes`; `professionalRequests` selects `status`
- [x] Delete `isOnHerList`, `acceptTransition`, `AcceptTransition`, `AnswerRow`, `declinedOnClose`, `canSendInPriority` and their unit tests; rewrite the module comments
- [x] README: the answer-and-booking section names the statement tests
- [x] Renumber this run's decisions D-153/D-154 → D-156/D-157 at Build (three sibling Defines took D-153–D-155 the same minute), then → D-167/D-168 at Release (#58 and #59 merged D-156–D-158 first)
- [x] Flip ready, push, settle the full verdict (GREEN on 146b736)
