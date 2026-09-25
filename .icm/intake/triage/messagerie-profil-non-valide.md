# Stub: A professional no longer validated can still write in her conversations

- lane: bug
- found-by: messagerie release review (security pass) · 2026-09-25
- complexity: standard

## Problem

`partyOf` and `sendMessage` in `src/lib/messagerie/conversations.ts` check that the viewer is the
conversation's professional, not that her profile is still `valide`. A professional whose file
leaves `valide` (sent back for a complement, refused) keeps reading and writing in the
conversations of the requests she answered earlier, until each night ends (D-89). She reaches only
the family's first name and the night, but the founders' refusal should end her contact with
families. Whether a suspended professional keeps read access to the history is a product call.

## Proposed change

Hold `professional_profiles.status = 'valide'` in the professional side of `partyOf` for sending
(the SQL of `sendMessage`), and decide with the operator whether reading stays open; the closed
line on her side when it does not. Pairs with `reservations-reponse-suspendue` (her waiting answers
withdrawn when she leaves `valide`).

## Prompt

In the berceo repo, read `.icm/intake/triage/messagerie-profil-non-valide.md`. In
`src/lib/messagerie/conversations.ts`, refuse a professional's send (and, if the operator says so,
her reads) when her profile is not `valide`, held in the SQL of the write, with a test of the rule.
Run it through `/pipeline bug messagerie-profil-non-valide`.
