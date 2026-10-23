# Breakdown: Findings from the candidature-et-reservation release review

## What was understood

Three findings from the candidature-et-reservation release review (2026-09-25) all sit in
`src/lib/reservations/`: a family can hold two gardes for the same night because the
one-open-per-night index only covers `status = 'ouverte'` and drops out once a request is
booked; the reservation rules the SQL restates (`isOnHerList`, `canWithdraw`,
`acceptTransition`, `declinedOnClose`, `canSendInPriority`) are unit-tested but production
never calls them, so the tests can pass while the SQL disagrees; and the edit page counts
every one of a family's requests to read one request's answer count. Grouped because they
share a review pass and, for the last two, the same files (`src/lib/reservations/answers.ts`
and its call sites) — sequencing them avoids two independent diffs landing on the same lines.
The double-booking bug has its own migration and no code dependency on the other two; it ships
first as the more urgent find.

## Build order

1. **reservations-deux-gardes-meme-nuit** (bug, P1) — widen
   `care_requests_one_open_per_night` to `status IN ('ouverte', 'attribuee')` in its own
   migration, return the existing « doublon » error on a booked night. No dependency on the
   other two.
2. **reservations-regles-non-appelees** (chore, P2) — wire each uncalled helper in
   `reservations/rules.ts` into the page or action that restates it (or remove it), touching
   `answers.ts` and `bookings.ts`.
3. **reservations-compte-reponses-une-demande** (chore, P2) — depends on 2. Add
   `waitingAnswerCount(userId, requestId)` to `answers.ts` and use it in the edit page and
   `updateRequestAction`, against the shape 2 already settled in that file.

No code dependency between 1 and the other two; 2 and 3 share `answers.ts`, so 3 is sequenced
after 2 only to avoid two independent edits to the same file.
