# Stub: A conversation per answered request

- feature-slug: messagerie
- scope: plateforme-v1
- personas: parent, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: candidature-et-reservation
- sequence: 10 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

Once a professional has answered, the two need to talk about the baby's rhythm, the arrival time and the access to the home, and they have nowhere to do it but outside Berceo.

## Proposed change

A conversation opens between a family and a professional when she answers a request. Berceo posts the opening message from the cahier des charges ("L'équipe Berceo vous souhaite une excellente garde…") and the guide's suggestion of what to discuss. Messages show a read state; an unread count sits in the header; a new message sends an e-mail. The conversation closes when the garde ends (or the request is cancelled) and stays readable by both. Refresh to see new messages is acceptable; no live updates.

## Acceptance criteria (rough)

- [ ] A conversation exists only for a request the professional answered; strangers cannot message.
- [ ] The opening message is Berceo's, verbatim from the cahier des charges.
- [ ] Read and unread states are correct across the two sides; the e-mail leaves once per new message, not per refresh.
- [ ] After the garde ends, sending is disabled and history is readable.

## Out of scope (this feature)

- Live updates, attachments, phone-number detection or blocking.

## Notes for Define

- D-16, D-19 (the guide, "La messagerie", minus the insurance banner per D-8).
- The banner every third message becomes a discreet reminder that the booking is confirmed on Berceo, without the insurance claim, or is dropped; Surya decides the wording.
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/messages/**, src/lib/messages/**, src/content/messagerie.ts, src/content/emails.ts
