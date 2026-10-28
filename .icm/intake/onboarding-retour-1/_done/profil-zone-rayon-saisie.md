# Stub: A professional chooses how many kilometres she travels around her communes

- feature-slug: profil-zone-rayon-saisie
- epic: onboarding-retour-1
- sequence: 9 of 10
- depends-on: communes-centres
- complexity: medium
- priority: P2

## Problem

Her zone is one to fifty communes (D-11). The founders want her to add how far she travels
around them (feedback round 1). The profile step has no field for it, and the schema has no
column.

## Proposed change

Under « Ma zone d'intervention », she picks one radius: her communes only, 10, 20, 30, 40 or
50 km, or « Toute la Belgique ». Each save of her zone also stores every commune that her radius
reaches. Nothing reads the reached communes yet.

## Acceptance criteria

- [ ] The profile step shows one radius field under her communes, with seven choices: « Uniquement mes communes », 10 km, 20 km, 30 km, 40 km, 50 km and « Toute la Belgique ».
- [ ] A new profile and every existing profile start at « Uniquement mes communes » (0 km).
- [ ] A save stores her radius on her profile.
- [ ] A save stores her reached communes in one table, in the same batch as her communes.
- [ ] With 0 km, her reached communes equal her communes.
- [ ] With « Toute la Belgique », the table holds no reached commune and her profile carries the flag.
- [ ] A value outside the seven choices is refused by the server and by a database check.
- [ ] A change of radius on a validated profile keeps her profile `valide`.
- [ ] Her file page, step by step, and the founders' file page show her radius.
- [ ] One migration adds the column, the flag and the table, and fills the reached communes of each existing profile with her communes.

## Out of scope

- Every reader that matches a request or a family: `zone-rayon-lecture`.
- The radius on her public page and on the full profile a family reads: `zone-rayon-lecture`.
- A recompute of every profile when a new edition of the centres arrives. Cut it when that
  edition arrives.
- A map.

## Notes

- The decision is in `.icm/intake/onboarding-retour-1/_done/profil-zone-rayon.md` § Notes.
- Schema: `professional_profiles.zone_radius_km` smallint not null default 0, checked in
  (0, 10, 20, 30, 40, 50). `professional_profiles.zone_whole_belgium` boolean not null default
  false. A new table `professional_reach (profile_id, commune_ins)`, primary key on both, an
  index on `commune_ins`, rows removed with the profile. Run
  `npm run db:generate -- --name zone-rayon` and commit `drizzle/`.
- The reached communes come from `communesWithin` (`communes-centres`). The server computes them.
  The browser never does.
- Write the reach in the batch that writes `professional_communes` in
  `src/app/(portail)/espace/professionnelle/actions.ts` (why: the communes and the reach move
  together).
- The account deletion in `src/lib/admin/accounts.ts` removes her reach rows with her communes.
- Words, all `@relecture` Surya, in `src/content/professionnelle.ts`:
  - label « Jusqu'où vous déplacez-vous autour de vos communes »
  - help « La distance se mesure à vol d'oiseau, du centre de chaque commune. »
  - the seven choices above.
- The radius changes no review (decision 9). Do not reopen her file.
- README → The professional's onboarding, « Her zone »: the radius, the column, the table.

### Decisions (Jamie, 2026-10-28, the defaults of pull request #108)

1. The radius shows as seven radio buttons, like the profession field.
2. « Toute la Belgique » stores 0 in `zone_radius_km`. A database check holds the radius at 0
   while the flag is set.
3. The communes, the radius and the reach save as one unit. An error on the communes or on the
   radius keeps all three as they were.
4. The account deletion resets the radius to 0 and the flag to false.
5. The founders' account page (`/admin/utilisateurs/[id]`) shows the radius too.
6. Bastogne: accepted as it is. `centres.ts` already maps AdminVector's `82039` to our `82003`.
