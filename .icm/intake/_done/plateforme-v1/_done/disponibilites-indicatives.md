# Stub: The professional's indicative availability

- feature-slug: disponibilites-indicatives
- scope: plateforme-v1
- personas: professionnel, parent
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: onboarding-professionnelle
- sequence: 13 of 15
- complexity: low
- recommended-model: sonnet

## Problem

A family reads a profile and cannot tell whether that professional is likely to be free next week; a professional has no way to say so without a message.

## Proposed change

"Mes disponibilités": a professional marks nights available or unavailable on a simple calendar, with the guide's note that nothing is contractual and she stays free to refuse. On her profile, families see "Prochaines disponibilités" with the guide's caveat. Availability filters nothing and blocks nothing.

## Acceptance criteria (rough)

- [ ] A professional marks and unmarks nights on a phone in seconds.
- [ ] The profile shows the next marked nights with the caveat; an unmarked professional still receives requests.

## Out of scope (this feature)

- Any binding booking from the calendar, recurring patterns.

## Notes for Define

- D-12, D-19 (the guide, "Les disponibilités").
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/professionnelle/disponibilites/**, src/components/profil/disponibilites.tsx, src/content/disponibilites.ts
