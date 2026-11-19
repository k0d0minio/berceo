# Handoff jam-307

## Cause

The professional's request list and request page give her own profile rates (`nightRateEur`, `extraHourRateEur` from `professionalRequests` and `professionalRequest`) to `RequestCard`, which prints them as the DA's price line « … € pour la garde de nuit » on a family's request.

## Next action

Wait for the answer to Q1 in the pull request body. Then run `questions.sh JAM-307`. On the default answer: stop passing `rate` and `extraHourRate` from `src/app/(portail)/espace/professionnelle/demandes/page.tsx` and `[id]/page.tsx`, and add the test in the same commit. Do not change the cards of `espace/professionnelle/gardes/` (a booked night) or the model (JAM-302, JAM-303).

## How to test

<1 to 3 short sentences that can be said aloud: where to go on the preview, what to do, what the operator must see.>

## Blockers

- Q1 waits for the operator's answer on the HUD or in the pull request #131.

## Do not touch

- The data model. The family's views of an answer and of a profile, which show the professional's rate to the family on purpose.
