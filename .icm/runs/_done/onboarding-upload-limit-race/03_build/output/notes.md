# Build notes: onboarding-upload-limit-race

- commits: `feat: onboarding-upload-limit-race — record uploads under the profile's lock` (6d8e100), the merge of `main` (c72a1b5)
- ci: GREEN on c72a1b5 — full gate: Vercel preview pass, Quality (advisory) pass; `format.sh` / `lint.sh` not wired here (SKIP); `env.sh audit --changed` OK; `security-check.sh --branch` OK

## What changed

- `src/lib/professionnelle/rules.ts`: `RecordOutcome` and two pure functions — `recordOutcome`
  (the guard's result → recorded / over the limit / key already recorded) and `recordAnswer`
  (outcome → the answer and whether the uploaded object is deleted).
- `src/lib/professionnelle/rules.test.ts`: one test per outcome, written from the criteria.
- `src/lib/professionnelle/uploads.ts` (new, server-only): `recordUpload` — one `db.batch`
  (one transaction): `select … for update` on the profile row, the guarded
  `insert … select … where not exists (key) and (photo or count(kind) < 3) returning id`, then a
  read of whether the key is recorded. Any error answers `echec`.
- `src/app/(portail)/espace/professionnelle/actions.ts`: `confirmUpload` calls `recordUpload`
  in place of the lone `db.insert` and answers through `recordAnswer`; a key already recorded
  returns `echec` without reaching `discard`. The pre-checks and the photo's replacement step
  after the insert are unchanged.

## Acceptance criteria status

- [x] Two parallel confirms for the last slot end with three rows, one `enregistre` and one
  `limite` (→ `nombre`, object deleted by `discard`) — proof below, 10 of 10 rounds.
- [x] Two parallel confirms of one key end with one row; the loser is `doublon` (→ `echec`,
  object kept) — proof below, 10 of 10 rounds.
- [x] A single upload, a photo and the pre-check refusals behave as before: the pre-checks are
  untouched; a fourth file alone is `limite` → `nombre` as `checkUpload` answered before; the
  photo records under the lock with no count.
- [x] Two profiles at once do not wait on each other: both recorded in one parallel call (127 ms
  for the pair); the lock is one `professional_profiles` row.
- [x] The mapping is pure, in `rules.ts`, with a unit test per outcome; only `limite` and
  `echec` delete.
- [x] Proven on a Neon branch of the non-production project — below.

### The proof (2026-09-28)

`run/onboarding-upload-limit-race` in `dawn-scene-70949411` (`db-branch.sh … up`, a child of the
UAT database, released with `down` after). Throwaway probes run with
`npx tsx --conditions=react-server scripts/.probe-upload-limit.mts` and deleted before the commit;
the probe called the shipped `recordUpload`, fixtures were fresh users and profiles, 10 rounds each:

```
control (old read-then-insert): 9/10 rounds ended over three
limit: 10× enregistre+limite → 3 rows
same key: 10× doublon+enregistre → 1 row(s) for the key
fourth file alone: limite → 3 rows
two profiles at once: enregistre + enregistre in 127 ms; photo rows 1
```

And a guarded `insert … select … where count < 3` **without** the lock, same shape:
`7/10 rounds ended over three` — the spec's run D-1 (the lock, not the guard alone) holds.

## Notes for Release

- One file beyond `touches:`: `src/lib/professionnelle/uploads.ts` (run D-3). README / AGENTS.md
  routing for the professional's onboarding names `src/lib/professionnelle/` already; the new
  module may deserve a word there.
- `onboarding-double-photo-race` (2 of 3) builds on `recordUpload`'s lock: the photo already takes it.
- The unit tests were written, not run (local test runs are the factory's): the advisory job reads them.

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on c451452 (ci-status.sh), re-read after the last push below
- reviews: code medium — no findings · security security-check.sh --branch --audit: OK · /security-review n/a (no auth, payments, route policy or new PII path; the key-ownership check is unchanged) · /production-readiness n/a (skill not installed here; the DB change is one guarded insert with no schema change, proven on a Neon branch) · readiness env.sh audit --changed: OK
- parked: none
- migrations: skip — none of this run's own
- learned: skip — no error.log (2 rules from FAILURE.md reach project-rules.md through close-out)
- docs: README.md (The professional's onboarding and documents → the locked recording), AGENTS.md (routing row names `uploads.ts`) · announce: deferred to promotion
