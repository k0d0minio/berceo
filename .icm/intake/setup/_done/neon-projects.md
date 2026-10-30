> Done: automated setup session (neonctl), 2026-10-30

# Setup: the Neon projects

- setup-slug: neon-projects
- needs: database neon
- where: the Neon console → the organisation

## Why

Production's data lives in `berceo`. Every other deployment reads `uat-berceo`, so
production's data never reaches a preview.

## Steps

1. In the Neon console, open the client's organisation.
2. Make the project `berceo` for production, in the region nearest to the Vercel functions.
3. Make the project `uat-berceo` for UAT, in the same region.
4. Put test data only in `uat-berceo`. Never copy production's rows into it.
5. Compare the project names with the column `Database` of `.icm/environments.md`.
   If a name is different, correct the column.

## Done when

- [x] The project `berceo` exists.
- [x] The project `uat-berceo` exists, with test data only.
- [x] The column `Database` of `.icm/environments.md` names `berceo` and `uat-berceo`.

## Notes

2026-10-30: `neonctl projects list` (Kodominio org) shows both projects: `berceo`
(`tiny-cell-08223046`, `aws-eu-central-1`, created 2026-09-23) and `uat-berceo`
(`dawn-scene-70949411`, `aws-eu-central-1`, created 2026-09-24), same region. `.icm/environments.md`
already names `the default branch of the Neon project berceo` and `uat-berceo` in the
`Database` column (filled by #125, 2026-10-29). "Test data only" in `uat-berceo` is a
standing discipline, not a one-off check: this session added no rows to either project and
found none to audit; take Jamie's word that no production row was ever copied in.
