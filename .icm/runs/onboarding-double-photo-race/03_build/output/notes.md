# Build notes: onboarding-double-photo-race

- commits: `feat: … her photo replaced under the profile's lock` (59eccb1), the merge of `main` (01d17ee), the ready push (b7a1b60)
- ci: GREEN on b7a1b60 — full gate: Vercel preview pass, Quality (advisory) pass; draft head GREEN on the cheap tier before; `format.sh` / `lint.sh` not wired (SKIP); `env.sh audit --changed` OK; `security-check.sh --branch` OK

## What changed

- `src/lib/professionnelle/rules.ts`: `replacesPhotos(kind, outcome)` — only a `photo` that was
  recorded (`enregistre`) replaces the others.
- `src/lib/professionnelle/rules.test.ts`: tests written from the criterion — photo recorded →
  replace; photo `limite`/`doublon`/`echec` → keep; each document kind → never.
- `src/lib/professionnelle/uploads.ts`: `recordUpload`'s guarded insert is now a CTE
  (`inserted`) followed by `replaced` — `delete … where kind = 'photo' and storage_key <> $key
  and exists (select 1 from inserted) returning storage_key` — in the same statement, still after
  the `for update` lock in the same `db.batch`. It returns `{ outcome, replaced }`; `replaced`
  passes through `replacesPhotos`, so the SQL and the pure rule both hold it.
- `src/app/(portail)/espace/professionnelle/actions.ts`: `confirmUpload` no longer calls
  `removeDocuments(file, ["photo"])` on the pre-upload read; it deletes the returned keys' objects
  after the commit, each failure logged (`[onboarding] replaced photo not deleted`), the answer
  staying `{ ok: true }`. The `updatedAt` touch keeps its own try/catch, its log renamed
  `profile not touched after an upload`.

## Acceptance criteria status

- [x] Two parallel photo confirms on a profile holding one end with one `photo` row (the last to
  commit), both `{ ok: true }`, and the other two keys returned exactly once between them for the
  action to delete — proof below, 10 of 10 rounds.
- [x] One photo on a profile holding two photo rows ends with the new one only; both old keys
  returned — proof below.
- [x] Unchanged paths: a first photo replaces nothing; a document replaces nothing and leaves her
  photo; a duplicate key (`doublon`, in parallel and alone) replaces nothing; `limite` and
  `echec` cannot reach the delete (`exists (select 1 from inserted)` is false, and
  `replacesPhotos` returns false). The pre-checks and `recordAnswer` are untouched.
- [x] A failed object delete of a replaced photo is caught per key and logged; the answer is
  `{ ok: true }` and the row side is already committed (read from the code; the storage failure
  itself was not injected).
- [x] `replacesPhotos` is pure, in `rules.ts`, with unit tests written, not run (the advisory job
  runs them).
- [x] Proven on a Neon branch of the non-production project — below.

### The proof (2026-09-29)

The run's own `run/onboarding-double-photo-race` could not be created: `db-branch.sh … up`
answered `HTTP 422: branches limit exceeded`, and every `preview/*` branch belonged to an open PR
(nothing stale to collect; `run/reservations-deux-gardes-meme-nuit` is a sibling's). The proof ran
on this PR's own preview branch, `preview/claude/zen-clarke-6b3scp` (`br-restless-cake-b1phs8kc`,
project `dawn-scene-70949411`, non-production — neither UAT's `main` nor production), with fresh
fixture users and profiles deleted at the end. Throwaway probe, deleted before the commit:

`DATABASE_URL=<pooled URI of that branch> npx tsx --conditions=react-server scripts/.probe-photo-race.mts`

```
control (old read-then-remove): 10/10 rounds ended with two photos
  round 0: a=enregistre ["orig"] b=enregistre ["a"] → rows ["b"]
  round 1: a=enregistre ["orig"] b=enregistre ["a"] → rows ["b"]
parallel photos: 10/10 rounds → one photo row, every other key returned once
two stray photos: enregistre replaced ["old1","old2"] → rows ["new"]
same key: doublon/enregistre replaced 1; again alone: doublon replaced 0 → rows ["x"]
document: enregistre replaced 0 → photo rows ["orig"]
first photo: enregistre replaced 0 → rows ["first"]
fixtures removed: 24 profiles
```

(24 = the 23 of this run plus one left by a first attempt that failed in the probe's own control
query before recording anything.)

## Notes for Release

- **Overlap with k0d0minio/berceo#61** (`onboarding-orphaned-objects`, 3 of 3, open, built ahead
  of this one): it rewrites `removeDocuments` (object before row, `removeFiles` in
  `src/lib/professionnelle/removals.ts`) and the same photo block in `confirmUpload` this run
  removes. Whichever merges second conflicts there. The resolution: keep this run's
  `recordUpload`-driven replacement (no `removeDocuments` call on the photo path), and route the
  returned keys' object deletes through #61's policy only if it covers keys whose rows are already
  gone — they are, here, so a failed object delete leaves a stray object; the spec leaves that to
  #61 (its Out of scope).
- The replaced photos' rows are deleted before their objects (inside the lock, then after the
  commit): an object delete that fails leaves a stray object with no row, as before this run. Not
  widened here (spec Out of scope).
- The unit tests were written, not run: the advisory quality job reads them.
