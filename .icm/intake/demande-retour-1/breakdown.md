# Breakdown: The care request after feedback round 1

- epic-slug: demande-retour-1
- source: the founders' feedback round 1 (Drive, `feedback-round-1.pdf`, 2026-10-23), section « Lorsque je suis une famille et que je publie une demande »

## What I understood

The founders published a request on UAT and found the form short of what they answered in the
questionnaire. The date picker opens too small. The request must carry the night's full address,
prefilled from the profile and editable, because the night can take place elsewhere. A night is
11 hours, and the family must be able to add extra hours, which the professional prices at her
hourly rate. The children field needs triplets, the age label must say « âge du/des enfants »,
and the feeding of the children (breast, formula, mixed) must be asked. A request is one-off or
regular, and a regular one picks its nights in a calendar for the month that follows at most. An
optional question asks why the family wants a night of care, with a notice to give no medical
data. Jamie decided on 2026-10-23 that a feedback request supersedes an earlier requirement, so
D-15 (no address on the request), D-20 (no free text), D-63 (the commune from the profile) and
D-65 (one request per night) bend where a stub below says so. The address stays hidden from
professionals until a booking is confirmed.

Questions for Jamie, with a default each:

1. The « mois qui suit » of a regular request: the end of next calendar month, or 31 days from
   today? Default: the end of next calendar month.
2. Does a professional answer a regular request night by night, or as a series? Default: night
   by night. A series is one request per night with a shared series id.
3. Does the request's commune follow the night's address when the family changes it? Default:
   yes. The professionals of that commune see it.

## Build order

1. demande-calendrier-lisible — the date picker opens at a readable size on a phone — depends-on: none
2. demande-enfants-alimentation — triplets, the children's age label, the feeding field — depends-on: none
3. demande-heures-supplementaires — extra hours beyond the 11-hour night, and the night's end everywhere — depends-on: none
4. demande-adresse-de-la-nuit — the night's full address on the request, hidden until confirmation — depends-on: none
5. demande-motif-facultatif — the optional « Pourquoi souhaitez-vous être accompagné(e) la nuit ? » — depends-on: none
6. demande-nuits-regulieres — one-off or regular, the nights picked in a calendar for the month that follows — depends-on: demande-heures-supplementaires, demande-adresse-de-la-nuit

## Out of scope

- The professional's hourly rate for extra hours in her file: `onboarding-retour-1/profil-tarifs`.
- A change to the fee rule, the cancellation rule or the digest's timing.
- Health data on the request. The feeding is a care instruction. The optional reason carries the
  founders' notice.
