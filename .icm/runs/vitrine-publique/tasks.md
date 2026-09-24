# Tasks: vitrine-publique

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `/`, `/qui-sommes-nous`, `/comment-ca-marche`, `/faq`, `/tarifs`, `/conditions-generales` and `/confidentialite` render inside the public header and footer, in the DA's light look, with no horizontal scroll at 360 px or at 1280 px wide.
- [ ] Every link in the public header and footer resolves to one of these pages, except `/inscription-famille` and `/inscription-professionnelle`, which belong to `comptes-neon-auth`.
- [ ] The H1 on `/` is fully visible without scrolling at a 360×640 viewport and at 1280×720.
- [ ] `/` shows the manual-verification reassurance line in the first third of the page and two visually distinct calls to action: the family one links to `/inscription-famille`, and "Rejoindre le réseau" links to `/inscription-professionnelle`.
- [ ] Each page has exactly one H1 and at most four H2.
- [ ] Every page's `<title>` and meta description are unique across the site. Titles are 50 to 60 characters and descriptions 140 to 160 characters (a unit test over the catalogue checks both).
- [ ] `/comment-ca-marche` shows three family steps, three professional steps and a "Ce que garantit Berceo" block.
- [ ] `/tarifs` states the 100 to 300 € range set by the professional, the 3 % fee charged at confirmation with its refund rule, direct payment to the professional, and a free account with no subscription.
- [ ] `/faq` has question-and-answer pairs with each question as an H3, covering at least the topics listed under Proposed change.
- [ ] `/qui-sommes-nous`, `/conditions-generales` and `/confidentialite` render their placeholder block, carry `noindex`, and are absent from the sitemap.
- [ ] A unit test over the vitrine's catalogue strings (values, not comments) fails if any contains "!", "…" or "—"; the whole words "assurance", "assuré·e·s" or "couvert·e·s" (so "rassurant" passes); "Facebook"; a tier name ("Découverte", "Parenthèse", "Sérénité", "Premium"); or a euro amount other than 100 and 300. "Abonnement" is allowed only in a sentence saying there is none.
- [ ] "Trouver votre gardienne de la nuit" appears only in a block whose heading or text directly above names health professionals. Every other family CTA reads "Trouver une professionnelle" (D-25; checked on review).
- [ ] `grep -rn "Site en construction\|holding" src` returns nothing. `src/app/(holding)/`, `src/content/holding.ts`, the `.nuit` palette, Karla and `themeColorNuit` are gone.
- [ ] The four photographs are WebP under `public/photos/`, each under 300 KB. Each renders through `next/image` with a non-empty alt text from the catalogue. No PNG from `.icm/raw/` is under `public/`.
- [ ] `public/og.png` is a 1200×630 light card. Every page's Open Graph tags carry that page's title and description and the card.
- [ ] `/sitemap.xml` lists exactly `/`, `/comment-ca-marche`, `/tarifs` and `/faq` on `https://www.berceo.be`. `/robots.txt` allows crawling and names the sitemap on production, and disallows everything on UAT and preview deployments.
- [ ] Every catalogue entry not quoted verbatim from the guide carries `@relecture`.
- [ ] Lint, typecheck, tests and the Vercel build are green.

## Queue

- [ ] <task — small enough for one commit; name the file or area>

- [x] The words: six page catalogues, `photos.ts`, `common.cta.rejoindreReseau`, the catalogue test (`vitrine.test.ts`) — 70445fd
- [x] The shared blocks in `src/components/vitrine/` — 70445fd
- [x] The photographs as WebP under `public/photos/` (37–136 KB each) — 70445fd
- [x] The seven pages under `src/app/(public)/` with `pageMetadata()` — 70445fd
- [x] The holding page removed (route group, catalogue, `.nuit`, animations, Karla, `themeColorNuit`) — 70445fd
- [x] `sitemap.ts`, `robots.ts`, `site.ts`, `metadataBase`, the light `public/og.png` — 70445fd
- [x] Cheap-tier GREEN, merge `uat`, flip ready, full gate GREEN — 5c423fd

