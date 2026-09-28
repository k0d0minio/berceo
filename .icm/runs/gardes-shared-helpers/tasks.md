# Tasks: gardes-shared-helpers

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `grep -rn "function hasNightEnded\|function otherSide\|function ratedSide\|function authorised\|function isCronRequest\|function gardeNotice" src --include=*.ts --include=*.tsx` finds exactly three definitions: `hasNightEnded` and `otherSide` in `src/lib/demandes/rules.ts`, and `isCronRequest` in `src/lib/cron.ts`.
- [ ] `grep -rn "gardeNotice\|GardeNotice\|ratedSide\|timingSafeEqual" src` finds `timingSafeEqual` only in `src/lib/cron.ts` and none of the others anywhere.
- [ ] `src/components/avis/ratings-table.tsx` has no `=== "famille" ? "professionnelle"` ternary. The side it shows comes from `otherSide`.
- [ ] Every existing case for `hasNightEnded`, `otherSide`/`ratedSide` and `isCronRequest` still runs with the same assertions, from its helper's new home. `npm test` passes on the branch, as do the unchanged `messagerie`, `gardes`, `avis`, `reservations`, `demandes` and `admin` suites.
- [ ] Each of the four cron routes answers a call without `Authorization`, or with a wrong bearer, exactly as before: 401 JSON for the digest, the reminder and the invitations, 404 for the purge.
- [ ] On the UAT preview, for a confirmed garde: the conversation, the garde's state and the address visibility change together when the night ends. Before the end: messages accepted, « En cours », address shown. After: conversation closed, « Terminée », address hidden. Also check that a cancellation by either side still sends its e-mails with the right wording (who cancelled, the fee line) and that a booking confirmation still reaches both sides.
- [ ] After the merge, the next scheduled runs of `demandes-digest`, `gardes-rappel` and `avis-invitations` (GitHub Actions) return 200 on UAT, which confirms `CRON_SECRET` meets the 16-character floor there.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
