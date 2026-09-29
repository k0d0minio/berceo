# Plan: onboarding-orphaned-objects

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The removal step** — new `src/lib/professionnelle/removals.ts`: `removeFiles(files, deps)`
   with `files: { id, storageKey }[]` and `deps: { deleteObject(key), deleteRows(ids) }`, the
   shape of `src/lib/admin/purge.ts` (no `server-only` import, so the test loads it). Delete each
   object (`Promise.allSettled`), then `deleteRows` once with the ids whose object went; answer
   `{ removed: string[]; failed: string[] }` (a `deleteRows` throw puts those ids in `failed`),
   and `console.error` each failure with the id. Tests in `removals.test.ts` with a recording
   fake: call order, an object failure keeps its row, partial failure over several files, a
   row-delete failure, an object already gone. — done when: the test file passes under `npm test`.
2. **The actions** — `src/app/(portail)/espace/professionnelle/actions.ts`: `removeDocuments`
   becomes a wrapper over pass 1 wiring the real `deleteObject` and
   `db.delete(professionalDocuments).where(and(inArray(id, ids), eq(profileId, profile.id)))`,
   returning the report instead of throwing. `removeFile` calls it with its one file and answers
   `echec` unless `removed` holds it. `confirmUpload`'s photo replacement keeps its try/catch and
   logs when `failed` is not empty. `saveProfile`'s profession change calls it, logs a non-empty
   `failed`, and always goes on to clear the INAMI number; a removal failure no longer returns
   `generique`. Fix the two comments that say "rows, then objects" / "its row, then its object".
   — done when: no path in the file deletes a `professional_documents` row before its object,
   and the answers match the spec's criteria.

## Risks

- `removeDocuments` today receives the whole `ProfessionalFile`; keep the profile scope on the row
  delete so a forged id can never reach another profile's row (`removeFile` already scopes it).
- `saveProfile`'s `try` currently catches the removal's throw and answers `generique`; once the
  removal stops throwing, a real failure of the INAMI update must still answer `generique` —
  check the catch still covers it.
- A test importing `@/db` pulls the Neon client: keep `removals.ts` free of `@/db` (the rows step
  is injected), as `purge.ts` is.
