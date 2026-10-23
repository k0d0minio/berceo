# Stub: A family asks for one night or for regular nights

- feature-slug: demande-nuits-regulieres
- epic: demande-retour-1
- sequence: 6 of 6
- depends-on: demande-heures-supplementaires, demande-adresse-de-la-nuit
- complexity: high
- priority: P1

## Problem

A request is one night. The founders want the family to choose « nuits ponctuelles » or « nuits
régulières ». For regular nights she picks every night she wants in a calendar, for the month
that follows at most. The devis promised a simple recurrence.

## Proposed change

The form asks « Nuit ponctuelle » or « Nuits régulières ». For regular nights, a calendar lets
the family tick each night up to the end of next month. One request is created per night, with
the same start time, extra hours, children, feeding, address and reason, and a shared series id.
The family's list groups the series and shows each night's state. A professional sees each night
as a request of its own and answers night by night. The family cancels one night or the whole
series. The daily digest carries the series as one line with its nights.

## Acceptance criteria

- [ ] A family publishes regular nights by ticking dates in a calendar, up to the end of next month.
- [ ] Each night is a request with the same details and a shared series id, and the one-request-per-night rule (D-65) still holds.
- [ ] A professional answers one night and the other nights stay open.
- [ ] The family cancels one night of the series, or the series, from « Mes demandes ».
- [ ] The digest shows a series as one line with its nights.
- [ ] A one-off request behaves as today.

## Out of scope

- Answering a whole series at once. A later stub may add it.
- Weekly patterns (« tous les lundis »). The family ticks the nights.
- A recurring urgent request.

## Notes

- Questions, with a default each:
  1. « Le mois qui suit »: the end of next calendar month, or 31 days from today? Default: the end
     of next calendar month. D-60's day-56 window is superseded for a series.
  2. Night by night, or as a series? Default: night by night.
  3. Does the digest carry one line per series or one per night? Default: one per series.
  4. The maximum of nights in a series. Default: 31.
- A series id on `care_requests`, nullable. The publish action inserts the nights in one
  transaction. The priority request to a known professional (D-71) applies to the series.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/demandes/` (rules, validation, requests,
  notify), `src/app/(portail)/espace/famille/demandes/`, `espace/professionnelle/demandes/`,
  `src/components/demandes/`, `src/content/demandes.ts`, `src/content/emails.ts`.
