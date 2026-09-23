# Stub: Publish a request for a night

- feature-slug: demande-de-garde
- scope: plateforme-v1
- personas: parent, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: onboarding-professionnelle, profil-famille
- sequence: 7 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

Nothing connects a family who needs a night to the professionals who serve her commune. The request is the object everything else hangs on.

## Proposed change

"Publier une demande de garde de nuit" with the guide's fields: date de la garde, heure de début (a standard night is 11 hours), nombre d'enfants (un bébé, jumeaux), âge du bébé, votre commune (pre-filled from the profile, with the note that the exact address comes after confirmation), the mandatory checkbox about no medical condition, and "Publier une demande urgente" for tonight or tomorrow. A family can edit or cancel a request while it is open. A validated professional sees the open requests in the communes she serves, newest and urgent first, each as the DA's request card, and receives an e-mail when a new request lands in her communes (immediately for an urgent one). Statuses: ouverte, annulée, and attribuée once stub 8 exists.

## Acceptance criteria (rough)

- [ ] A family publishes a request in under two minutes on a phone; the checkbox is required.
- [ ] A professional serving that commune sees it; one serving another commune does not.
- [ ] An urgent request is marked and its e-mail leaves at once.
- [ ] An open request can be edited and cancelled; a cancelled one disappears from professionals' lists.
- [ ] The migration adds the request table.

## Out of scope (this feature)

- Answering a request (stub 8), recurring or multi-night series.

## Notes for Define

- D-10, D-15, D-20 (exact field list, no free-text medical field).
- Open: whether a date in the past or more than N weeks ahead is refused; propose 1 day to 8 weeks.
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/famille/demandes/**, src/app/(portail)/professionnelle/demandes/**, src/content/demandes.ts, src/content/emails.ts
