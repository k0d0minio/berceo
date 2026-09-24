# Plan: vitrine-publique

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The words** — `src/content/accueil.ts`, `comment-ca-marche.ts`, `tarifs.ts`, `faq.ts`,
   `qui-sommes-nous.ts`, `legal.ts`, `common.ts` (add "Rejoindre le réseau", photo alt texts if
   shared); each page's title and meta in its own file; `@relecture` on every non-verbatim entry.
   Plus the two unit tests: title 50–60 / meta 140–160 and uniqueness; the banned-words and
   euro-amount scan over catalogue values. — done when: `npm test` passes on the catalogue alone.
2. **The shared blocks** — `src/components/vitrine/` (CTA pair, three-step list, reassurance band,
   FAQ item, photo frame): words as props, tokens only, built on socle's `Button`, `Card`,
   `StripedSection`, `TranslucentBlock`. — done when: no literal text or colour value in
   `src/components/vitrine/**` (grep).
3. **The photographs** — the four PNGs of `.icm/raw/Banque d_image/` converted to WebP under
   `public/photos/` (each < 300 KB, sized for the largest rendered width); rendered with
   `next/image`. — done when: `ls -la public/photos` shows four files under 300 KB, nothing from
   `.icm/raw/` under `public/`.
4. **The pages** — `src/app/(public)/page.tsx` (accueil), `comment-ca-marche/`, `tarifs/`, `faq/`,
   `qui-sommes-nous/`, `conditions-generales/`, `confidentialite/`, each with `generateMetadata` or
   `metadata` from its catalogue file, one H1, ≤ 4 H2; the three placeholders `robots: noindex`.
   — done when: every header and footer link except the two sign-ups resolves on the preview.
5. **The holding page goes** — delete `src/app/(holding)/`, `src/content/holding.ts`; strip `.nuit`,
   `souffle`/`halo`/`lever` from `globals.css`, `karla` from `fonts.ts`, `themeColorNuit` from
   `theme-color.ts`; root `layout.tsx` gains `metadataBase` and the shared Open Graph/Twitter
   defaults and loses its holding comments. — done when: `grep -rn "Site en construction\|holding"
   src` is empty and `/` renders the accueil.
6. **SEO plumbing** — `src/app/sitemap.ts` (the four indexable pages on `https://www.berceo.be`),
   `src/app/robots.ts` (allow + sitemap on `VERCEL_ENV=production`, disallow all elsewhere), the new
   light `public/og.png` 1200×630. — done when: `/sitemap.xml` and `/robots.txt` on the preview
   read as the spec says (robots disallows there, since a preview is not production).
7. **Docs** — README.md and AGENTS.md routing tables and the dark rule are rewritten at **Release**
   (spec, D-9); Build touches them only if a path it moved would otherwise leave a dead link.

## Risks

- The H1 does not fit above the fold at 360×640 with the header: the display size from socle's
  scale is large. Signal: the preview at 360 px shows the H1 cut. Fix within the DA's mobile H1
  range or shorten the first block's spacing, never shrink below the scale.
- A banned word slips in through a verbatim guide line (the guide itself says "assurance").
  Signal: the banned-words test fails. Rewrite the line; never loosen the test.
- `metadataBase` on www while UAT serves uat.berceo.be: OG URLs point at production. Expected —
  UAT is not indexed and not shared.
- The OG card needs an image tool: if none is available in the session, generate it with
  `next/og` at build time (`opengraph-image.tsx`) instead of a static PNG, and say so in notes.
- `comptes-neon-auth` not merged: the two sign-up links 404 on UAT (Out of scope, by design).
