# Spec: berceo · apply Surya's web DA to the platform (colours, fonts, logo, photos, no badges)

- ticket: JAM-300
- touches: src/app/globals.css, src/app/fonts.ts, src/app/contrast.test.ts, src/components/ui/, src/components/berceo-logo.tsx, src/components/shell/, src/components/vitrine/, src/app/(public)/, src/app/(public)/design-system/, src/app/(auth)/layout.tsx, src/app/(portail)/, src/components/admin/, src/lib/email/templates.ts, public/photos/, src/content/photos.ts, package.json, .icm/intake/README.md, CLAUDE.md
- complexity: complex

## Problem

Chloé Sanfilipo (Agence Surya) sent the DA points in her recap mail of 12 Nov. The site must be identical to the brand book `Direction artistique web.pdf` and the validated mock-ups. Today it is not: the buttons use the dark green ink `--encre-sauge #3c584b`, the text uses two added inks, Fraunces stands in for Comodo in mixed case, the logo is not placed as in the mock-ups, the photos are small, the icons are thin lines, and the vitrine shows numbered badges 1, 2, 3.

## Proposed change

Every page of the vitrine, the sign-in pages, the two portals, the back-office and the e-mails uses only the charter palette: white #FFFFFF, sage #8BAF9F, taupe #BAB9AD, pearl #E0DED8, butter #FEF5B5 and the white and taupe stripes. Red #ED5957 and green #B6D3C6 appear only for confirm, cancel and refuse, and for a field that blocks a form (Q6). The two inks `--encre-sauge` and `--encre-taupe` are removed. Text on white is taupe or sage (Q3).

Buttons are capsules with a 1 px border, a minimum height of 48 px and Nunito SemiBold 16 px. Each button takes its colours from the background it sits on (white, stripes, sage, taupe), as the table of the ticket says. On hover a button grows to `scale(1.03)` in 200 ms ease-out and takes the hover colours of that table. Butter is the hover state and the accent.

H1, H2, the navigation and short taglines use the display font in capitals at the DA sizes: H1 56–64 px desktop and 38–44 px mobile, H2 40–48 px and 30–36 px, navigation 17–19 px and 18–20 px. The display font stays Fraunces until the Comodo files arrive (Q1). All other text is Nunito 400, 600 and 700, with a minimum body size of 16 px.

The full logotype is on the home page, the sign-in and sign-up pages, the footer and the e-mails. The logomark is in the headers of the inner pages, the portals, the mobile navigation and the favicon. The two never share one zone. Each keeps a clear zone equal to the top circle of the symbol.

The photos are large, as in the mock-ups (Q5). Text on a photo sits in a pearl block at 70–80 % opacity with white text. A form on a colour sits in a pearl container at 70–80 % with white fields. Text over the stripes sits in a plain block, taupe by preference, and two striped sections never follow each other. Icons are filled and rounded (Q4) at the DA sizes. The numbered badges 1, 2, 3 of the step list are removed.

`/design-system` shows the new tokens, the four button variants with their hover, the type scale and the icons, so Surya can check them. A decision note records that the client's palette replaces finition-accueil D-1, D-24 and `src/app/contrast.test.ts` until after launch.

## Acceptance criteria

- [ ] No colour outside the charter palette appears in `src/app/globals.css`, except red #ED5957 and green #B6D3C6. The tokens `--encre-sauge` and `--encre-taupe` no longer exist. (verify: CI)
- [ ] No button on any page has a dark green fill, border or text. (verify: operator)
- [ ] On a white, a striped, a sage and a taupe background, a button shows the default and hover colours of the ticket's table, with a capsule shape, a 1 px border, a height of 48 px or more and no shadow. (verify: operator)
- [ ] On hover a button grows to `scale(1.03)` in 200 ms with no vertical move. (verify: operator)
- [ ] H1, H2 and the navigation show in capitals in the display font at the DA sizes on desktop and on mobile. All other text is Nunito, with no body text below 16 px. (verify: operator)
- [ ] The full logotype shows on the home page, the sign-in and sign-up pages, the footer and the e-mails. The logomark shows in the inner-page headers, the portals, the mobile navigation and the favicon. No zone shows both. (verify: operator)
- [ ] The home page and the vitrine pages show large photos, and text on a photo sits in a pearl block at 70–80 % opacity with white text. (verify: operator)
- [ ] No page shows a numbered 1, 2, 3 badge. (verify: agent)
- [ ] Every icon on the site is filled and rounded. No thin line icon remains. (verify: agent)
- [ ] No two striped sections follow each other, and text over the stripes sits in a plain block. (verify: agent)
- [ ] The admin refuse button and the confirmation dialogs use red #ED5957 and green #B6D3C6. (verify: operator)
- [ ] `/design-system` shows the palette, the four button variants with their hover, the type scale and the icons. (verify: operator)
- [ ] `src/app/contrast.test.ts` is skipped with a comment that names JAM-300 and the decision note, and the `ci` run is green. (verify: CI)
- [ ] `.icm/intake/README.md` has a decision note: the client's palette replaces finition-accueil D-1, D-24 and the contrast test until after launch (Jamie, 2026-11-18), and the admin refuse button is red #ED5957. (verify: agent)

## Out of scope

- The licensed Comodo font files. JAM-308 supplies them. Fraunces stays until then (Q1).
- Accessibility and contrast work. The client reviews it after launch.
- The family's "yellow/green clicks" question of the round-2 PDF. It is open with the client.
- New photographs from the Drive image bank beyond the 4 in `public/photos/`, unless Q5 says otherwise.
- Any change to the words of the site, the routes or the data model.
- Any DA change that Surya has not approved in writing.
- A dark theme.

## Open questions

- The mock-ups are not in the repo. The operator checks the logo placement, the photo size and the transparency blocks against them on the Vercel preview.
- This ticket overrides three rules of the repo: finition-accueil D-1 (the two inks held to AA), D-24 (red and green only in confirmation dialogs, with #bc312f) and `src/app/contrast.test.ts`. The `CLAUDE.md` Rules line on the platform's colours changes with the decision note.
