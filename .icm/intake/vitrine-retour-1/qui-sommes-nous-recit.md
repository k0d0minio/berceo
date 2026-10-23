# Stub: A visitor reads the founders' story on « Qui sommes-nous »

- feature-slug: qui-sommes-nous-recit
- epic: vitrine-retour-1
- sequence: 1 of 3
- depends-on: none
- complexity: low
- priority: P1

## Problem

`/qui-sommes-nous` shows a placeholder line, is `noindex` and is out of the sitemap, because the
founders' story did not exist (D-23). The founders delivered the story in feedback round 1.

## Proposed change

The page shows the founders' text in full, from « Nous sommes deux sages-femmes diplômées » to
« prendre soin d'eux. », with its paragraphs and its title « Qui sommes-nous ? ». The guide's
closing sentence stays under it. The page is indexed and listed in the sitemap. The title and the
meta description are rewritten for a page that now carries the story.

## Acceptance criteria

- [ ] `/qui-sommes-nous` shows every paragraph of the founders' text, in order, with no word changed except the punctuation named in Notes.
- [ ] The page has no `noindex` and `src/app/sitemap.ts` lists it.
- [ ] The title is 50 to 60 characters and the meta description 140 to 160, and neither repeats another page's.
- [ ] `src/content/vitrine.test.ts` passes: no `…`, no `—`, no `!` in the catalogue.

## Out of scope

- Any photograph on the page.
- The legal pages, which stay placeholders.

## Notes

- The text has one ellipsis (« entourés… jusqu'à ») and one em dash (« à porter — et que »).
  The guide forbids both. Replace the ellipsis by a comma and the em dash by a comma, and tag both
  lines `@relecture Surya — ponctuation du guide`. Change no other word.
- The text lives in `src/content/qui-sommes-nous.ts`. The page is
  `src/app/(public)/qui-sommes-nous/page.tsx`. The source text: the Drive file
  `feedback-round-1.pdf`, section « Qui sommes-nous texte ».
- The founders' text says « sages-femmes diplômées » about themselves. That is a fact, not the
  blanket claim D-7 avoids.
