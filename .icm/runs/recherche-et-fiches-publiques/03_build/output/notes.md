# Build notes: recherche-et-fiches-publiques

- commits: d27432e feat — search by commune, public teaser and commune pages, the way back through sign-up
- ci: pending (see status.md)

## What changed

- `src/lib/recherche/`: `slugs.ts` (every address: `/professionnelles/[prenom]-[id8]`, `/garde-de-nuit/[commune]`, the search path), `rules.ts` (query → communes, the D-123 order, the zone line, the guide's title and meta builders), `sitemap.ts` (pure path list), `professionals.ts` (server-only reads: `teaserColumns` / `cardColumns` whitelists, `valide` held in every query's SQL; note from `src/lib/avis/`, nights from `src/lib/disponibilites/`).
- `src/lib/communes/index.ts`: `allCommunes`, `communesOfPostcode`, `communeByName` (exact name or official alias, one commune only).
- `src/content/recherche.ts`: every word; guide lines verbatim, the rest `@relecture Surya`.
- `src/components/recherche/`: the signed-in card and the public teaser card (one link each, named « Voir le profil de {prénom} »), the no-result block, the search form (the profile's commune combobox in a GET form), the public professional block (takes its fields one by one).
- Pages: `/espace/famille/recherche` (noindex; `q` resolves and redirects to `?commune=`; bare → her own commune), `/professionnelles/[slug]` (canonical redirect, 404s, guide meta, no photo), `/garde-de-nuit/[commune]` (565 pages, teaser cards or the no-result message and the sign-up link). Nav « Trouver une professionnelle » and a link on the family home.
- `src/app/sitemap.ts`: vitrine + 565 commune pages + validated professionals (D-130).
- The way back (D-129): `src/lib/auth/retour.ts` (cookie `berceo_retour`, one day, HttpOnly, SameSite=Lax, Secure), `withReturn` in `routing.ts`, `signUp(role, retour, …)` sets it for a family only, sign-in ↔ family sign-up links carry `retour`, `/inscription-famille` honours it for a signed-in visitor, the confirmation route lands a family there and clears the cookie.
- `/design-system/portail`: the two cards and the no-result block. README « The search and the public pages », AGENTS routing row.

## Acceptance criteria status

- [x] Only `valide` professionals, per status — `professionals.test.ts` builds both queries and asserts the `status = $n` clause with `valide` and none of the four other enum values in its params (the query is built, not run: no database in the unit suite).
- [x] Postcode, exact name, unknown — `rules.test.ts` resolves every postcode of the list; today no Belgian postcode spans two communes, so « several » is held generically (the result equals `communesOfPostcode`, no duplicate).
- [x] Bare page searches her commune — in the page; not unit-tested (a page reading the session and the database). Smoke on the preview.
- [x] Order — `rules.test.ts` (equal nights, equal first names, accents, id tie-break).
- [x] Signed-in card fields and link — `ProfessionalCard`; the nights show at most three on a card (the full block stays on the profile). Smoke on the preview.
- [x] No-result + publish button — in the page and the design-system page.
- [x] Public page fields and CTA — `public-professional.test.ts` renders it.
- [x] No leak — `public-professional.test.ts` hands the component a fixture carrying unique surname, e-mail, phone, street, rate, photo id and INAMI strings and asserts none reaches the HTML; the page passes only named scalars to server components, so the markup is the payload. Column lists held by `professionals.test.ts`.
- [x] Canonical redirect / 404 — in the page (`permanentRedirect`, `notFound`); slug parsing in `slugs.test.ts`. The redirect itself is smoke on the preview.
- [x] 565 commune pages, unique slugs round-tripping, unknown slug 404 — `slugs.test.ts`; page behaviour on the preview.
- [x] Sitemap — `slugs.test.ts` → `sitemapPaths`; the query reads `valide` only.
- [x] Titles and metas — `rules.test.ts` (the guide's professional pattern filled; commune titles unique).
- [x] The way back — `confirmer/route.test.ts` (with and without the cookie, cookie cleared, session cookie kept), `retour.test.ts` (links, store, landing).
- [x] Unsafe `retour` dropped, professional never — `retour.test.ts`, `confirmer/route.test.ts`.
- [ ] 360 px, keyboard, single-link cards — built for it (`min-w-0`, `break-words`, the CTA capsule allowed to wrap, the combobox's keyboard pattern); needs the operator's smoke at 320–360 px.
- [x] Catalogue — `recherche.test.ts` (rules, guide lines verbatim, the one allowed ellipsis). The `@relecture` tags are in the file; the test does not scan comments.
- [x] Routing — `routing.test.ts` (search family-only, signed-out → sign-in with `retour`, public paths never a way back); `public-access.test.ts` holds the proxy matcher off the public pages.
- [x] Design system, README, AGENTS.

## Notes for Release

- D-130 and D-131 are Build's (spec gaps): the sitemap's rendering and the search URL's display parameters.
- Some commune titles exceed the guide's 60 characters (« Garde de nuit à domicile à Beveren-Kruibeke-Zwijndrecht | Berceo » is 65). The spec fixed the pattern; Surya's review of `meta.communeTitre` is the lever.
- The public professional page and the commune pages read the database on every request (`force-dynamic`), as the spec asks for the 404-at-once behaviour.
- Nights on the signed-in cards are read one query per professional (`nextAvailableNights`); fine at V1 volume, a batched reader in `src/lib/disponibilites/` if a commune ever lists dozens.
- The confirmation route test mocks `@/lib/auth/server`, `@/lib/auth/welcome` and `@/db`; the public-access test mocks `@/lib/auth/server` to import the proxy config.
- Unverified locally (the repo forbids local lint/typecheck/test): the advisory quality job is the first run of the new tests.

Context budget: read the avis-etoiles spec, `src/lib/auth/` (routing, guard, server), the account pages and actions, the confirmation route, the full-profile page, the vitrine blocks and the design-system page beyond the Inputs table, to reuse their readers and components.
