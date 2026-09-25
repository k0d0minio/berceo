# Tasks: messagerie

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] Answering a request creates exactly one conversation for that answer, with Berceo's `amorce` message; re-answering after a withdrawal reuses it and adds no second `amorce`.
- [ ] No conversation exists without an answer: no page or action lets a family or a professional start one, and a signed-in user who is not one of its two parties gets the not-found page for its URL and cannot send to it.
- [ ] Confirming a booking posts Berceo's `bonne_garde` message in the booked answer's conversation only; both Berceo messages read as the catalogue entries quoted in §2, with no `!`.
- [ ] Each space's header navigation shows « Messages » with the count of conversations holding an unread message, on the menu button too below md, hidden at zero; opening the conversation clears it on the next page load.
- [ ] A sender sees « Lu » under her last message once the other party has opened the conversation after it, and not before.
- [ ] Each message one party sends produces exactly one e-mail to the other, carrying no message text and linking to the conversation; a double-clicked or retried send inserts one message and sends one e-mail; refreshing sends none; Berceo's messages send none.
- [ ] An empty or over-2 000-character message is refused with a plain message; a message renders as plain text with its line breaks.
- [ ] In a conversation whose answer is not booked, the reminder line appears after the 3rd, 6th, … people's message; it never appears in the booked conversation.
- [ ] After the night ends (start + 11 h, Europe/Brussels), or once the request is cancelled, the conversation shows the closed line instead of the field, the server refuses a send, and both sides still read the full history; before that it accepts messages whatever the answer's state.
- [ ] Answers and bookings made before the migration each have a conversation with the matching Berceo messages.
- [ ] Every new visible word is in `src/content/`, quoted or marked `@relecture`, and `messagerie.test.ts` passes the catalogue's mechanical rules.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
