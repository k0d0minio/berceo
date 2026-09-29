# Tasks: onboarding-double-photo-race

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] Two `confirmUpload` calls for photos of the same profile, run in parallel when it holds one
- [x] A single photo upload on a profile holding **two** photo rows ends with exactly one `photo`
- [x] A single photo upload on a profile with no photo, a document upload, and every refusal
- [x] When deleting a replaced photo's object fails, the confirm still answers `{ ok: true }`, the
- [x] The kind-and-outcome decision is a pure function in `src/lib/professionnelle/rules.ts`
- [x] The two parallel cases above are proven against a Neon branch of the non-production project

## Queue

- [x] `replacesPhotos` and its tests in `src/lib/professionnelle/rules.ts` / `rules.test.ts` (59eccb1)
- [x] `recordUpload` deletes the other photos in the locked insert and returns their keys (59eccb1)
- [x] `confirmUpload` deletes the returned objects after the commit, drops the pre-upload removal (59eccb1)
- [x] The proof on a Neon branch of the non-production project, in `notes.md`
- [ ] Merge `main`, flip ready, settle the full gate
