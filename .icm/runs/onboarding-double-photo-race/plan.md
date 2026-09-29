# Plan: onboarding-double-photo-race

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The pure decision** — `src/lib/professionnelle/rules.ts` gains a function saying whether a
   recording replaces the profile's other photos (only a `photo` whose outcome is `enregistre`);
   unit tests in `rules.test.ts` for photo recorded, photo `limite`/`doublon`/`echec`, and each
   document kind recorded. — done when: `npm test` passes on the rules file.
2. **The replacement in the lock** — `recordUpload` in `src/lib/professionnelle/uploads.ts`:
   for a photo, a statement after the guarded insert in the same `db.batch`
   (`delete from professional_documents where profile_id = $profile and kind = 'photo' and
   storage_key <> $key and exists (select 1 from professional_documents where storage_key = $key
   and profile_id = $profile)` or a CTE on the insert's `returning`, `returning storage_key`); the
   function returns the outcome **and** the replaced keys (documents: none). Keep the statement
   out of the batch for documents, or make it a no-op. Update the module comment. — done when:
   the photo path deletes other photos only after its own insert wrote, under the same lock.
3. **The action** — `confirmUpload` in `src/app/(portail)/espace/professionnelle/actions.ts`:
   drop `removeDocuments(file, ["photo"])`, delete the returned keys' objects after the batch
   (each failure logged, the answer stays `{ ok: true }`), keep the `updatedAt` touch. —
   done when: nothing in the action reads the pre-upload photo list to decide what to remove.
4. **The proof** — a throwaway script (not committed under `src/`) on a Neon branch of the
   non-production project (`dawn-scene-70949411`, `NEON_API_KEY`; the pattern of
   `onboarding-upload-limit-race`'s proof): seed one profile with one photo, run two photo
   `recordUpload`s in parallel, print the `photo` rows and the returned keys; then seed two photo
   rows and run one. Branch deleted after. — done when: `notes.md` records the command and the
   rows (one `photo` row each time; the returned keys cover every other photo).

## Risks

- The delete placed before the insert, or not conditioned on it, would let a refused or duplicate
  photo wipe her current photo — signal: the "refused photo removes nothing" criterion; test it
  in the proof too (confirm the same key twice).
- A separate delete statement sees the insert's row (same transaction) and any sibling's committed
  photo, never a sibling's uncommitted one: the lock makes the sibling wait. A data-modifying CTE
  on the insert would not see the new row at all, which `storage_key <> $key` tolerates; either
  works, the parallel proof settles it.
- The objects deleted after the commit can fail and leave strays: accepted here (logged),
  fixed in `onboarding-orphaned-objects`.
