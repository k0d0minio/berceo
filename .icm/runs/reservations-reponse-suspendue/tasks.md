# Tasks: reservations-reponse-suspendue

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] A validated professional with one or more `en_attente` answers who confirms « Modifier ma profession ou mes justificatifs » ends with her profile in `brouillon` and every one of those answers `retiree`, written together (no state where one changed and not the other).
- [ ] Her `retenue`, `non_retenue` and already `retiree` answers, and her confirmed bookings, are unchanged by the reopening.
- [ ] Reopening a file that is not `valide`, or a second reopen after the first, withdraws nothing it had not already withdrawn and changes no other professional's answers.
- [ ] On a request she had answered, the family's answers list, pending-answer count and edit lock no longer count her after the reopening; the family can edit the night.
- [ ] After she is validated again, her old answer does not reappear on the request; answering again creates a waiting answer at her current rate.
- [ ] The reopen dialog tells her, before she confirms, that her waiting availabilities will be withdrawn; the sentence is marked `@relecture` and `vitrine.test.ts` passes.
- [ ] The data migration sets `retiree` on every `en_attente` answer of a non-`valide` profile and leaves every other row as it was; running it twice changes nothing more.
- [ ] A test covers the withdrawal on reopening (the helper's conditions: her answers only, `en_attente` only, only when the status moved).

## Queue

- [ ] <task — small enough for one commit; name the file or area>
