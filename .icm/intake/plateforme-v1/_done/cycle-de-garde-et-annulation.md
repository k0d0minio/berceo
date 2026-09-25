# Stub: The life of a garde and its cancellation

- feature-slug: cycle-de-garde-et-annulation
- scope: plateforme-v1
- personas: parent, professionnel, admin
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: frais-de-service, messagerie
- sequence: 11 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

A confirmed booking never changes state, and nobody can cancel one. The fee rule and the closing of the conversation both depend on knowing where a garde is in its life.

## Proposed change

A garde moves by time: à venir after confirmation, en cours from the start hour, terminée after the standard 11 hours (or a start time plus duration), with the conversation closing then. Either side can cancel a confirmed garde from its space with a confirmation dialog; the cancellation records who cancelled and when, tells the other side by e-mail, applies the fee rule (refund when the professional cancels, kept when the family cancels), and reopens the request for the family if she wishes. A reminder e-mail the day before. The "rappel cadre plateforme" at key steps is a one-line reminder in the confirmation and reminder e-mails.

## Acceptance criteria (rough)

- [ ] A garde's state is right at each hour of its life without anyone clicking.
- [ ] A professional's cancellation refunds the fee and the family sees "remboursé"; a family's cancellation does not refund.
- [ ] Both cancellations e-mail the other side with the guide's tone and record the initiator.
- [ ] The conversation closes when the garde is terminée.

## Out of scope (this feature)

- Disputes, no-show penalties, ratings (stub 12).

## Notes for Define

- D-2, D-16, D-17.
- Open: until when a family may cancel, and what a no-show on either side records; propose "cancellation possible until the start hour, a no-show is a cancellation by the absent side recorded by the other, reviewed by the founders".
- touches: src/db/schema.ts, drizzle/**, src/lib/gardes/**, src/app/(portail)/famille/reservations/**, src/app/(portail)/professionnelle/gardes/**, src/content/gardes.ts, src/content/emails.ts, vercel.json (a cron for state changes and reminders)
