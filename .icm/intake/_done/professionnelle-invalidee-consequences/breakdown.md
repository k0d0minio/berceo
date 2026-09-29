# Breakdown: What follows a professional leaving `valide`

## What was understood

Two release reviews (candidature-et-reservation and messagerie, both 2026-09-25) found the
same gap from two sides: nothing reacts when a professional's profile leaves `valide` (sent
back for a complement, refused). Her waiting answers keep locking requests and can reappear
on a moved night at her old rate (reservations); she keeps reading and writing in the
conversations of requests she already answered (messagerie). The messagerie stub names the
reservations one explicitly as a pair. Grouped so the operator's call on read-access (raised
in messagerie-profil-non-valide) and the withdrawal write (in reservations-reponse-suspendue)
land as one consistent product decision instead of two independent ones.

## Build order

1. **reservations-reponse-suspendue** (bug, P1) — withdraw her waiting answers
   (`care_request_applications.status = 'retiree'`) in the same write that moves her profile
   out of `valide` (`src/lib/admin/review.ts`, `src/lib/professionnelle/` reopening).
2. **messagerie-profil-non-valide** (bug, P1) — refuse her sends (and, per the operator's
   call on whether reading stays open) in the conversations of requests she already
   answered, once her profile is no longer `valide`.

No code dependency between the two; sequenced together only so the same "profile leaves
`valide`" trigger is handled once, consistently, rather than redecided per stub.
