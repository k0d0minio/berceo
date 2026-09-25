# Tasks: cycle-de-garde-et-annulation

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] With the clock set before the start hour, at the start hour, at start + 11 h and after, a confirmed garde shows « À venir », « En cours », « Terminée » on both sides' lists and pages, with no job run and nobody clicking; an annulée one shows « Annulée » at any hour.
- [ ] Either side can cancel a garde from its page until the start hour through the red confirmation dialog; from the start hour the button is absent and a direct request is refused.
- [ ] A professional's cancellation marks the booking and its request annulées, records `professionnelle`, the user and the moment, calls `refundFee` with `annulation_professionnelle`, and the family's page then shows « Frais de service remboursés » (or « Remboursement en cours » while Stripe has not confirmed).
- [ ] A family's cancellation records `famille`, the user and the moment, refunds nothing, and her page says the fee is kept.
- [ ] Each cancellation sends exactly one e-mail to the other side, in the catalogue's words; a double click or both sides at once cancel once and send one e-mail.
- [ ] After a cancellation, the request's conversations refuse messages and stay readable; the professional's page no longer shows the address, nor does it after the night ends.
- [ ] From the start hour until 24 h after the night ends, either side can report the other absent; the garde becomes annulée with the absent side recorded as `cancelled_by`, kind `absence`, the absent side gets one e-mail, no refund is made, and the absence appears on `/admin/absences` with the fee's status; a non-admin gets the not-found page there.
- [ ] On an annulée garde whose night has not started, « Republier ma demande » publishes a new open request with the same night and details, carried by the urgent e-mail or the digest like any new one; with an open request already that night, the link to it shows instead.
- [ ] A cancelled garde frees the professional's night: she can be booked on another request for the same night.
- [ ] The reminder route, called between 10:00 and 10:59 Brussels with the secret, sends one e-mail to each side of every confirmed garde whose night is tomorrow, once; a second call sends none; outside the window or without the secret it sends nothing.
- [ ] Both confirmation e-mails and both reminders carry the platform line, with no insurance wording.
- [ ] Bookings made before the migration read as `confirmee` and show the state their night gives.
- [ ] Every new visible word is in `src/content/`, quoted or marked `@relecture`, and `gardes.test.ts` passes the catalogue's mechanical rules.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
