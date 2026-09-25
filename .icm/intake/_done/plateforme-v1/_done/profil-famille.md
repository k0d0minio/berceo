# Stub: The family's profile

- feature-slug: profil-famille
- scope: plateforme-v1
- personas: parent
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: comptes-neon-auth
- sequence: 6 of 15
- complexity: low
- recommended-model: sonnet

## Problem

A family account has a name and an e-mail. A request needs her commune and a professional needs a phone number after confirmation; neither exists yet.

## Proposed change

The family's space shows and edits her details: prénom, nom, e-mail, téléphone, commune, and the exact address that is only ever shown to a professional after a confirmed booking. A short optional context line about the family (no health data, no child names required). The space also lists her requests and past gardes as the later stubs fill them.

## Acceptance criteria (rough)

- [ ] A family completes her commune and address once and edits them later.
- [ ] The address is never returned in any response a professional or a visitor receives.
- [ ] The space is reachable from the header and works on a phone.

## Out of scope (this feature)

- Family verification, favourites as a separate feature (the priority request in stub 8 covers re-contact).

## Notes for Define

- D-15 (address hidden until confirmation), D-20 (no health data), D-27.
- If the fields fit on `users`, no migration; else one small table. Decide from the schema of stub 2.
- touches: src/app/(portail)/famille/profil/**, src/content/famille.ts, (maybe) src/db/schema.ts, drizzle/**
