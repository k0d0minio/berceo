# Plan: recherche-et-fiches-publiques

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Slugs and resolution (pure)** — `src/lib/recherche/slugs.ts` (prénom slug, `id8`, commune
   slug ↔ INS, canonical path builders), `src/lib/recherche/rules.ts` (query → INS codes: picked
   locality, postcode, exact commune name, else none; the D-123 ordering function), a
   `postcode → communes` helper in `src/lib/communes/index.ts` if `postcodesOf`'s inverse is
   missing — done when: unit tests pass for 565 unique commune slugs round-tripping, accents and
   compound first names, every query shape, and the ordering ties.
2. **The reader** — `src/lib/recherche/professionals.ts` (server-only): `professionalsServing(ins[])`
   and `teaserByShortId(id8)` with an explicit column whitelist, `valide` only, joined to
   `notesOfProfiles` and (signed-in cards only) `nextAvailableNights` — done when: a test holds the
   column list free of surname/e-mail/phone/INAMI/rate, and the status test covers each non-`valide`
   status.
3. **Catalogue and components** — `src/content/recherche.ts` + `recherche.test.ts` (guide lines
   verbatim, `@relecture` on the rest, the one allowed ellipsis), `src/components/recherche/`
   (signed-in card, public teaser card, no-result block, search form on the existing
   commune combobox) — done when: the content test passes and `/design-system/portail` shows the
   three blocks.
4. **The signed-in search** — `src/app/(portail)/espace/famille/recherche/page.tsx`, the nav entry
   in `space-shell.tsx` / `portal.ts`, the link from the family home, `routing.test.ts` rows — done
   when: the page renders results, the pre-fill from her profile, the not-found line and the
   no-result block, noindex.
5. **The public pages and sitemap** — `src/app/(public)/professionnelles/[slug]/page.tsx`
   (canonical redirect, 404s, guide title/meta, canonical URL), `src/app/(public)/garde-de-nuit/[commune]/page.tsx`
   (all 565, teaser cards or no-result + sign-up link), `src/app/sitemap.ts` (vitrine + communes +
   `valide` professionals, `revalidate = 3600`) — done when: the no-leak render test (unique
   surname/phone/e-mail fixture absent from HTML and RSC payload) and the metadata builder tests
   pass.
6. **The way back through sign-up (D-129)** — `retour` on the sign-in ↔ sign-up links,
   `/inscription-famille` → `redirectIfSignedIn(retour)` and the action, the one-day cookie set
   on family sign-up only, read and cleared in `verification-email/confirmer` — done when: the
   route test covers with/without cookie, an unsafe `retour`, and a professional sign-up.
7. **Docs** — README « The search and the public pages », `AGENTS.md` routing row — done when:
   both exist and name the module, the slugs, the sitemap and the way back.

No schema change, no migration.

## Risks

- The public page leaks a private field through the RSC payload (a prop passed whole to a client
  component) — signal: the no-leak test finds the fixture's surname. Pass only whitelisted scalars.
- The sitemap reads the database at build time and fails the build without `DATABASE_URL` —
  signal: a red Vercel build on the preview. Keep it dynamic/revalidated, never static at build.
- Two communes slug to the same path — signal: the uniqueness test fails; disambiguate with the
  INS suffix for the colliding pair only.
- `id8` collides between two `valide` profiles — the page 404s by spec; negligible at V1 volume.
- The cookie outlives an abandoned sign-up and redirects a later verification — bounded to one day
  and to safe space paths.
