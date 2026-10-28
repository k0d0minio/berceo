# Stub: Requests, e-mails and the search reach a professional through her radius

- feature-slug: zone-rayon-lecture
- epic: onboarding-retour-1
- sequence: 10 of 10
- depends-on: profil-zone-rayon-saisie
- complexity: medium
- priority: P2

## Problem

After `profil-zone-rayon-saisie`, a professional stores a radius and her reached communes. Four
readers still match on her communes only. Her public page and her full profile do not show the
radius.

## Proposed change

Every reader that matches a request or a family to a professional reads her reached communes,
or her « Toute la Belgique » flag. Her public page and her full profile show her radius in one
line.

## Acceptance criteria

- [ ] Her list of requests shows an open request in any commune her radius reaches.
- [ ] She can answer a request in any commune her radius reaches.
- [ ] The urgent e-mail and the daily digest reach her for a request in any commune her radius reaches, once per request.
- [ ] The family's search and the commune page `/garde-de-nuit/[commune]` list her when her radius reaches that commune.
- [ ] With « Toute la Belgique », each of the four readers above matches every commune.
- [ ] With 0 km, each reader matches exactly what it matched before this stub.
- [ ] Her public page and the full profile a family reads show « Se déplace jusqu'à 20 km autour de ses communes », or « Se déplace dans toute la Belgique », and no line at 0 km.
- [ ] The search cards and the commune page cards show the same radius line under her communes.
- [ ] The communes shown on every profile stay her chosen communes, not the reached ones.
- [ ] A test holds each reader against a professional with a radius, one with 0 km and one with « Toute la Belgique ».

## Out of scope

- The neighbouring-zones clause of the search's no-result message (D-124).
- A sort or a filter by distance.
- A map.

## Notes

- The decision is in `.icm/intake/onboarding-retour-1/_done/profil-zone-rayon.md` § Notes:
  decisions 6, 7 and 8.
- The four readers, each reading `professional_communes` today:
  1. `herListQuery` in `src/lib/demandes/requests.ts`.
  2. `servesCommune` in `answerRequest`, `src/lib/reservations/answers.ts`.
  3. `professionalsServing` in `src/lib/demandes/requests.ts`. It returns one row per commune
     served today. Check how the urgent e-mail and the digest group the rows, so a radius never
     sends a request twice.
  4. `servingQuery` in `src/lib/recherche/professionals.ts`.
- Each reader matches `professional_reach.commune_ins`, or `professional_profiles.zone_whole_belgium`.
  Keep the rules each reader holds today: `valide`, not suspended, the priority request.
- `communesOf` (the search's cards), `src/lib/reservations/profiles.ts`, `src/lib/professionnelle/file.ts`
  and `src/lib/admin/accounts.ts` keep reading `professional_communes`: they show her chosen
  communes.
- The public page reads only `teaserColumns` (D-14, D-126). Add the radius and the flag to the
  whitelist. They tell nothing private.
- Words, `@relecture` Surya, in `src/content/recherche.ts` and `src/content/reservations.ts`.
- README → The search and the public pages, and → The care request: the reach.
