# Build notes: vitrine-publique

- commits: 70445fd `feat: vitrine-publique — the public site replaces the holding page` · 7481214 merge of `origin/uat` (brings `comptes-neon-auth`, #22)
- ci: GREEN on 5c423fd (full gate, post-flip); cheap tier GREEN on 9a17520 and 9eb8a0d

## What changed

- `src/content/`: one catalogue per page (`accueil.ts`, `comment-ca-marche.ts`, `tarifs.ts`, `faq.ts`, `qui-sommes-nous.ts`, `legal.ts`), `photos.ts` (sources and alt texts), `common.cta.rejoindreReseau`; `holding.ts` removed. `@relecture` on every entry not quoted from the guide (B-4: a tag on an object covers its entries).
- `src/content/vitrine.test.ts`: the writing rules over catalogue values — no `!`, `…`, `—`; no insurance or coverage word (whole words, "rassurant" passes); no Facebook; no tier name; no euro amount but 100 and 300; "abonnement" only after sans/aucun/pas d'; titles 50–60 and descriptions 140–160, all unique; FAQ links name real pages.
- `src/components/vitrine/`: `VitrineSection` (band on blanc/perle/sauge with its H2), `PageHeader` (the H1), `Photo` (`next/image`, `preload`), `StepList`, `ReasonGrid`, `CtaPair`, `PlaceholderPage`. Words as props, tokens only.
- `src/app/(public)/`: `page.tsx` (accueil), `comment-ca-marche/`, `tarifs/`, `faq/`, `qui-sommes-nous/`, `conditions-generales/`, `confidentialite/`; `page-metadata.ts` builds each page's title, description, canonical, Open Graph and Twitter tags; the three placeholders are `noindex, follow`.
- `src/app/site.ts`, `sitemap.ts`, `robots.ts`; `layout.tsx` gains `metadataBase`.
- Holding page removed: `src/app/(holding)/`, the `.nuit` palette, the `souffle`/`halo`/`lever` animations, Karla, `themeColorNuit`.
- `public/photos/*.webp` (four, 1600 × 900, 37–136 KB); `public/og.png` replaced by a light 1200 × 630 card.

## Acceptance criteria status

- [ ] Seven pages render inside the header and footer, light, no horizontal scroll at 360 and 1280 — to confirm on the preview.
- [x] Header and footer links resolve, except the two sign-ups (`comptes-neon-auth`) — every `common.pages` entry but those two has a page.
- [ ] H1 of `/` above the fold at 360×640 and 1280×720 — laid out for it (first element after the header, 40 px mobile); to confirm on the preview.
- [x] Reassurance line in the first screen, two distinct CTAs (sage filled → `/inscription-famille`, outlined "Rejoindre le réseau" → `/inscription-professionnelle`).
- [x] One H1 and at most four H2 per page — accueil 4, comment-ca-marche 3, tarifs 3, faq 4, placeholders 0.
- [x] Titles and descriptions unique and in range — asserted by `vitrine.test.ts`.
- [x] Comment ça marche: three family steps, three professional steps, "Ce que garantit Berceo".
- [x] Tarifs: the range, the 3 % fee and its refund rule, direct payment, free account without subscription.
- [x] FAQ: 14 questions as H3 in four groups, covering every listed topic.
- [x] Placeholders render, `noindex`, absent from the sitemap.
- [x] The banned-words and amounts test.
- [x] "Trouver votre gardienne de la nuit" only in the home hero, under a message naming health professionals; elsewhere "Trouver une professionnelle".
- [x] `grep -rn "Site en construction\|holding" src` is empty; the named leftovers are gone.
- [x] Four WebP under 300 KB through `next/image`, alt texts from the catalogue; no raw PNG under `public/`.
- [x] Light OG card; every page's Open Graph tags carry its title and description.
- [x] Sitemap lists the four indexable pages on www; robots allows only on `VERCEL_ENV=production`.
- [x] `@relecture` on every non-verbatim entry.
- [ ] Lint, typecheck, tests, Vercel build — CI.

## Notes for Release

- README.md and AGENTS.md still describe the holding page and the dark rule: Release rewrites them (spec, D-9).
- Two titles are not the guide's verbatim (B-1): the length criterion won. Surya reviews them with every `@relecture` entry (`grep -rn @relecture src/content`).
- On the preview, `/robots.txt` must disallow everything (a preview is not production); the "allow" branch is only observable after promotion.
- `comptes-neon-auth` merged into `uat` during this Build (#22) and came in through the step-10 merge: `/inscription-famille` and `/inscription-professionnelle` now exist, so every CTA and every header and footer link resolves on the preview. The spec's Out of scope line about the 404 is overtaken; nothing in this diff changed for it.
