# Breakdown: A family keeps her favourite professionals

- epic-slug: favoris
- source: the devis of 27 August 2026 (house, `clients/berceo/quote/quote.md`, « La mise en relation »: « Favoris et re-réservation ») and the answers [6.8] (`.icm/docs/berceo-answers.pdf`), taken into V1 by Jamie on 2026-10-29 after the UAT review

## What I understood

The devis sells favourites and re-booking. A family marks a professional as a favourite and
books her again. The founders accept that this feeds bookings outside the platform (the
answers [6.8]). Today a family reaches a known professional through the search or a past garde
and sends her a request in priority (D-71). Nothing remembers her choice.

### Questions for Jamie

1. Where does the mark sit? Default: on the full profile and on the search card, for a subscribed family.
2. Does « Mes professionnelles » also list the professionals of her past gardes, without a mark? Default: yes, in a second block. The cahier des charges (D-07) asks to find them again.

## Build order

1. favoris-marquer — a family marks and unmarks a professional as a favourite — depends-on: none
2. favoris-liste — « Mes professionnelles » lists her favourites and the professionals of her past gardes, each with « Lui envoyer ma demande en priorité » — depends-on: favoris-marquer

## Out of scope

- A professional's view of who favours her.
- A notification to a favourite when the family publishes a request. The priority request does it on the family's choice.
