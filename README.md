# BERCEO

**Berceo** — a Belgian marketplace connecting parents of newborns with professionals who
take overnight post-partum care shifts.

Today `/` is a one-screen holding page, in French, saying the site is being built. Under it
sits the platform's foundation: Surya's design system, the app shell and the content catalogue.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Where things live

| Path | Purpose |
| --- | --- |
| [src/content/](src/content/) | Every word the site shows, one file per surface. See **The content catalogue** below. |
| [src/app/(holding)/](src/app/(holding)/) | The holding page at `/` — one screen, no navigation, still the night palette. |
| [src/app/(public)/](src/app/(public)/) | Public pages, under the public header and footer. Holds `/design-system` today. |
| [src/app/(portail)/](src/app/(portail)/) | `/design-system/portail`: the signed-in portal's shell with sample navigation. |
| [src/app/api/health/route.ts](src/app/api/health/route.ts) | `GET /api/health` → `200 {"status":"ok"}`; the `health_endpoint` in `.icm/project.json`. |
| [src/app/globals.css](src/app/globals.css) | The design system's tokens (colours, type scale, radii, stripes, transparency), and the holding page's `.nuit` scope with its `souffle` / `halo` / `lever` animations. The only file that holds a colour. |
| [src/app/fonts.ts](src/app/fonts.ts) | Every typeface, bound once: the display slot (Fraunces standing in for Comodo), Nunito, Karla for the holding page. |
| [src/app/theme-color.ts](src/app/theme-color.ts) | The two browser-chrome colours — a `<meta>` cannot read a CSS variable. |
| [src/app/layout.tsx](src/app/layout.tsx) | The light root layout. |
| [src/components/ui/](src/components/ui/) | shadcn components retuned to the DA, plus `confirm-dialog`, `striped-section`, `translucent-block`, `input`. |
| [src/components/shell/](src/components/shell/) | Public header and footer, the portal shell, the mobile menu, the sign-out dialog. |
| [src/components/berceo-logo.tsx](src/components/berceo-logo.tsx) | Wordmark and logomark, inlined so they take `currentColor`. |
| [public/logos/](public/logos/) | Brand pack. SVG is what the site uses; PNG for raster; `.ai` is the source. |

`/design-system` shows every token and component of the DA on one page, with the header and
footer. It and `/design-system/portail` are `noindex, nofollow` and linked from nowhere.

## The design system

Surya's *Direction artistique web* (D-9), applied literally — including its text and button
colours, which fall below WCAG AA contrast on white (an operator decision, to be raised with
Surya).

- **Colours** are Tailwind tokens named as the DA names them: `blanc`, `sauge`, `taupe`,
  `perle`, `beurre`. Tailwind's default palette is switched off, so no other colour exists.
  `rouge-confirmation` and `vert-confirmation` are used by `confirm-dialog.tsx` alone (D-24).
- **Type**: `font-display` (Comodo's slot, Fraunces until Surya delivers Comodo) for H1, H2
  and navigation; Nunito for everything else. The DA's hierarchy is `text-h1`, `text-h2`,
  `text-nav`, `text-h3`, `text-intro`, `text-corps`, `text-bouton`, `text-champ`,
  `text-legende`, each switching from its mobile to its desktop size at `md`.
- **Shapes**: `rounded-carte` (32 px) for cards and blocks, `rounded-capsule` for buttons and
  fields. No shadow anywhere; focus is an outline.
- **Buttons** take the background they sit on as their variant: `blanc`, `raye`, `sauge`,
  `taupe`, with the DA's hover colours and a 1.03 scale in 200 ms (none under reduced motion).
- **Surfaces**: `motif-raye` (text only in a solid block over it — use `StripedSection`) and
  `voile-perle` (pearl at 75 % — use `TranslucentBlock`, never over the stripes).
- **What the DA rules out** stays out: gendered pink and blue, naïve illustrations, shadows,
  gadget animations.

## The content catalogue

Every word lives in `src/content/`, in French, written to Surya's editorial guide (D-19):
vouvoiement, no exclamation mark, no em dash, no ellipsis, the validated lexicon.

- **One file per surface**: `common.ts` (brand, header, footer, the two CTAs of D-25),
  `holding.ts`, `design-system.ts`, `portal.ts`. A new screen adds its own file.
- **Keyed by locale**: each file exports `catalogue({ fr: { … } })`. Components read it with
  `words(surface)`, which returns the default locale. `locale.ts` holds `locales`,
  `defaultLocale` and the types.
- **`@relecture`**: an entry the guide does not give verbatim carries a JSDoc
  `@relecture Surya — <why>` tag. `grep -rn @relecture src/content` is the list to send Surya.
- **Adding a language**: add its code to `locales` in `locale.ts`, then add the same key to
  every `catalogue({ … })`. The type is derived from French, so a surface that misses the new
  locale, or a key inside it, fails the typecheck.

## Database (Neon Postgres + Drizzle)

The platform's data starts here: one Neon Postgres database, read through
[Drizzle ORM](https://orm.drizzle.team). The holding page itself reads nothing from it yet.

- **Schema:** `src/db/schema.ts` — one table, `users` (email, name, role: `parent` |
  `professionnel` | `admin`). The authentication provider is not chosen; the credential or
  external-id column is a later migration.
- **Client:** `src/db/index.ts` — a lazily-initialized Drizzle client on Neon's serverless HTTP
  driver. Import `db` from server code only.
- **Migrations:** `drizzle/` — `NNNN_<name>.sql` plus `meta/_journal.json`, the order of record.

Copy `.env.example` to `.env.local` and set `DATABASE_URL` (a Neon branch's connection string,
never production's), then:

```bash
npm run db:generate -- --name <what>   # regenerate SQL after editing the schema
npm run db:migrate                     # apply pending migrations
npm run db:verify                      # every journal entry is in __drizzle_migrations
npm run db:studio                      # browse the database
```

Production is migrated by the **DB migrate** workflow (`.github/workflows/db-migrate.yml`) on
pushes to `main` that touch `drizzle/` or `src/db/`, from the `DATABASE_URL` repository secret.
`src/db/migrations-journal.test.ts` refuses a journal whose stamps are out of order — the one
way Drizzle's migrator skips a file silently.

## The holding page

- **The page is a night.** `/` still shows the dark holding page until the vitrine replaces
  it. Its palette lives under `.nuit` in `globals.css`, scoped by `src/app/(holding)/layout.tsx`,
  so it never reaches the light platform.
- **The signature is the breathing logomark.** A five-second rise and fall inside a soft pool
  of light, the way a *veilleuse* sits in a nursery. `prefers-reduced-motion` turns it off.
- **Type**: Fraunces for the headline (through the display slot), Karla for text.
- **No contact is shown.** Berceo has no published address yet, and inventing one would
  be worse than showing none.
- The page **is indexed**. See AGENTS.md if that needs reversing.

## Notes

- [.icm/docs/](.icm/docs/) holds the research and the client's cahier des charges.
- Brand masters live in Drive. **Do not commit archives** — `.gitignore` blocks `*.zip`
  after a 58MB pack had to be purged from history.
