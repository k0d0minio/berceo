# BERCEO

Holding page for **Berceo** — a Belgian marketplace connecting parents of newborns with
professionals who take overnight post-partum care shifts.

One screen, in French, saying the site is being built.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Where things live

| Path | Purpose |
| --- | --- |
| [src/content/site.ts](src/content/site.ts) | Every word on the page. The whole copy deck. |
| [src/app/page.tsx](src/app/page.tsx) | The page — one screen, no navigation. |
| [src/app/globals.css](src/app/globals.css) | Night palette, and the `souffle` / `halo` / `lever` animations. |
| [src/app/layout.tsx](src/app/layout.tsx) | Fonts (Fraunces + Karla), metadata, OG card. |
| [src/components/berceo-logo.tsx](src/components/berceo-logo.tsx) | Wordmark and logomark, inlined so they take `currentColor`. |
| [public/logos/](public/logos/) | Brand pack. SVG is what the site uses; PNG for raster; `.ai` is the source. |

## Design notes

- **The page is a night.** Berceo's service is someone staying awake so parents can
  sleep, so the page commits to one dark mode — there is no light theme and no toggle.
  The ground is the brand mint driven down to near-black with its hue intact, so the dark
  belongs to the same family as the logo instead of sitting behind it.
- **The signature is the breathing logomark.** A five-second rise and fall — a settled
  sleeping breath — inside a soft pool of light, the way a *veilleuse* sits in a nursery.
  It is the only animated idea on the page; `prefers-reduced-motion` turns it off.
- **Palette is sampled, not invented**: mint `#73d590`, night-light yellow `#fbfe95`,
  sage `#acbeab`, linen `#d9e3d8` — all taken from the delivered brand pack.
- **Type**: Fraunces for display (the closest living relative to the wordmark's soft
  high-contrast serif), Karla for text.
- **No contact is shown.** Berceo has no published address yet, and inventing one would
  be worse than showing none.
- The page **is indexed** — unlike the proposal document this repo used to hold. See
  AGENTS.md if that needs reversing.

## Notes

- [.icm/docs/](.icm/docs/) holds the research and the client's cahier des charges.
- Brand masters live in Drive. **Do not commit archives** — `.gitignore` blocks `*.zip`
  after a 58MB pack had to be purged from history.
