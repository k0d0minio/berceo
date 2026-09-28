# Spec: A professional no longer validated can no longer write in her conversations

- slug: messagerie-profil-non-valide
- personas: professionnel, parent
- touches: src/lib/messagerie/rules.ts, src/lib/messagerie/rules.test.ts, src/lib/messagerie/conversations.ts, src/components/messagerie/conversation-list.tsx, src/components/messagerie/conversation-view.tsx, README.md
- complexity: standard

## Problem

A conversation is made with each answer and accepts messages until the request's night ends,
whatever the answer's state (D-89). `partyOf` and `sendMessage` in
`src/lib/messagerie/conversations.ts` check that the viewer is the conversation's professional, not
that her profile is still `valide`. A professional whose file leaves `valide` (she reopens it,
D-146, and it may then go back for a complément or be refused) keeps writing to the families of
the requests she answered, and they to her, until each night ends. She reaches only the family's
first name and the night, but a professional Berceo no longer vouches for should no longer be in
contact with families about nights she is not booked for. Found by the messagerie release review
(security pass, 2026-09-25); it is the second stub of the « what follows a professional leaving
`valide` » epic, after `reservations-reponse-suspendue` withdrew her waiting answers on the same
trigger.

## Proposed change

**The rule (D-153).** A conversation accepts messages when, as today, its request is not cancelled
and its night has not ended (D-89), **and** its professional's profile is `valide` **or** its
answer is the booked one (`retenue`). The confirmed booking is untouched by this epic, so its
conversation keeps its channel until the night ends; every other conversation of a professional
who is not `valide` (`brouillon`, `en_attente`, `complement_demande`, `refuse`) is closed.

**Closed for both, still readable (D-154).** The closing is the existing one: on both sides the
conversation shows « Fermée » in « Messages » and the thread shows the closed line and no composer
(`conversation.fermee`), exactly as a cancelled request or an ended night does. Both parties can
still read it; her « Messages », her unread count and her « Voir la conversation » links are
unchanged. A send already typed is refused with the existing `envoi.fermee` message. No new words.

**Held in the write, read from the current status (D-155).** The pure rule in
`src/lib/messagerie/rules.ts` gains the two facts (the profile's status, whether the answer is
`retenue`) and stays the one definition the list, the thread and `sendMessage`'s pre-check call.
`sendMessage`'s SQL holds the same condition again in its `target` CTE (join the professional's
profile and the conversation's answer: `p.status = 'valide' or a.status = 'retenue'`), so a
profile that leaves `valide` between the read and the write still stops the message, which then
reads as `fermee`. Nothing is stored: if she is validated again before the night ends, the
conversation accepts messages again by itself.

**E-mail.** Since neither side can send in a closed conversation, no new-message e-mail leaves
for it. Berceo's own messages (made inside the answer's and the booking's statements) are not
people's messages and are not affected.

## Acceptance criteria

- [ ] A professional whose profile is not `valide` cannot send a message in a conversation whose answer is not `retenue`: the composer is absent and a forged send is refused as `fermee`, with no message inserted and no e-mail sent.
- [ ] The family cannot send in that same conversation either: the composer is absent and a forged send is refused as `fermee`.
- [ ] Both parties still open and read that conversation; it shows « Fermée » in both « Messages » lists and the existing closed line in the thread.
- [ ] The conversation of her `retenue` answer (her confirmed booking) accepts messages from both sides until its night ends, whatever her profile's status.
- [ ] A professional whose profile is `valide` sees no change: her conversations follow D-89 as before.
- [ ] Once she is `valide` again, a conversation whose request is not cancelled and whose night has not ended accepts messages again, with nothing stored or reset.
- [ ] A profile that leaves `valide` between `sendMessage`'s read and its write inserts nothing (the condition is held in the SQL of the write).
- [ ] `rules.test.ts` covers the rule's truth table: profile `valide` or not × answer `retenue` or not, alongside the existing cancelled and night-ended cases.

## Out of scope

- What becomes of her confirmed booking when she is no longer `valide` (the garde itself, its cancellation, the family's notice): bookings are untouched by this epic.
- Hiding conversations from her, or from the family: both keep reading them (D-154).
- A distinct closed line or reason for this case: the existing « fermée » words are used.
- Suspended accounts: a suspended professional cannot sign in (D-134) and suspension already withdraws her answers; the family writing to a suspended professional is not changed here.
- Any e-mail to the family explaining the closing.

## Open questions

- none

Context budget: read `src/lib/messagerie/conversations.ts`, `rules.ts`, `actions.ts`, the two messagerie components, `src/lib/auth/guard.ts` and `reopenFile` in `src/app/(portail)/espace/professionnelle/actions.ts` to establish where the rule is read and held; the cahier des charges lives outside this repo (icm-board) and was not read.
