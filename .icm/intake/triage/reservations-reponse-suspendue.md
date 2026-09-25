# Stub: A suspended professional's waiting answer comes back on a moved night

- lane: bug
- found-by: candidature-et-reservation release review · 2026-09-25
- complexity: standard

## Problem

The edit lock, the answer count and the answers list count only waiting answers from validated
professionals (D-85). A professional whose profile leaves `valide` while her answer waits stops
locking the request: the family edits the night, and if the professional is validated again her
old `en_attente` answer reappears on the new night, at her old rate, and can be accepted.

## Proposed change

When a profile leaves `valide` (the founders' review, `src/lib/admin/review.ts`, and a
professional's own change that sends her file back to review), set her `en_attente` answers to
`retiree` in the same write, so no hidden answer outlives her validation.

## Prompt

In the berceo repo, read `.icm/intake/triage/reservations-reponse-suspendue.md`. Wherever a
professional profile moves out of `valide` (`src/lib/admin/review.ts`, `src/lib/professionnelle/`
reopening), withdraw her waiting answers (`care_request_applications.status = 'retiree'`) in the
same batch, with a test. Run it through `/pipeline bug reservations-reponse-suspendue`.
