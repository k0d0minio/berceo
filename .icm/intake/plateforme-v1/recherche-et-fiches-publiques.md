# Stub: Search by commune, and the public teaser pages

- feature-slug: recherche-et-fiches-publiques
- scope: plateforme-v1
- personas: parent, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: onboarding-professionnelle, avis-etoiles, disponibilites-indicatives
- sequence: 15 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

A family can only wait for answers; she cannot look. And nobody who searches a professional's name or "garde de nuit Ixelles" finds Berceo.

## Proposed change

Signed in, a family searches "Votre commune ou code postal" and gets the validated professionals serving it as the DA's profile cards (prénom, profession, "Profil vérifié par Berceo", zone, note and gardes count, prochaines disponibilités), with the guide's message and a link to publish a request when the list is empty. Each card opens the full profile with "Lui envoyer ma demande en priorité". Public and indexable: `/professionnelles/[prenom]` showing first name, profession, zone, note, gardes count and "Quelques mots sur moi", no surname, no phone, no address, with the call to action to create an account; and one page per commune served, listing its professionals' teaser cards, with the guide's title and meta patterns. Both are in the sitemap.

## Acceptance criteria (rough)

- [ ] A search for a commune or a postcode returns the professionals who declared it, and only validated ones.
- [ ] The public professional page contains no surname, phone, address or e-mail in its HTML or its data.
- [ ] A commune page exists for every commune at least one professional serves and is in the sitemap.
- [ ] A signed-out visitor opening a full profile is sent to sign up and returns to it after.

## Out of scope (this feature)

- A map, radius search, sorting by price or note, filters beyond the zone.

## Notes for Define

- D-11, D-14, D-3 (a free account, not a plan, opens the full profile).
- Open: what a commune page shows with no professional yet (propose: no page); the launch communes if the founders want to narrow.
- Public pages must not expose the professional's slug as her full name; propose prénom plus a short id.
- touches: src/app/(portail)/famille/recherche/**, src/app/(vitrine)/professionnelles/**, src/app/(vitrine)/garde-de-nuit/**, src/app/sitemap.ts, src/lib/search/**, src/content/recherche.ts
