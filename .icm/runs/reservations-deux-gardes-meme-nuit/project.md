# Project: reservations-deux-gardes-meme-nuit

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/reservations-revue-candidature/reservations-deux-gardes-meme-nuit.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/lib/demandes/**, src/content/demandes.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- No data change on any environment (D-158): a duplicate found by the probe is a STOP, not a fix.
- No new code branch in the writers: publish, edit and `republishGarde` already map a unique violation to « doublon »; the fix is the index.
- `bookings_family_night_idx` stays non-unique (Out of scope).
- The epic's other stubs (`reservations-regles-non-appelees`, `reservations-compte-reponses-une-demande`) own `src/lib/reservations/answers.ts`; this run does not touch it.
- Every word follows D-19; the new text is `@relecture`.

## Context budget

- Define read `src/db/schema.ts` (care_requests), `src/lib/demandes/requests.ts`, `src/lib/gardes/gardes.ts` (republishGarde), the family action files and `src/content/demandes.ts` to confirm every writer of a night maps a unique violation to « doublon ».
