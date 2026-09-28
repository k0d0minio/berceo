# Spec: Two parallel uploads cannot pass the three-files-per-document limit

- slug: onboarding-upload-limit-race
- personas: professionnel
- touches: src/app/(portail)/espace/professionnelle/actions.ts, src/lib/professionnelle/rules.ts, src/lib/professionnelle/rules.test.ts
- complexity: standard

## Problem

A professional provides at most three files per document (`FILES_PER_DOCUMENT_MAX` in
`src/lib/professionnelle/rules.ts`), and `confirmUpload`
(`src/app/(portail)/espace/professionnelle/actions.ts`) checks it against a count read before the
insert, with no lock or constraint. Two uploads confirmed at once (two tabs, a quick second pick)
both read two files and both insert, so the slot holds four `diplome` rows and shows itself over
its limit. The rule the onboarding promises is held by a read, not by the database.

The same function has a second read-then-write: its "only once" check on the storage key. Two
confirms of the same key (a double submit, a client retry) both pass it; the second insert fails
on the unique `storage_key` and its `discard` deletes the bucket object that the first confirm's
row now points at, leaving a row whose file is gone.

Both sit on the path of Plateforme Berceo V1's professional onboarding, the file the founders
verify before a profile goes live. This is the first of the three concurrency fixes of the epic
`onboarding-fichiers-concurrence`; `onboarding-double-photo-race` builds on the guard it adds.

## Proposed change

`confirmUpload` records a file only under a per-profile lock, and decides the limit and the key's
novelty inside it.

- **The lock.** The recording runs as one `db.batch` (one transaction on the Neon HTTP driver)
  whose first statement locks the profile's `professional_profiles` row
  (`select … for update`, the pattern `acceptAnswer` in `src/lib/reservations/bookings.ts` uses on
  `payments`). Every confirm of the same profile, whatever the kind, waits on it; confirms of
  different profiles never do. The photo takes the lock too, so `onboarding-double-photo-race` can
  build on it, but the photo keeps no count (it replaces, it does not accumulate).
- **The guarded insert.** The next statement of the same batch inserts the row only when, read
  after the lock, the profile holds fewer than three files of that kind (documents only) and no
  row carries that storage key. A lone `INSERT … SELECT … WHERE (SELECT count(*) …) < 3` is not
  enough: under Postgres's default READ COMMITTED two such statements can both read two and both
  insert; the lock taken in an earlier statement of the same transaction is what serialises them,
  and the guarded statement's fresh snapshot then sees the committed rows.
- **A refusal for the limit** deletes the uploaded object and answers `nombre` (the catalogue's
  existing « Vous avez déjà déposé trois fichiers pour ce justificatif. »), as the read-side check
  does today.
- **A refusal for a key already recorded** records nothing, **never deletes the object** (it
  belongs to the row that won), and answers `echec`, as the existing pre-check does for a key it
  already sees.
- **A failed insert for any other reason** keeps today's behaviour: delete the object, answer
  `echec`.
- The pre-checks before the lock stay as they are (the early `checkUpload` in `requestUpload` and
  `confirmUpload`, the key's prefix and first-seen check): they answer fast in the common case; the
  guard is what holds the rule.
- **The pure part** — mapping the guard's outcome (recorded / over the limit / key already
  recorded / failed) to the answer and to whether the object is deleted — lives in
  `src/lib/professionnelle/rules.ts` with its unit tests, so the action carries no decision logic
  of its own.

No schema change, no migration: the lock is on an existing row, the key is already `unique`.

## Acceptance criteria

- [ ] Two `confirmUpload` calls for the same profile and document kind, run in parallel when it
  holds two files of that kind, end with exactly three rows of that kind: one confirm answers
  `{ ok: true }`, the other answers `nombre` and its object is gone from the bucket.
- [ ] Two `confirmUpload` calls with the same storage key, run in parallel, end with exactly one
  row for that key and its object still in the bucket; the loser answers `echec`.
- [ ] A single upload below the limit, a single upload of a photo, and a refusal by any of the
  pre-checks behave exactly as before (same answers, same objects kept or deleted).
- [ ] Confirms for two different profiles do not wait on each other (the lock is the profile's
  row, not a table lock).
- [ ] The outcome-to-answer mapping is a pure function in `src/lib/professionnelle/rules.ts`
  covered by unit tests for each of the four outcomes, including that only "over the limit" and
  "failed" delete the object.
- [ ] Both parallel cases above are proven against a Neon branch of the non-production project
  (not UAT's or production's database) by a script run in Build, and the run's `notes.md` records
  the command and the resulting rows.

## Out of scope

- The photo's single slot under concurrent uploads — `onboarding-double-photo-race` (2 of 3),
  which reuses this lock.
- The delete order in `removeDocuments` / `removeFile` — `onboarding-orphaned-objects` (3 of 3).
- The status checks (`isEditable`, `changeNeedsReview`) read before the lock: a file submitted for
  review while an upload is being confirmed is not re-checked under the lock.
- A database constraint (trigger or check) holding the limit: the lock covers the one writer,
  `confirmUpload`; nothing else inserts `professional_documents` rows.
- Answering `{ ok: true }` to a same-key retry: the retry answers `echec` like today's pre-check,
  and the file-slot shows the recorded file on its next read.

## Open questions

- none

Context budget: the Define map points at the cahier des charges in icm-board, which this cloud
session cannot reach; the personas and touches were taken from the stub, `AGENTS.md` and a few
greps of the actions file instead.
