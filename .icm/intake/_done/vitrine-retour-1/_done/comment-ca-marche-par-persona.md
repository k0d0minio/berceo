# Stub: A parent and a professional each read their own « Comment ça marche »

- feature-slug: comment-ca-marche-par-persona
- epic: vitrine-retour-1
- sequence: 2 of 3
- depends-on: none
- complexity: medium
- priority: P1

## Problem

`/comment-ca-marche` is one page with a section per side. The founders want two pages. The reader
says who she is at the top right (« je suis parent » or « je suis professionnel/le ») and reads
the steps of her side only. The intro sentence « Berceo met en relation les familles et les
professionnelles de santé pour des gardes de nuit à domicile. Trois étapes de chaque côté, et rien
de plus. » must go.

## Proposed change

Two pages: `/comment-ca-marche/parents` and `/comment-ca-marche/professionnelles`.
`/comment-ca-marche` opens the parents' page. A switch at the top right of both pages names the
two sides and links them. The parents' page opens with the founders' sentence: « La première
plateforme belge à mettre en relation des familles avec des professionnel/les de santé diplômées
(et en fin de formation), pour des nuits de repos à domicile, avec autant de compétence que de
douceur. » Each page keeps its three steps and the « Ce que garantit Berceo » block. Each page
ends with the sign-up button of its side. The parents' button leads to the family sign-up, which
proposes the subscriptions once `abonnements-familles` ships.

## Acceptance criteria

- [ ] `/comment-ca-marche` shows the parents' page. The switch at the top right opens `/comment-ca-marche/professionnelles`, and the reverse.
- [ ] The parents' page opens with the founders' sentence, word for word.
- [ ] The sentence « Trois étapes de chaque côté, et rien de plus. » appears nowhere on the site.
- [ ] Each page ends with one sign-up button, to `/inscription-famille` or `/inscription-professionnelle`.
- [ ] Each page has its own title and meta description within the limits, and both are in the sitemap.
- [ ] Every internal link to `/comment-ca-marche` on the site, in the FAQ and in the footer still resolves.

## Out of scope

- The subscriptions in the sign-up (`abonnements-familles`).
- New steps or new reassurance items.

## Notes

- Questions, with a default each:
  1. Does `/comment-ca-marche` redirect to `/comment-ca-marche/parents`, or render it at its own
     URL? Default: render it at `/comment-ca-marche` and make `/parents` a redirect to it, so the
     indexed URL does not change.
  2. The professionals' page needs an intro of its own. Default: one sentence written to the
     guide, tagged `@relecture`.
- The founders wrote « professionnel/les ». Keep it as written and tag it `@relecture Surya —
  écriture inclusive du guide`.
- The founders' sentence says « diplômées (et en fin de formation) ». The parenthesis keeps it
  true when students are admitted (D-7).
- Files: `src/content/comment-ca-marche.ts`, `src/app/(public)/comment-ca-marche/`,
  `src/app/(public)/page-metadata.ts`, `src/app/sitemap.ts`, the footer in
  `src/components/shell/`, `src/content/faq.ts` for its links, `src/content/vitrine.test.ts`
  (the URL map).
