# Build notes: onboarding-orphaned-objects

- commits: b9d8c09 feat — the removal step, its tests, the three paths wired onto it
- ci: GREEN on c57200a — Vercel preview pass, Quality (advisory) pass (ESLint, tsc, vitest incl. removals.test.ts)

## What changed

- `src/lib/professionnelle/removals.ts` (new): `removeFiles(files, { deleteObject, deleteRows })`
  deletes every object (`Promise.allSettled`), then the rows of exactly the files whose object
  went, in one statement; answers `{ removed, failed }` and logs each failure. No `@/db` or
  `server-only` import, like `src/lib/admin/purge.ts`, so the test loads it.
- `src/lib/professionnelle/removals.test.ts` (new): written from criterion 2 — order, object
  failure keeps the row, partial failure over three files, row failure after the objects went,
  retry over an object already gone, no files.
- `src/app/(portail)/espace/professionnelle/actions.ts`: `removeDocuments(profileId, files)` wires
  the real `deleteObject` and a row delete scoped to the profile (`id in … and profile_id = …`);
  `documentsOf(file, kinds)` picks the files. `removeFile` answers `echec` unless its file is in
  `removed`. The photo replacement and the profession change log a non-empty `failed` and carry
  on: the profession change still clears the INAMI number and answers a successful save (run
  D-2). The catch after an upload now only covers the `updatedAt` touch, and its log says so.

## Acceptance criteria status

- [x] Object before row on all three paths, a row only after its own object — every path goes
  through `removeFiles`; no other `professional_documents` delete remains in `actions.ts`.
- [x] Unit tests with injected storage and row deletion — `removals.test.ts`, one case per
  clause of the criterion (read by the advisory quality job after the flip).
- [x] `removeFile` with a failed object delete answers `echec` and keeps the row; the retry
  removes both — the row stays because `deleteRows` is never called with its id; the retry case
  is the last-but-one test.
- [x] A photo upload whose old photo cannot be deleted answers `{ ok: true }`, keeps the row,
  logs — `removeFiles` never throws, the answer after `recordUpload` is unchanged.
- [x] A profession change whose stale documents cannot be deleted answers a successful save,
  keeps the rows, clears the INAMI number, logs — the removal no longer throws into the `catch`
  that answered `generique`; the INAMI update after it still runs and a failure of that update
  still answers `generique`.
- [x] Removals with no failure behave as today — same answers; the same rows and objects go,
  only the order changed.

## Notes for Release

- Criteria 3 to 5 are proven by reading and by the unit tests on the shared step, not by a run
  against a real bucket with storage made to fail; the preview smoke can only exercise the
  no-failure path (criterion 6).
- `AGENTS.md`'s routing row for the onboarding names `src/lib/professionnelle/` as "rules,
  `uploads.ts`"; Release may add `removals.ts` (the only delete of a file row outside the purge
  and the account deletion) there and in the README's onboarding section.
- The `type:feature` label comes from `new-run.sh`; the stub was a bug.

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on the head that merged (ci-status.sh, after the last push)
- reviews: code medium — no findings · security security-check.sh --branch --audit: OK + /security-review — no findings (the removals only ever take keys from her own loaded file; the row delete is now profile-scoped) · readiness env.sh audit --changed: OK · /production-readiness n/a — no DB schema, auth, payments or env change, and the skill is not shipped in this repo
- parked: none at Release (Define parked onboarding-remove-last-file-race.md)
- migrations: skip — none of this run's own
- learned: skip — no error.log
- docs: README.md (the onboarding's documents paragraph), AGENTS.md (routing row names removals.ts) · announce: deferred to promotion
