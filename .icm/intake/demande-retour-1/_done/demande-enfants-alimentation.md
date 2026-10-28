# Stub: A family says how many children, their age and how they are fed

- feature-slug: demande-enfants-alimentation
- epic: demande-retour-1
- sequence: 2 of 6
- depends-on: none
- complexity: medium
- priority: P1

## Problem

The form offers « Un bébé » or « Jumeaux », labels the age « Âge du bébé » and asks nothing about
feeding. The founders want « Triplés » after « Jumeaux », the label « Âge du/des enfants », and a
feeding field with three answers: « allaitement maternel », « lait infantile », « allaitement
mixte ».

## Proposed change

The children field gets a third option, « Triplés ». The age label becomes « Âge du/des
enfants » and its help line agrees in number. A required field « Alimentation du/des enfants »
offers the three answers as radio buttons. The request stores the feeding. The professional's
request card, the request page of both sides and the booking show the children and the feeding.
The e-mails that name the children agree in number.

## Acceptance criteria

- [ ] « Un bébé », « Jumeaux », « Triplés » are the three choices, in that order.
- [ ] The age field is labelled « Âge du/des enfants ».
- [ ] A request cannot be published without one of the three feeding answers.
- [ ] A professional sees the feeding on the request card and on the request page.
- [ ] The migration adds the enum value and the feeding column, and existing requests keep working.
- [ ] `src/lib/demandes/format.test.ts` covers « Triplés de trois mois » and each feeding wording.

## Out of scope

- Allergies, medical conditions or any health data (D-20). The medical checkbox stays as it is.
- The age range (D-64).

## Notes

- `care_request_children` gains `triples`. A new enum `feeding` with `allaitement_maternel`,
  `lait_infantile`, `allaitement_mixte`, and a column on `care_requests`. Drizzle cannot drop an
  enum value, so add only.
- The feeding is a care instruction the professional needs for the night. It is not health data.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/demandes/rules.ts`, `validation.ts`,
  `format.ts`, `requests.ts` (`cardColumns`), `src/components/demandes/request-card.tsx`,
  `src/content/demandes.ts`, `src/content/emails.ts`.
