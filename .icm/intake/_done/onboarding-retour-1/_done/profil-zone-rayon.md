# Stub: A professional says how many kilometres she accepts around her zone

- feature-slug: profil-zone-rayon
- epic: onboarding-retour-1
- sequence: 7 of 10
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

### Decision (Jamie, 2026-10-28, the defaults of pull request #103)

1. She keeps her one to fifty communes and adds one radius. A commune is reached when its centre
   is within the radius of the centre of one of her communes.
2. The distance is a straight line between two centres, not a road distance.
3. The choices are 0, 10, 20, 30, 40 or 50 km, or « Toute la Belgique ». 0 km means her communes
   only.
4. An existing profile gets 0 km. Nothing changes for her until she picks a radius.
5. The centres come from NGI-IGN AdminVector (below).
6. The urgent e-mail and the daily digest reach her through her radius, the same reach as her
   list of requests.
7. The family's search and the commune pages list her through her radius.
8. Her public page and her full profile show the radius in one line, `@relecture`.
9. A change of radius on a validated profile needs no new review by the founders.
10. The CC BY 4.0 credit goes in the header of the generated file and in the README. The site
    shows no coordinates.

Why one radius around her communes, not a radius around an address: D-11 keeps the zone as
communes, and the family's commune is the key of every match. A centre-to-centre distance needs
one point per commune and no geometry at run time.

### The source of the centres

- **NGI-IGN AdminVector**, layer `municipalcenter`: one point per commune, the official municipal
  centre (the town hall, or else the main church or crossroads). It is not a centre of gravity.
- Licence: Creative Commons Attribution 4.0 (CC BY 4.0), no limitation on public access, per the
  geo.be record `fb1e2993-2020-428c-9188-eb5f75e284b9`.
- Download: `https://ac.ngi.be/remoteclient-open/ngi-standard-open/Vectordata/TerritorialDivisions/TerritorialDivisions-AdminVector/fb1e2993-2020-428c-9188-eb5f75e284b9_x-shapefile_4326.zip`
  (100 MB, WGS 84). A GeoPackage edition exists too. The record's revision date is 2026-07-16.
- Fields of `municipalcenter`: `niscode` (the REFNIS code), `namefre`, `namedut`, `nameger`, and
  a point (PointZ).
- Proof, downloaded on 2026-10-28: 565 points, one per code. 564 codes match
  `src/lib/communes/data.ts`. AdminVector carries Bastogne as `82039`, the code of the 2025
  merger of Bastogne and Bertogne. Our list carries the old `82003`. Parked as
  `triage/communes-bastogne-refnis`.
- Rejected: Eurostat GISCO (its EuroGeographics terms forbid commercial use) and OpenStreetMap
  (ODbL makes the derived table share-alike). Statbel geometry is the fallback: CC BY 4.0, but
  its site blocks scripts and a centre needs a geometry step.

### The reach, measured on the AdminVector centres

| Radius | Communes reached from one commune: median | maximum |
|---|---|---|
| 10 km | 7 | 30 |
| 20 km | 25 | 62 |
| 30 km | 55 | 109 |
| 40 km | 90 | 160 |
| 50 km | 132 | 219 |

The union for one profile is 565 rows at most. Examples: Ixelles to Etterbeek 1.6 km, Ixelles
to Anvers 43.3 km, Ixelles to Liège 87.5 km.

### The plan for `src/lib/communes/`

- `scripts/communes/generate.py` reads `municipalcenter` and writes a second generated file,
  `src/lib/communes/centres.ts`: REFNIS code to `[latitude, longitude]`, five decimals. The
  header names the source and the CC BY 4.0 licence. The script fails on a code that is in one
  list and not in the other.
- `centres.ts` is server-only. The browser bundle does not import it.
- A pure function `communesWithin(communes, km)` returns every code reached, her own codes
  included. The distance is the haversine distance on a sphere of 6371 km.
- The build stubs: `communes-centres` (8), `profil-zone-rayon-saisie` (9), `zone-rayon-lecture`
  (10).

### Read before the cut

`src/lib/communes/`, `scripts/communes/generate.py`, `src/lib/demandes/requests.ts`
(`herListQuery`, `professionalsServing`), `src/lib/reservations/answers.ts` (`servesCommune`),
`src/lib/recherche/professionals.ts` (`servingQuery`).
