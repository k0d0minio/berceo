# Stub: Star ratings after the garde

- feature-slug: avis-etoiles
- scope: plateforme-v1
- personas: parent, professionnel, admin
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: cycle-de-garde-et-annulation
- sequence: 12 of 15
- complexity: low
- recommended-model: sonnet

## Problem

Nothing tells the next family whether a professional was good, and nothing tells the founders which accounts to watch.

## Proposed change

When a garde is terminée, both sides receive the guide's e-mail and rate the other with stars on three or four criteria, no free text. The professional's profile shows her aggregate note and the number of gardes done through Berceo; the family's note is visible to professionals who answer her requests, and to the founders. The founders read all ratings.

## Acceptance criteria (rough)

- [ ] Each side can rate once per garde, only after it ended.
- [ ] The profile's note and gardes count update on the first rating.
- [ ] No free-text field exists anywhere in the flow.

## Out of scope (this feature)

- Written reviews, public testimonials, internal admin notes.

## Notes for Define

- D-18.
- Open: the three or four criteria and their labels; when a rating becomes visible (immediately, or once both have rated); propose visible immediately, criteria "ponctualité, communication, soin, confiance" for the family side.
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/avis/**, src/lib/ratings/**, src/content/avis.ts, src/content/emails.ts
