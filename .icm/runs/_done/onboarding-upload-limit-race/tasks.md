# Tasks: onboarding-upload-limit-race

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] Two `confirmUpload` calls for the same profile and document kind, run in parallel when it
- [x] Two `confirmUpload` calls with the same storage key, run in parallel, end with exactly one
- [x] A single upload below the limit, a single upload of a photo, and a refusal by any of the
- [x] Confirms for two different profiles do not wait on each other (the lock is the profile's
- [x] The outcome-to-answer mapping is a pure function in `src/lib/professionnelle/rules.ts`
- [x] Both parallel cases above are proven against a Neon branch of the non-production project

## Queue

- [x] `rules.ts`: `RecordOutcome`, `recordOutcome`, `recordAnswer`; their tests in `rules.test.ts`
- [x] `uploads.ts`: `recordUpload`, the locked batch; `confirmUpload` calls it and answers through `recordAnswer`
- [x] Proof on `run/onboarding-upload-limit-race` (Neon non-production), recorded in `03_build/output/notes.md`; probes deleted, branch released
