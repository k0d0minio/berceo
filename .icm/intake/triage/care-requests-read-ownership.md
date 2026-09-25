# Stub: Keep `care_requests` reads in `src/lib/demandes/`

- lane: chore
- found-by: cycle-de-garde-et-annulation release review · 2026-09-25
- complexity: low
- priority: P2

## Problem

AGENTS.md routes `care_requests` to `src/lib/demandes/` (« the only reads and writes »), but
`src/lib/gardes/gardes.ts` reads it directly (`republishGarde`'s select; the `from care_requests r`
night guard in `cancelGarde` and `reportAbsence`), and `src/lib/reservations/bookings.ts` already
joined it before. Writes do go through `src/lib/demandes/` (`cancelBookedRequestStatement`).

## Proposed change

Either export the night guard and the republish read from `src/lib/demandes/requests.ts` (as
`cancelBookedRequestStatement` is), or amend the AGENTS.md routing row to say « the only writes »
and name the joins other modules may make. Pick one; no behaviour change.

## Prompt

In the berceo repo, read `.icm/intake/triage/care-requests-read-ownership.md`. Decide with the operator whether `src/lib/demandes/` owns every read of `care_requests` or only its writes; then either move the reads in `src/lib/gardes/gardes.ts` (and `src/lib/reservations/bookings.ts`) behind functions exported from `src/lib/demandes/requests.ts`, or amend the AGENTS.md routing row. Run it through `/pipeline chore care-requests-read-ownership`.
