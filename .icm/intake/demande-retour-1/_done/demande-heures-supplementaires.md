# Stub: A family asks for hours beyond the 11-hour night

- feature-slug: demande-heures-supplementaires
- epic: demande-retour-1
- sequence: 3 of 6
- depends-on: none
- complexity: medium
- priority: P1

## Problem

A request has a start time and the night ends 11 hours later. The founders want extra hours: a
night that starts at 19:00 ends at 06:00, unless the family asks for two extra hours, and then it
ends at 08:00. The professional prices the 11 hours at her night rate and each extra hour at her
hourly rate.

## Proposed change

The form gets « Heures supplémentaires », 0 to 6 whole hours, default 0, under « Heure de
début », with the line « La garde de nuit standard est de 11 heures. » The request stores the
extra hours. The end of the night is start plus 11 hours plus the extra hours, computed in one
place and read by every screen, e-mail and job that names the night's end: the request card, the
request pages, the booking, the garde's states, the conversation's closing, the reminder of the
day before, the rating invitation. The booking shows the night rate for 11 hours and, when there
are extra hours, the professional's hourly rate and the number of hours. The family pays the
professional directly, as today.

## Acceptance criteria

- [ ] A family publishes a request with 0 to 6 extra hours and the card shows « de 19h00 à 8h00 » for two extra hours from 19:00.
- [ ] A value outside 0 to 6, or a half hour, is refused with a message at the field.
- [ ] The garde's states, the conversation's closing and the rating invitation use the night's end with the extra hours.
- [ ] The booking page of both sides shows the extra hours and, when her file carries it, the professional's hourly rate.
- [ ] The migration adds the column with default 0, and existing requests keep an 11-hour night.
- [ ] `src/lib/demandes/rules.test.ts` covers the night's end with 0 and with 2 extra hours.

## Out of scope

- The professional's hourly rate field in her file (`onboarding-retour-1/profil-tarifs`). Until it
  ships, the booking shows the hours only.
- A change to the 3 % fee, which stays on the night rate (the devis).

## Notes

- Question, with a default: the maximum of extra hours. Default: 6, so a night never runs past
  the afternoon.
- The night's end is computed today in `src/lib/demandes/rules.ts` (`gardes-shared-helpers`
  moved `hasNightEnded` there). Give it the extra hours and let no other file add 11 hours.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/demandes/` (rules, validation, format,
  `cardColumns`), `src/lib/gardes/`, `src/lib/messagerie/`, `src/lib/avis/`,
  `src/lib/reservations/bookings.ts`, `src/components/demandes/request-card.tsx`,
  `src/content/demandes.ts`, `src/content/reservations.ts`, `src/content/emails.ts`.
