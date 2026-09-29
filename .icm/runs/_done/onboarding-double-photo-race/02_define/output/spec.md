# Spec: Two photo uploads at once leave one photo on her profile

- slug: onboarding-double-photo-race
- personas: professionnel
- touches: src/lib/professionnelle/uploads.ts, src/app/(portail)/espace/professionnelle/actions.ts, src/lib/professionnelle/rules.ts, src/lib/professionnelle/rules.test.ts
- complexity: standard

## Problem

A professional's photo is one file: `confirmUpload`
(`src/app/(portail)/espace/professionnelle/actions.ts`) records the new photo, then removes the
photos it read **before** the upload (`removeDocuments(file, ["photo"])` on the pre-upload
`loadFile`). Two photo confirms in flight (a quick second pick, a double submit) each remove only
the original and keep their own, so the profile holds two `photo` rows and two objects. The pages
show the latest by `uploaded_at` (`photoId` in `src/lib/reservations/answers.ts`), but the
founders' file view lists both, the stray object stays in the private bucket, and "her photo" is no
longer one file.

Her photo is part of Plateforme Berceo V1's professional onboarding, the file the founders verify
and the face families see once she is validated. This is the second of the three concurrency fixes
of the epic `onboarding-fichiers-concurrence`; it builds on the per-profile lock that
`onboarding-upload-limit-race` (k0d0minio/berceo#53, its run D-1) added in `recordUpload`.

## Proposed change

The photo's replacement moves inside the locked recording, and reads the other photos there
rather than before the upload.

- **In the lock.** `recordUpload` (`src/lib/professionnelle/uploads.ts`) already runs one
  `db.batch` whose first statement locks the profile row (`for update`). For a photo, the same
  batch gains a statement after the guarded insert: delete every `photo` row of the profile whose
  storage key is not the new one, returning their storage keys. The second of two parallel
  confirms waits on the lock, then its delete sees the first's committed photo and removes it:
  **the last confirm to commit wins**, and exactly one `photo` row remains.
- **Only when recorded.** The delete runs only if the insert wrote (a refused or duplicate
  recording removes nothing). For documents the statement is not issued, or is a no-op; the
  three-files guard is untouched.
- **The objects after the commit.** `recordUpload` returns, with the outcome, the storage keys of
  the photo rows it deleted; the action deletes those objects after the batch, logging a failure
  and still answering `{ ok: true }` (the new photo is recorded, as today). The object-before-row
  order for removals is `onboarding-orphaned-objects` (3 of 3), not this run.
- **The action.** `confirmUpload` drops its `removeDocuments(file, ["photo"])` call; it keeps the
  `updatedAt` touch of the profile. `removeDocuments` stays for its other callers.
- **The pure part.** Anything that decides (whether the delete applies to a kind and outcome) sits
  in `src/lib/professionnelle/rules.ts` with its unit tests, as run D-1's mapping does; the batch
  itself stays in `uploads.ts`.

No schema change, no migration, no unique index (operator's choice in Define, run D-1 below).
Profiles that already hold two photo rows are left as they are: the pages already show the latest,
and her next photo upload removes every other row (run D-2).

## Acceptance criteria

- [ ] Two `confirmUpload` calls for photos of the same profile, run in parallel when it holds one
  photo, end with exactly one `photo` row (the confirm that committed last) and its object in the
  bucket; the other two objects (the original and the losing new one) are gone; both confirms
  answer `{ ok: true }`.
- [ ] A single photo upload on a profile holding **two** photo rows ends with exactly one `photo`
  row, the new one, and the two older objects deleted.
- [ ] A single photo upload on a profile with no photo, a document upload, and every refusal
  (pre-checks, the three-files limit, a key already recorded) behave exactly as before: same
  answers, same rows, same objects kept or deleted; a refused photo removes no existing photo.
- [ ] When deleting a replaced photo's object fails, the confirm still answers `{ ok: true }`, the
  new photo is the only `photo` row, and the failure is logged.
- [ ] The kind-and-outcome decision is a pure function in `src/lib/professionnelle/rules.ts`
  covered by unit tests (photo recorded → replace; photo refused or duplicate → keep; document →
  never replace).
- [ ] The two parallel cases above are proven against a Neon branch of the non-production project
  (not UAT's or production's database) by a script run in Build that calls the shipped
  `recordUpload`, and the run's `notes.md` records the command and the resulting rows.

## Out of scope

- The delete order (object before row) and keeping the row when an object delete fails, in
  `removeDocuments` / `removeFile` and for the replaced photo's objects —
  `onboarding-orphaned-objects` (3 of 3), which must now also cover `recordUpload`'s returned keys.
- A partial unique index holding one photo per profile (run D-1).
- A data cleanup of profiles that already hold two photo rows, or of stray photo objects (run D-2).
- The status checks (`isEditable`, `changeNeedsReview`) read before the lock, as in #53.

## Open questions

- none

Context budget: the Define map points at the cahier des charges in icm-board, which this cloud
session cannot reach; the personas and touches were taken from the stub, the prior run's spec and
a few greps of the actions and uploads files instead.
