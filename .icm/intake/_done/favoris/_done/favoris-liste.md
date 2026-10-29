# Stub: A family finds her professionals again and sends one her request

- feature-slug: favoris-liste
- epic: favoris
- sequence: 2 of 2
- depends-on: favoris-marquer
- complexity: medium
- priority: P1

## Problem

A family who wants the same professional again must search for her. The cahier des charges
(D-07) and the devis ask for her to find the professionals she met and re-book.

## Proposed change

« Mes professionnelles » in the family's navigation: her favourites first, then the
professionals of her past gardes, each as a card with her note, her gardes count, « Voir le
profil complet » and « Lui envoyer ma demande en priorité ». A professional no longer `valide`
or suspended shows as unavailable and takes no request. A family without a subscription sees
the cards and the invitation line in place of the buttons.

## Acceptance criteria

- [ ] « Mes professionnelles » lists her favourites, then the professionals of her past gardes, without doubles.
- [ ] Each card opens the full profile and the priority request.
- [ ] A professional not `valide` or suspended shows as unavailable, with no priority button.
- [ ] Without a subscription, the page shows the cards and the invitation line.
- [ ] The family's home links to the page.

## Out of scope

- A sort or a search in the list.

## Notes

- The past gardes come from `bookings` by `family_user_id`, status `confirmee`, night ended.
- Files: `src/lib/favoris/`, `src/lib/gardes/`, a new `src/app/(portail)/espace/famille/professionnelles/page.tsx`,
  `src/components/shell/` (the navigation), `src/content/favoris.ts`, `src/content/famille.ts`.
