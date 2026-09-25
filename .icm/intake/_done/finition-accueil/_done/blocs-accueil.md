# Stub: The homepage's bands — blocks that fit their boxes

- feature-slug: blocs-accueil
- scope: finition-accueil
- personas: parent, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: premier-ecran
- sequence: 3 of 3
- complexity: medium
- recommended-model: sonnet

## Problem

Below the fold, the text blocks fight their containers. In "Comment ça marche", one step title wraps and the other two do not, so the three paragraphs start at different heights. In "Pourquoi Berceo ?", 28 px bold titles in 283 px cards wrap in four cards out of five, the gap between title and text is wide, and the fifth card leaves an empty slot. In "Qui sont les Gardiennes de la nuit ?", two paragraphs at intro size make 9 lines beside the photo on desktop and 12 on a phone. On the stripes, the professionals' paragraph is centred over 4 lines on desktop and 7 on a phone, and the DA allows three.

## Proposed change

Keep every word and every band, and fit each block to its box by the DA's reading rules: lines of 60–75 characters, nothing centred over three lines, H3 sized to the column it sits in. Align the three steps. Give the reason cards titles that fit, a tighter title-to-text rhythm and a grid with no empty slot. Bring the Gardiennes text to a readable length beside its photo. Lay the stripes' block out so its paragraph is not a long centred column. The fixes go into the shared components (step list, reason grid, section, striped band), so the other vitrine pages that use them benefit.

## Acceptance criteria (rough)

- [ ] The three steps' paragraphs start on the same line at 1024 px and up.
- [ ] No reason-card title wraps at 1440 px, or all wrap alike. The five cards leave no visible empty slot at any width.
- [ ] No homepage paragraph runs over 75 characters a line.
- [ ] No text centred over three lines anywhere on the homepage, at any width.
- [ ] At 1440 px the Gardiennes text column is no taller than about 1.3 times its photo.
- [ ] The stripes' H2 takes at most 2 lines at 390 px.
- [ ] `/comment-ca-marche`, `/tarifs` and `/faq` render the shared blocks without regression at 390 and 1440 px.

## Out of scope (this feature)

- Any word (D-5), including adding a sixth reason card.
- Colours (encres-contraste), the header and the hero (premier-ecran).

## Notes for Define

- D-4: the shared components. D-5: no word changes.
- Open: the five reason cards. Three plus two centred, two columns, or a layout with no empty slot.
- Open: the Gardiennes paragraphs at body size, or only the first at intro size.
- The stripes' block: the DA's rule is « Éviter de centrer les textes de plus de trois lignes ». Left-align the paragraph, or narrow the block so it keeps to three lines at desktop. It cannot shorten the text.
- touches: src/app/(public)/page.tsx (the four bands), src/components/vitrine/step-list.tsx, src/components/vitrine/reason-grid.tsx, src/components/vitrine/section.tsx, src/components/ui/striped-section.tsx, src/components/ui/card.tsx.
