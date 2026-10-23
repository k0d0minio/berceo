# Stub: A professional says how many kilometres she accepts around her zone

- feature-slug: profil-zone-rayon
- epic: onboarding-retour-1
- sequence: 7 of 7
- depends-on: none
- complexity: research
- priority: P2

## Problem

Her zone is one to fifty communes (D-11). The founders want, after the communes, the number of
kilometres she accepts to travel around that zone. The devis named a radius of 10 to 50 km or all
Belgium. The commune list has no coordinates today.

## Proposed change

Investigate, then cut. Decide how a radius combines with the communes served, find a source of
commune centroids for Belgium, measure what the search and the professional's request list need,
and write the stubs. Build nothing in this stub.

## Acceptance criteria

- [ ] A written decision under Notes of this stub, approved by Jamie, on how the radius and the communes combine.
- [ ] A source of commune centroids named, with its licence, and a plan to add it to `src/lib/communes/`.
- [ ] One or more stubs cut in this epic for the build, with sequences after this one.

## Out of scope

- A map.
- Building the radius.

## Notes

- Questions, with a default each:
  1. How the radius works. Default: the professional keeps her communes and adds one radius. A
     request in any commune whose centre is within the radius of one of her communes reaches her.
  2. The choices. Default: 0, 10, 20, 30, 40, 50 km, or « toute la Belgique », as the devis
     listed.
  3. The centroids. Default: Statbel's commune geometry (open data), reduced to one centre per
     REFNIS code by `scripts/communes/generate.py`.
- Files to read: `src/lib/communes/`, `scripts/communes/generate.py`, `src/lib/demandes/requests.ts`
  (the professional's list), `src/lib/recherche/`.
