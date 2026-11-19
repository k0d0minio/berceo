# Handoff jam-307

## Cause

The professional's request list and request page give her own profile rates (`nightRateEur`, `extraHourRateEur` from `professionalRequests` and `professionalRequest`) to `RequestCard`, which prints them as the DA's price line « … € pour la garde de nuit » on a family's request.

## Decision

Q1, answered by the operator: keep her rates on the request, under a label the founders approve. No label text came with the answer. The label « Votre tarif, indiqué à la famille si vous répondez » is a draft, marked `@relecture` in `src/content/reservations.ts`, for the founders to approve on UAT.

## Change

- `RequestCard` takes `rateLabel` and shows it above her rates.
- The request list and the request page of the professional pass the label. The cards of her gardes show the rate alone, as before.
- Test: `src/components/demandes/request-card.test.ts`.

## Next action

The operator tests the preview and ticks Ready to merge. The founders approve the label text or give another one.

## How to test

Sign in as a validated professional on the preview and open « Demandes ». Above « 150 € pour la garde de nuit », each card and the request page say « Votre tarif, indiqué à la famille si vous répondez ».

## Blockers

- none

## Do not touch

- The data model. The family's views of an answer and of a profile, which show the professional's rate to the family on purpose.
