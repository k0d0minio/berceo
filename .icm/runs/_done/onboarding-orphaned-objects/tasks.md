# Tasks: onboarding-orphaned-objects

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] For every removal path (`removeFile`, the photo replacement in `confirmUpload`, the
- [ ] Unit tests in `src/lib/professionnelle/removals.test.ts`, with injected storage and row
- [ ] `removeFile` whose object delete fails answers `echec` and the file is still listed on her
- [ ] A photo upload whose old photo's object cannot be deleted still answers `{ ok: true }`, keeps
- [ ] A profession change whose stale documents' objects cannot be deleted answers as a successful
- [ ] Removals that meet no failure behave exactly as today: same answers, same rows and objects

## Queue

- [x] The removal step and its tests — `src/lib/professionnelle/removals.ts`, `removals.test.ts` (b9d8c09)
- [x] The three removal paths wired onto it — `src/app/(portail)/espace/professionnelle/actions.ts` (b9d8c09)
