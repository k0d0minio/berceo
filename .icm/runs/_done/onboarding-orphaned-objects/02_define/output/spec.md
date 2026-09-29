# Spec: A removed or replaced file never stays in the bucket without its row

- slug: onboarding-orphaned-objects
- personas: professionnel
- touches: src/app/(portail)/espace/professionnelle/actions.ts, src/lib/professionnelle/removals.ts, src/lib/professionnelle/removals.test.ts
- complexity: standard

## Problem

`removeDocuments` and `removeFile` (`src/app/(portail)/espace/professionnelle/actions.ts`) delete
the `professional_documents` row first and the bucket object second. When the object delete fails
(the store unreachable, a credential rotated), the diploma, attestation or photo stays in the
private bucket with no row pointing at it. Nothing finds it again: the 30-day purge of refused
files (`src/lib/admin/purge.ts`, D-41, D-55) and the account deletion (`src/lib/admin/accounts.ts`,
D-137) both start from the rows, so the retention rule is silently broken for that file, on
personal documents the platform promised to erase. The professional also sees an error although
the row is already gone.

Three paths reach the defect: removing one file from the file-slot (`removeFile`), the old photo
replaced by a new upload (`confirmUpload` → `removeDocuments`), and the documents a new
profession no longer asks for (`saveProfile` → `removeDocuments`). Both erasure paths that exist
already delete the object first (`purge.ts`, `accounts.ts`); the professional's own removals are
the odd ones out. This is 3 of 3 of the epic `onboarding-fichiers-concurrence`, independent of
the other two (a different pair of functions), and hardens Plateforme Berceo V1's professional
onboarding.

## Proposed change

Every removal of a professional's file deletes the bucket object first and the row second, per
file, and a row is deleted only once its own object is gone.

- **One removal step, with its storage and database injected.** A new
  `src/lib/professionnelle/removals.ts` takes the files to remove (`{ id, storageKey }[]`) and two
  injected steps (delete an object, delete rows by id), the shape `purge.ts` uses, so the tests
  hold the order without a bucket or a database; the actions wire the real `deleteObject` and a
  `db.delete(professionalDocuments)` scoped to the profile. For each file it deletes the object;
  then it deletes, in one statement, the rows of exactly the files whose object delete succeeded.
  It answers which files were removed and which were not, and logs each failure.
- **A failed object delete keeps its row.** The file stays on her file, referenced, so the purge
  and the account deletion still find it, and a retry is safe (deleting an object that is already
  gone is not an error, `src/lib/documents/storage.ts`).
- **A failed row delete after the object went** leaves a row whose object is gone; the removal
  answers it as not removed. Her retry deletes the (already missing) object without error and then
  the row. This is the accepted direction of failure: a dangling row is visible and retried, an
  orphaned object is invisible.
- **`removeFile`** (the file-slot's « Retirer »): all of its checks unchanged; the file removed →
  `{ ok: true }`; not removed (object or row failure) → `{ ok: false, error: "echec" }` (the
  catalogue's existing « L'envoi n'a pas abouti. Réessayez dans un instant. »), and on an object
  failure the row, and so the file in her slot, is still there.
- **The photo replaced by a new upload** (`confirmUpload`): unchanged answers. The new photo is
  recorded first, as today; the old photo is then removed through the same step. An old photo
  that could not be removed keeps its row and the failure is logged; the upload still answers
  `{ ok: true }`. (Two photo rows can then coexist until the next replacement; keeping exactly one
  photo is `onboarding-double-photo-race`, 2 of 3.)
- **The documents a new profession no longer asks for** (`saveProfile`, decided at Define): the
  profile has already committed, so a removal failure no longer turns the answer into an error.
  The documents that could not be removed keep their rows, the failure is logged, the INAMI number
  is still cleared when the new profession has none, and she gets the normal answer
  (« enregistré », or the move on to step 3 with « continuer »). Documents of a kind her
  profession does not ask for do not block submission (`missingDocuments` counts only the
  required kinds).
- The comments that describe the order ("rows, then objects", "its row, then its object") are
  corrected.

No schema change, no migration, no new catalogue text.

## Acceptance criteria

- [ ] For every removal path (`removeFile`, the photo replacement in `confirmUpload`, the
  profession change in `saveProfile`), the bucket object of a file is deleted before its
  `professional_documents` row, and a row is deleted only after its own object delete succeeded.
- [ ] Unit tests in `src/lib/professionnelle/removals.test.ts`, with injected storage and row
  deletion, prove: the call order is object then row; an object failure keeps that file's row and
  reports it not removed; with several files and one object failure, only the other files' rows
  are deleted; a row-delete failure after the objects went reports the files not removed; removing
  a file whose object is already gone deletes its row.
- [ ] `removeFile` whose object delete fails answers `echec` and the file is still listed on her
  file afterwards; the same call once storage is back removes both the object and the row.
- [ ] A photo upload whose old photo's object cannot be deleted still answers `{ ok: true }`, keeps
  the old photo's row, and logs the failure.
- [ ] A profession change whose stale documents' objects cannot be deleted answers as a successful
  save (« enregistré », or the redirect to step 3), keeps those rows, still clears the INAMI number
  when the new profession has none, and logs the failure.
- [ ] Removals that meet no failure behave exactly as today: same answers, same rows and objects
  gone.

## Out of scope

- Keeping exactly one photo per profile under concurrent uploads, and the two photo rows an old
  photo's failed removal can leave: `onboarding-double-photo-race` (2 of 3).
- A sweep that finds objects already orphaned in the bucket by the old order (no row to start
  from): not built here; the bucket can be listed by hand under `profils/<profile-id>/` if the
  founders want past orphans found.
- The read-then-delete race on the "last file" rule in `removeFile` (two removals at once of a
  submitted profile's last two files of a kind can both pass the `<= 1` check): parked as the
  triage stub `onboarding-remove-last-file-race`.
- The purge and the account deletion: they already delete objects first.

## Open questions

- none

Context budget: the Define map points at the cahier des charges in icm-board, which this cloud
session cannot reach; the personas and touches were taken from the stub, `AGENTS.md` and a few
greps of the actions file, `purge.ts`, `accounts.ts` and `storage.ts` instead.
