# Stub: A family gives the address where the night takes place

- feature-slug: demande-adresse-de-la-nuit
- epic: demande-retour-1
- sequence: 4 of 6
- depends-on: none
- complexity: medium
- priority: P1

## Problem

A request carries the family's commune only, copied from her profile (D-63). The exact address is
read from the profile after a confirmed booking (D-15). The founders want the full address on
each request, prefilled from the profile and editable, because the parents may be elsewhere than
at home that night.

## Proposed change

The form shows the address block: rue, numéro, boîte, code postal and localité, prefilled from
the profile. The family can change it for this request. The request stores its own address and
its commune follows that address. Professionals still see the commune only. The address is
revealed to the booked professional after confirmation, from the request and no longer from the
profile. The family can edit the address while the request is open. The profile's address stays
the default for the next request.

## Acceptance criteria

- [ ] « Publier une demande » shows the address prefilled from the profile and lets the family change it.
- [ ] A request published with another commune's address is seen by the professionals of that commune.
- [ ] No response a professional or a visitor receives carries the address before a confirmed booking, and `src/lib/famille/address-guard.test.ts` and the `cardColumns` test hold that.
- [ ] After confirmation, the booked professional sees the request's address, not the profile's.
- [ ] The edit page lets the family change the address of an open request.
- [ ] The migration adds the address columns, and existing requests fall back to the profile's address at the reveal.

## Out of scope

- A map, a distance or a travel time.
- An address check against a postal register beyond the commune list.

## Notes

- Questions, with a default each:
  1. Does the request's commune follow the address? Default: yes, D-63 is superseded. The commune
     and the urgency stay fixed after publication, as today.
  2. Where does the address live? Default: columns on `care_requests` that `cardColumns` never
     selects, read only by `src/lib/famille/` and the reveal in `src/lib/reservations/`.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/demandes/` (validation, requests),
  `src/lib/famille/` (the guard and the reveal), `src/lib/reservations/bookings.ts`,
  `src/app/(portail)/espace/famille/demandes/`, `src/content/demandes.ts`.
