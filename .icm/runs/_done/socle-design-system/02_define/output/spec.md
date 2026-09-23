# Spec: The design system and the app shell, from Surya's art direction

- slug: socle-design-system
- personas: parent, professionnel, admin
- touches: src/app/globals.css, src/app/layout.tsx, src/app/fonts.ts, src/app/page.tsx, src/app/(holding)/**, src/app/(public)/**, src/app/api/health/route.ts, src/components/ui/**, src/components/shell/**, src/components/berceo-logo.tsx, src/content/**, package.json, package-lock.json, .icm/project.json, README.md, AGENTS.md
- complexity: standard

## Problem

The repo has a dark one-screen holding page, a single copy file (`src/content/site.ts`) and shadcn
components tuned to the night palette. Every one of the fourteen stubs after this one builds
screens on Surya's light web art direction (D-9) and writes its words into a content catalogue
(D-19); neither exists. Without a shared foundation each stub would re-invent colours, buttons and
copy placement, and the platform would drift from the DA the founders validated. This advances
Plateforme Berceo V1 — a first usable version on uat.berceo.be before December 2026 — by giving
every later screen its tokens, components, layouts and word store.

## Proposed change

**Tokens (D-9).** `src/app/globals.css` declares the DA as Tailwind v4 theme tokens, and is the
only file that holds a colour value:

- Palette: white `#FFFFFF` (base), sage `#8BAF9F` (identity), taupe `#bab9ad` (support,
  editorial surface), pearl `#e0ded8` (discreet background), butter yellow `#FEF5B5` (accent,
  hover). Confirmation colours red `#ED5957` and green `#B6D3C6` (D-24) are tokens too.
- The DA's colours are applied **literally**, as the DA writes them, including text and button
  colours (operator decision in Define; see Out of scope for the contrast note).
- The striped pattern: a white/taupe stripe utility with one fixed stripe width and spacing,
  defined once, continuous, never stretched.
- The transparency block: pearl at 70–80 % opacity applied to the block's background only; its
  text, icons and buttons stay at 100 %.
- Radii: 32 px for cards and panels, capsule (999 px) for buttons, search fields and filters.
- No `box-shadow` anywhere in the system.
- The shadcn variable contract (`--background`, `--primary`, `--card`, `--border`, `--ring`, …)
  is remapped to the light DA so every retained `src/components/ui/` component reads it.

**Type (D-9).** Comodo for titles and navigation, Nunito for everything else. The Comodo files
and licence are not in the repo yet, so the display face is **Fraunces** (already loaded) behind a
single `--font-display` binding set in one file, `src/app/fonts.ts`; swapping in Comodo later
changes that file only. Nunito is loaded through `next/font` (Regular, SemiBold, Bold). The DA's
hierarchy becomes named type utilities with a mobile and a desktop step:

| Level | Face | Weight | Desktop | Mobile |
| --- | --- | --- | --- | --- |
| H1 | display | Regular | 56–64 px | 38–44 px |
| H2 | display | Regular | 40–48 px | 30–36 px |
| Navigation | display | Regular | 17–19 px | 18–20 px |
| H3 | Nunito | Bold | 26–30 px | 22–26 px |
| Intro | Nunito | Regular | 20–22 px | 18–20 px |
| Body | Nunito | Regular | 17–18 px | 16 px |
| Button | Nunito | SemiBold | 16–17 px | 16 px |
| Field | Nunito | Regular | 16 px | 16 px |
| Caption | Nunito | Regular | 14 px | 14 px |

Build picks one value inside each range and records it in `globals.css`. The display face is never
used below H2/navigation sizes; body text never goes under 16 px.

**Components.**

- **Button** (retuned shadcn `button.tsx`): capsule, min height 48 px, 24–32 px horizontal
  padding, 1 px solid border, Nunito SemiBold 16 px, no wrapping, no shadow. Hover: `scale(1.03)`
  from the centre, 200 ms ease-out on transform, background, border and text colour; no vertical
  movement. One variant per background, exactly as the DA's table:

  | Background | Default | Hover |
  | --- | --- | --- |
  | white | white fill, sage border, sage text | sage fill, sage border, white text |
  | striped | white fill, taupe border, taupe text | butter fill, butter border, taupe text |
  | sage | sage fill, white border, white text | butter fill, butter border, sage text |
  | taupe | taupe fill, white border, white text | butter fill, butter border, taupe text |

  Under `prefers-reduced-motion: reduce` the scale is dropped; the colour change stays. A visible
  focus ring is kept for keyboard use.
- **Card** (retuned `card.tsx`): 32 px radius, generous padding, no shadow, white on sage or
  pearl, taupe as the editorial block on the stripes.
- **Striped section** and **translucent block**: small layout components wrapping the two
  utilities, enforcing the DA's rules in their API (text always sits in a solid block over the
  stripes; the translucent block is never placed over the stripes).
- **Confirmation dialog** (`src/components/ui/confirm-dialog.tsx`, on shadcn's alert-dialog):
  a title, a short text, and two actions; each action declares whether it is the sensitive one
  (red — cancel, refuse, leave) or the confirming one (green). This component is the **only**
  place the red and green tokens are referenced (D-24). Keyboard: Escape closes, focus is trapped
  and returns to the trigger.
- The other retained shadcn components (`accordion`, `alert`, `avatar`, `badge`, `progress`,
  `separator`, `table`, `tabs`, `tooltip`) are retuned through the variable contract and lose any
  shadow classes. `input.tsx` is added (capsule field, 16 px) since the DA specifies it.

**Layouts and shell.**

- The root layout (`src/app/layout.tsx`) becomes light: white background, sage/taupe per the DA,
  Nunito body, `lang="fr"`, light `color-scheme` and `theme-color`. Metadata keeps reading from
  the catalogue.
- A `(public)` route group layout renders the **public header** (wordmark linking to `/`,
  navigation to the guide's URL map — `/comment-ca-marche`, `/tarifs`, `/qui-sommes-nous`,
  `/faq` — and the two account entries `/inscription-famille`, `/inscription-professionnelle`)
  and the **public footer** (the same links plus `/conditions-generales` and
  `/confidentialite`). Below the `md` breakpoint the navigation collapses behind a menu button
  that opens a panel; the panel is keyboard-operable and closes on Escape. Those pages do not
  exist yet (the vitrine stub builds them); the links are expected to 404 until then.
- The **portal shell** (`src/components/shell/portal-shell.tsx`): a header with the logomark,
  a navigation list passed in as props (no portal routes exist yet), a desktop layout and a
  mobile navigation. It is not wired to any real route in this run.
- The **holding page** keeps rendering at `/`, exactly as today — same words, dark night
  palette, Fraunces/Karla, the breathing logomark, the same metadata and OG card. It moves into a
  `(holding)` route group whose layout scopes the night palette and Karla to that page only, so
  the light root layout does not change how it looks. It uses neither the public header nor the
  footer.

**The reference page.** `/design-system`, inside the `(public)` layout (so it shows the header
and footer), with `robots: noindex, nofollow`, not linked from anywhere, reachable on production,
UAT and previews. It shows: the palette swatches with their names and share, the type scale
level by level, the four button variants each on its own background with default and hover
visible, cards on white, sage and pearl, the striped section with its taupe block, the translucent
block over a sage background, the input, and a trigger for the confirmation dialog using the DA's
example ("Souhaitez-vous vraiment vous déconnecter ?"). `/design-system/portail` shows the portal
shell with sample navigation items, without the public header and footer.

**The content catalogue (D-19, D-25).** `src/content/` is split per surface — at least
`common.ts` (brand name, header and footer labels, the two CTA entries of D-25:
"Trouver votre gardienne de la nuit" for use only after text that names health professionals, and
"Trouver une professionnelle" everywhere else), `holding.ts` (the holding page's words, moved from
`site.ts` unchanged), `design-system.ts`, and `portal.ts` (shell labels, the sign-out
confirmation copy). Each surface exports its words keyed by locale, with French (`fr`) the only
locale; a `locales` list and a `defaultLocale` live in one place; the TypeScript types are derived
from the French entries so a second locale that misses a key fails the typecheck. No i18n
library. An entry whose wording awaits Surya carries a `@relecture` JSDoc tag with the reason;
the students entry (D-7: wording that stays true whether or not students are admitted, never
"diplômées" where it would be false) is one of them, as is every header/footer label the guide
does not give verbatim. `site.ts` is removed once nothing imports it. Words follow the guide:
vouvoiement, no exclamation mark, no em dash, no ellipsis.

**Health.** `src/app/api/health/route.ts` answers `GET` with 200 and `{ "status": "ok" }`,
uncached, touching no database or external service. `.icm/project.json` → `health_endpoint`
becomes the array `["https://uat.berceo.be/api/health", "https://www.berceo.be/api/health"]`
(operator decision: the production entry reads red until the first UAT promotion).

**Docs.** `README.md` documents the catalogue's shape (one file per surface, the locale keys, the
`@relecture` tag, how to add a locale) and the new route groups. `AGENTS.md`'s routing table
points at the new catalogue and design-system locations; its "committed to dark" rule is **not**
changed here (it is amended at the vitrine's Release).

## Acceptance criteria

- [ ] `/design-system` renders the palette, the type scale, the four button variants on their backgrounds, cards, the striped section, the translucent block, the input and the confirmation dialog, matching the DA's values listed in this spec.
- [ ] `/design-system` and `/design-system/portail` carry `noindex, nofollow` in their robots metadata and no page links to them.
- [ ] Every colour and font family is a token declared in `src/app/globals.css` (fonts bound in `src/app/fonts.ts`); a search for hex colour literals and `rgb(`/`hsl(` in `src/components/**` and `src/app/**/*.tsx` returns nothing.
- [ ] The red and green confirmation tokens are referenced only by `src/components/ui/confirm-dialog.tsx`.
- [ ] No component in `src/components/**` or `src/app/**` applies a box-shadow.
- [ ] Buttons are capsules at least 48 px tall with a 1 px border and scale to 1.03 over 200 ms ease-out on hover, with no scale under `prefers-reduced-motion: reduce`.
- [ ] Swapping the display face from Fraunces to Comodo requires editing `src/app/fonts.ts` only.
- [ ] The public header and footer render on `/design-system`; below `md` the header navigation opens from a menu button and closes on Escape.
- [ ] `/design-system/portail` renders the portal shell with the logomark in its header and a working mobile navigation.
- [ ] The confirmation dialog opens from its trigger, traps focus, closes on Escape, and returns focus to the trigger.
- [ ] `/` renders the holding page with the same words, dark palette, fonts, animation and metadata as before this run, without the public header or footer.
- [ ] `GET /api/health` returns 200 with `{ "status": "ok" }`, covered by a unit test.
- [ ] `health_endpoint` in `.icm/project.json` lists `https://uat.berceo.be/api/health` and `https://www.berceo.be/api/health`.
- [ ] Every word rendered by the holding page, the header, the footer, the portal shell and the design-system pages comes from `src/content/`; `src/content/site.ts` is gone.
- [ ] The catalogue is keyed by locale with `fr` only, and its types make a missing key in a second locale a typecheck error.
- [ ] The students wording entry and every label not given verbatim by the guide carry a `@relecture` tag.
- [ ] `README.md` documents the catalogue's shape and how to add a locale; `AGENTS.md`'s routing table points at the new locations.
- [ ] Lint, typecheck, tests and the Vercel build are green.

## Out of scope

- Any product screen, authentication or data (stub `comptes-neon-auth` and later).
- The vitrine pages and the replacement of the holding page (stub `vitrine-publique`); the header and footer links 404 until it ships.
- Amending the AGENTS.md "committed to dark" rule (at the vitrine's Release).
- The Comodo font files and licence: Fraunces stands in until Surya delivers them; the swap is a later one-file change.
- WCAG AA contrast for the DA's text and button colours: the DA is applied literally by operator decision; sage and taupe text on white and white on sage fall below 4.5:1. For the operator to raise with Surya; not solved here.
- Photography and the image bank; iconography beyond what the shell needs (lucide, rounded, already installed).
- A second locale.

## Open questions

- none — the Comodo files and the students wording are tracked as Surya deliverables, marked in code (`fonts.ts`, `@relecture`), and do not block this run.

Context budget: read the DA and editorial guide extracts (`.icm/processed/`) beyond the map's Define slice, to fill the button table, type scale and palette the stub summarised.
