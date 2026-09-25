# Breakdown: Finition de l'accueil — contrast and oversized text blocks

- scope-slug: finition-accueil · story: runs/finition-accueil/01_scope/\_source/story.md
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- personas: parent, professionnel, admin

## What I understood

The homepage's content and structure are right. Two things make it look unfinished. First, no text colour in the DA's palette is legible enough: body text is taupe on white at 1.98:1, and every pair fails WCAG AA. Second, several text blocks are too big for the box they sit in. The 88-character H1 runs 6 to 8 lines and overflows under the photo on tablets. Card and step titles wrap unevenly. The block on the stripes centres 4 to 7 lines. The desktop nav links wrap. The fix is colour and layout only, with no word changed. Contrast is solved once on the tokens for the whole platform. The layout is solved in the shared vitrine blocks, so the other public pages benefit too.

## Where it sits

The vitrine's homepage (`/`) and the shared blocks it is built from: the public header and footer, the hero and page header, the step list, the reason cards, the sections, the striped band. The design tokens in `src/app/globals.css` and the four button rows reach the sign-in pages and the three signed-in spaces (parent, professionnel, admin). Journeys: the first visit of a family and of a professional, before either signs up.

## Build order

1. encres-contraste — two ink tones and the dark-surface fix on the tokens and the shared components, platform-wide, held by a contrast test — depends-on: none
2. premier-ecran — the first screen: the header nav on one line, the hero H1 within its column at every width, the photo aligned to the text — depends-on: encres-contraste
3. blocs-accueil — the four bands below the fold: aligned steps, reason cards that fit their titles, Gardiennes at a readable length, the stripes' block without long centred text — depends-on: premier-ecran

## Parallelizable

None: a plain chain. Every stub touches the shared vitrine components that encres-contraste recolours. premier-ecran and blocs-accueil both edit `src/app/(public)/page.tsx`.

## Out of scope (whole scope)

- Any word: copy, metadata, alt texts, the choice of photographs.
- The five DA colours as values. They stay as surfaces, borders and accents.
- Comodo's uppercase-only rule, which waits for Surya's font files.
- Redesigning the signed-in spaces. They get the new tokens and a regression check.
- New sections, components or motion, and a dark theme.
- The placeholder pages' own layout.
- Moving the image-bank PNGs out of git (a triage chore).
