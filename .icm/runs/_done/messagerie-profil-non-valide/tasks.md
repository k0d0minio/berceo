# Tasks: messagerie-profil-non-valide

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] A professional whose profile is not `valide` cannot send a message in a conversation whose answer is not `retenue`: the composer is absent and a forged send is refused as `fermee`, with no message inserted and no e-mail sent.
- [x] The family cannot send in that same conversation either: the composer is absent and a forged send is refused as `fermee`.
- [x] Both parties still open and read that conversation; it shows « Fermée » in both « Messages » lists and the existing closed line in the thread.
- [x] The conversation of her `retenue` answer (her confirmed booking) accepts messages from both sides until its night ends, whatever her profile's status.
- [x] A professional whose profile is `valide` sees no change: her conversations follow D-89 as before.
- [x] Once she is `valide` again, a conversation whose request is not cancelled and whose night has not ended accepts messages again, with nothing stored or reset.
- [x] A profile that leaves `valide` between `sendMessage`'s read and its write inserts nothing (the condition is held in the SQL of the write).
- [x] `rules.test.ts` covers the rule's truth table: profile `valide` or not × answer `retenue` or not, alongside the existing cancelled and night-ended cases.

## Queue

- [x] Renumber this run's decisions D-153–D-155 → D-156–D-158 (sibling branches took the first three) — spec, decisions, plan, project, handoff
- [x] `src/lib/messagerie/rules.ts`: `isConversationOpen` takes `profileStatus` and `booked` (required) — D-156, D-158
- [x] `src/lib/messagerie/rules.test.ts`: the truth table, written from the criteria
- [x] `src/lib/messagerie/conversations.ts`: the list, the thread and `sendMessage`'s read feed the rule; `sendMessage`'s `target` CTE holds `pp.status = 'valide' or a.status = 'retenue'`
- [x] `README.md`: the conversation's closing line
- [x] Pre-flip verdict (GREEN on 8041344), merge `main` (up to date), flip ready
