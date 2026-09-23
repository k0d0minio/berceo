# Stub: Answer a request, choose a professional, confirm the booking

- feature-slug: candidature-et-reservation
- scope: plateforme-v1
- personas: parent, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: demande-de-garde
- sequence: 8 of 15
- complexity: high
- recommended-model: opus

## Problem

A request has no answers and a family has nobody to choose. This is the core of the marketplace: the moment two people agree on a night.

## Proposed change

On a request card a professional presses "Je suis disponible pour cette garde" and reads the guide's confirmation; the family receives "[Prénom] a répondu à votre demande". The family sees "Les professionnelles qui ont répondu à votre demande" with prénom, profession, note and "Voir le profil complet", and presses "Accepter et réserver" on one; the request closes to the others, the booking exists, both receive their confirmation e-mail, and the professional now sees the family's address and phone. Responses are not capped. From a professional's full profile a family can "Lui envoyer ma demande en priorité": the request is created or chosen, sent to her first, and stays visible to the others until confirmed. A family finds the professionals she already booked in her space and can send them a request in priority. A request with no suitable answer can be republished. Until stub 9 lands, confirmation has no payment step; stub 9 inserts it.

## Acceptance criteria (rough)

- [ ] Two professionals answer; the family accepts one; the other is told the request is closed; the booking shows date, hour, duration, prénom, profession and the night rate.
- [ ] The professional sees the address only after confirmation, never before.
- [ ] A priority request reaches the chosen professional first and is still visible to the others.
- [ ] A family can re-contact a professional from a past booking.
- [ ] The migration adds applications and bookings.

## Out of scope (this feature)

- The fee (stub 9), messaging (stub 10), cancellation after confirmation (stub 11).

## Notes for Define

- D-10, D-15, D-19 (the guide, "La mise en relation" and "La réservation", minus the insurance line per D-8).
- The booking summary shows the night rate and says the family pays the professional directly; nothing about how.
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/famille/demandes/**, src/app/(portail)/famille/reservations/**, src/app/(portail)/professionnelle/demandes/**, src/app/(portail)/professionnelle/gardes/**, src/content/reservations.ts, src/content/emails.ts
