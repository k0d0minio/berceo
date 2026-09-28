# Tasks: messagerie-profil-non-valide

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] A professional whose profile is not `valide` cannot send a message in a conversation whose answer is not `retenue`: the composer is absent and a forged send is refused as `fermee`, with no message inserted and no e-mail sent.
- [ ] The family cannot send in that same conversation either: the composer is absent and a forged send is refused as `fermee`.
- [ ] Both parties still open and read that conversation; it shows « Fermée » in both « Messages » lists and the existing closed line in the thread.
- [ ] The conversation of her `retenue` answer (her confirmed booking) accepts messages from both sides until its night ends, whatever her profile's status.
- [ ] A professional whose profile is `valide` sees no change: her conversations follow D-89 as before.
- [ ] Once she is `valide` again, a conversation whose request is not cancelled and whose night has not ended accepts messages again, with nothing stored or reset.
- [ ] A profile that leaves `valide` between `sendMessage`'s read and its write inserts nothing (the condition is held in the SQL of the write).
- [ ] `rules.test.ts` covers the rule's truth table: profile `valide` or not × answer `retenue` or not, alongside the existing cancelled and night-ended cases.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
