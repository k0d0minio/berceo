# Breakdown: Onboarding file uploads under concurrency

## What was understood

Three findings from the onboarding-professionnelle and verification-back-office release
reviews (2026-09-24 and -25) are the same read-then-write race and its sibling, all in
`src/app/(portail)/espace/professionnelle/actions.ts`: `confirmUpload` reads the
three-files-per-document count, and separately reads "the photos before this upload",
before inserting — so two uploads in flight can both pass the limit or both keep a stray
photo row. `onboarding-double-photo-race`'s own stub names
`onboarding-upload-limit-race` as the same shape and says to fix them together.
`onboarding-orphaned-objects` is the same file's removal path (`removeDocuments`,
`removeFile`) losing bucket objects to a delete-order race, breaking the 30-day purge's
retention rule silently. Grouped as one hardening pass over the professional's document
and photo lifecycle rather than three uncoordinated touches of the same actions file.

## Build order

1. **onboarding-upload-limit-race** (bug, P2) — hold the three-files-per-document limit
   atomically (guarded insert or advisory lock) in `confirmUpload`/`requestUpload`.
2. **onboarding-double-photo-race** (bug, P2, depends on 1) — once the upload path holds
   its guard atomically, make the photo-replacement delete every other `photo` row by id
   rather than from the pre-upload read, closing the same race for the single-photo slot.
3. **onboarding-orphaned-objects** (bug, P1) — delete the bucket object before the row in
   `removeDocuments`/`removeFile`, matching the order `src/lib/admin/purge.ts` already
   uses. Independent of 1 and 2 (a different pair of functions); kept in this epic because
   it is the same file's same class of concurrency/ordering defect.
