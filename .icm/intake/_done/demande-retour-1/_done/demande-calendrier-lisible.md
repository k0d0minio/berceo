# Stub: A family picks the night's date in a calendar she can read on her phone

- feature-slug: demande-calendrier-lisible
- epic: demande-retour-1
- sequence: 1 of 6
- depends-on: none
- complexity: low
- priority: P2

## Problem

On « Publier une demande », the calendar under « Date de la garde » opens too small. The founders
could not read it on their phone.

## Proposed change

The calendar opens at a size a thumb can use: the month fills the width of a phone screen, each
day cell is at least 40 px tall and wide, the month name and the weekday initials are readable
without zoom. On a desktop it keeps today's size. The same calendar serves the edit page and the
urgent request.

## Acceptance criteria

- [ ] On a 390 × 844 phone, the calendar fills the width of the form and each day cell is at least 40 × 40 px.
- [ ] The month name, the weekday initials and the selected day are readable at the phone's default zoom.
- [ ] The calendar still refuses the dates outside the window (D-60) and keeps today's keyboard access.
- [ ] `/espace/famille/demandes/nouvelle`, `/nouvelle?urgente=1` and `/[id]/modifier` all use it.

## Out of scope

- Any other field of the form.
- A calendar that picks several nights (`demande-nuits-regulieres`).

## Notes

- The date field is in `src/app/(portail)/espace/famille/demandes/nouvelle/page.tsx` and the
  shared form component it uses. The calendar is a shadcn component in `src/components/ui/`,
  retuned to the DA. Measure at 320, 390, 768 and 1440 px on the preview.
