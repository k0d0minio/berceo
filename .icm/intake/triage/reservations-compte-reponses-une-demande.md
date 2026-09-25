# Stub: The edit page counts every request's answers to read one

- lane: chore
- found-by: candidature-et-reservation release review · 2026-09-25
- complexity: low

## Problem

`/espace/famille/demandes/[id]/modifier` and `updateRequestAction` call `pendingCounts(userId)`,
which joins and groups over the family's whole request history, to read one request's count.

## Proposed change

A `waitingAnswerCount(userId, requestId)` in `src/lib/reservations/answers.ts` for the single
request, used by the edit page and the action.

## Prompt

In the berceo repo, read `.icm/intake/triage/reservations-compte-reponses-une-demande.md`. Add a
single-request waiting-answer count and use it in the edit page and `updateRequestAction`. Run it
through `/pipeline chore reservations-compte-reponses-une-demande`.
