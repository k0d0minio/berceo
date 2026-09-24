# Stub: The design system and the app shell, from Surya's art direction

- feature-slug: socle-design-system
- scope: plateforme-v1
- personas: parent, professionnel, admin
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: none
- sequence: 1 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

The repo has a dark one-screen holding page and untouched shadcn components. The product needs the light system Surya specified before any screen can be built, and a place for every word to live.

## Proposed change

Turn the web art direction into the repo's foundation: the palette as Tailwind tokens (white base, sage `#8BAF9F`, taupe `#bab9ad`, pearl `#e0ded8`, butter yellow `#FEF5B5`, the white and taupe striped pattern as CSS, the confirmation red `#ED5957` and green `#B6D3C6`), Comodo for titles and Nunito for text with the DA's size hierarchy, capsule buttons (min 48 px, 1 px border, no shadow, hover scale 1.03 in 200 ms), 32 px cards, the 70 to 80 % pearl transparency block, and the shadcn components retuned to it. A light root layout with the public header and footer, and the shell of the signed-in portal (logomark in the header, mobile navigation). The content catalogue: `src/content/` split per surface, French only, shaped so a second language can be added. A confirmation dialog component that is the only place the red and green appear. A real `/api/health` that answers 200 and is the health endpoint in `.icm/project.json`. The holding page keeps rendering at `/` until the vitrine stub replaces it; it moves onto the new layout without changing its look.

## Acceptance criteria (rough)

- [ ] A storybook-like page under a non-indexed route shows buttons per background, cards, the striped section, the confirmation dialog and the type scale, matching the DA.
- [ ] Every colour and font is a token; no hex value in a component.
- [ ] The holding page still renders at `/` and still reads as before.
- [ ] `/api/health` returns 200 and `health_endpoint` in `.icm/project.json` points at it.
- [ ] `src/content/` holds the site's words and the catalogue's shape is documented in README.md.
- [ ] Lint, typecheck and the Vercel build are green.

## Out of scope (this feature)

- Any product screen. No auth, no data.
- The vitrine pages (stub 3).

## Notes for Define

- D-9 (light platform per the DA), D-19 (the content catalogue and Surya's writing rules), D-24 (confirmation colours only in dialogs), D-25 (CTA rule, to be encoded as two catalogue entries).
- Open: the Comodo font files and licence come from Surya's Drive; until then use Fraunces as the display fallback and keep the swap to one file.
- Open: the wording covering students without "diplômées" (Surya is revising the guide); leave the catalogue entry marked for review.
- The DA's "Ce que l'on veut éviter" list (gendered pink and blue, naïve illustrations, shadows, gadget animations) is a code rule for this and every later stub.
- AGENTS.md's "committed to dark" rule is amended at the Release of the vitrine, not here.
- touches: src/app/globals.css, src/app/layout.tsx, src/components/ui/**, src/components/shell/**, src/content/**, src/app/api/health/route.ts, package.json, package-lock.json, .icm/project.json, README.md
