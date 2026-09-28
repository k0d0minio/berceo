# Stub: An answer sent while she reopens her file can stay waiting

- lane: bug
- found-by: reservations-reponse-suspendue release review · 2026-09-28
- complexity: medium
- priority: P3

## Problem

`reopenFile` withdraws her waiting answers in the same `db.batch` as the move out of `valide`
(D-146). `answerRequest`'s INSERT checks `p.status = 'valide'` in its own statement, without
locking the profile row. Under READ COMMITTED, an answer she sends from another tab at the same
instant can read `valide` before the reopen commits and commit after the batch's withdrawal ran:
it stays `en_attente` on a profile that is no longer `valide`, the exact state the fix removes.
The window is milliseconds, needs two tabs, and the answer stays hidden from families until she
is validated again (D-85), when it could reappear at her old rate.

## Proposed change

Lock the profile row the INSERT reads (`FOR SHARE OF p` in the `insert … select`, or an
equivalent), so the answer either waits for the reopen and re-checks `valide` (no insert), or the
reopen waits for the answer and its withdrawal sees it. Prove both orders on a run's Neon branch
with two concurrent connections before shipping.

## Prompt

In the berceo repo, read `.icm/intake/triage/reservations-reponse-pendant-reouverture.md`. In
`src/lib/reservations/answers.ts` (`answerRequest`), make the INSERT hold the profile row it checks
for `valide` so it serialises with `reopenFile`'s batch (`reopeningWithdrawsAnswers`). Prove both
interleavings on a Neon branch. Run it through `/pipeline bug reservations-reponse-pendant-reouverture`.
