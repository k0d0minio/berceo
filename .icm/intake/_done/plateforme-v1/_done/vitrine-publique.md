# Stub: The public site, replacing the holding page

- feature-slug: vitrine-publique
- scope: plateforme-v1
- personas: parent, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: socle-design-system, comptes-neon-auth
- sequence: 3 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

A visitor who hears the name finds one dark screen saying the site is being built. The public site must explain the service, reassure in the first third of the page, and send families and professionals to two different doors.

## Proposed change

The pages of Surya's URL map, with the guide's copy per block: accueil (H1 visible without scrolling, one reassurance element in the first third, two distinct calls to action), qui-sommes-nous (the founders' story in the first person, "une communauté en ligne", a soft closing call to action), comment-ca-marche (three steps per journey, a "Ce que garantit Berceo" block without the insurance line), faq, tarifs (the 100 to 300 € range, the 3 % fee, payment direct to the professional, no subscription), conditions-generales and confidentialite as placeholders until the founders deliver the texts. Title and meta per page from the guide, a sitemap, robots allowing indexing, alt texts, internal links as the guide lists. The photographs come from the DA's image bank once the founders have filtered them. This stub removes the holding page and its "Site en construction" line.

## Acceptance criteria (rough)

- [ ] `/`, `/qui-sommes-nous`, `/comment-ca-marche`, `/faq`, `/tarifs`, `/conditions-generales`, `/confidentialite` render with the guide's copy and the DA's look, on a phone and a desktop.
- [ ] Each page has a unique title and meta description; the H1 of the home page is above the fold on mobile.
- [ ] The two calls to action lead to the family sign-up and the professional sign-up.
- [ ] No page mentions a price other than the range and the fee, no insurance by Berceo, no Facebook group, no exclamation mark.
- [ ] The OG card is updated; the holding page no longer exists.

## Out of scope (this feature)

- The per-commune and per-professional public pages (stub 15).
- A blog, a testimonials page, a partners page.
- Writing the legal texts.

## Notes for Define

- D-3 (no subscriptions on the Tarifs page), D-8 (no "assurance Berceo" anywhere), D-9, D-19, D-23 (no Facebook group, first person), D-25 (which CTA wording where).
- Open: the students wording; the founders' first-person story text (a kick-off action item for Alix and Jordane); the selected photographs.
- AGENTS.md's dark rule and README's design notes are rewritten at this stub's Release.
- touches: src/app/(vitrine)/**, src/app/page.tsx, src/app/sitemap.ts, src/app/robots.ts, src/content/vitrine.ts, public/og.png, public/photos/**, README.md, AGENTS.md
