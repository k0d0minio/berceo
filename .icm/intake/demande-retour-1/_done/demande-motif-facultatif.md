# Stub: A family may say why she asks for a night of care

- feature-slug: demande-motif-facultatif
- epic: demande-retour-1
- sequence: 5 of 6
- depends-on: none
- complexity: medium
- priority: P2

## Problem

The form has no free text (D-20). The founders want one optional question: « Pourquoi
souhaitez-vous être accompagné(e) la nuit ? », with a help line and a notice that asks for no
medical or sensitive data. Jamie approved it on 2026-10-23, with the Spec approved gate.

## Proposed change

An optional field « Pourquoi souhaitez-vous être accompagné(e) la nuit ? » at the end of the
form, 300 characters at most, with the founders' help line: « Vous pouvez nous expliquer en
quelques mots ce qui vous amène à faire appel à une garde de nuit : besoin de repos, besoin de
relais, nuits particulièrement difficiles, reprise du travail, arrivée de plusieurs bébés, etc. »
and the notice: « Cette question est facultative. Merci de ne pas communiquer d'informations
médicales ou de données sensibles. » The request stores the text. A professional reads it on the
request page, not on the card and not in an e-mail. The founders read it on the request in the
back-office. The family can edit it while the request is open.

## Acceptance criteria

- [ ] The field is optional, 300 characters at most, with the help line and the notice as written.
- [ ] A professional sees the text on `/espace/professionnelle/demandes/[id]` and nowhere else.
- [ ] The text is in no request card, no digest and no urgent e-mail.
- [ ] The founders see it on the request in `/admin/demandes`.
- [ ] The migration adds the nullable column.

## Out of scope

- Moderation or filtering of the text. The founders act on a report.
- Any other free text on the request.

## Notes

- Questions, with a default each:
  1. Who reads it? Default: the professionals who see the request, and the founders.
  2. Does it reach the professional's e-mail? Default: no.
  3. The limit. Default: 300 characters, like the profile's context line.
- D-20 is superseded for this one field. The notice is the founders' and stays as written, tagged
  `@relecture Surya — texte des fondatrices`.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/demandes/` (validation, requests),
  `src/app/(portail)/espace/famille/demandes/`, `espace/professionnelle/demandes/[id]`,
  `src/app/(portail)/admin/demandes/`, `src/content/demandes.ts`.
