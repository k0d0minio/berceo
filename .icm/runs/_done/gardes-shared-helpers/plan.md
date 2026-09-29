# Plan: gardes-shared-helpers

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The shared clock and side**: in `src/lib/demandes/rules.ts`, add `hasNightEnded` (the
   messagerie body, which already uses `addDays`/`endTime`/`brusselsNow`), `type Side` and
   `otherSide`. Then drop the copies in `messagerie/rules.ts` (keep `Side` as an alias or
   re-export of demandes' `Side` if that saves churn in `actions.ts`, `conversations.ts`,
   `paths.ts` and the three components), `gardes/rules.ts` (`hasNightEnded`, `otherSide`;
   `gardeState`/`isAddressVisible` import the shared one; `nightEnd` stays for
   `absenceDeadline` if it is still used) and `avis/rules.ts` (`ratedSide`). Update importers:
   `gardes.ts`, the avis callers of `ratedSide`, and `components/avis/ratings-table.tsx`'s ternary.
   Done when: the first acceptance grep shows only the demandes definitions for these two names.
2. **The tests follow**: move or re-import the `hasNightEnded`/`otherSide`/`ratedSide` cases
   from `messagerie/rules.test.ts`, `gardes/rules.test.ts` and `avis/rules.test.ts`, keeping
   every assertion. Done when: `npm test` for `src/lib/{demandes,messagerie,gardes,avis}` passes
   (run by CI; locally only the `vitest` subset if the repo allows it).
3. **One booking e-mail read**: add `cancelledBy`/`cancellationKind` to `bookingNotice` and
   `BookingNotice`, delete `gardeNotice`/`GardeNotice` and the now-unused aliases and imports in
   `gardes.ts`, and point `gardes/notify.ts` (three calls) and `avis/notify.ts` at `bookingNotice`.
   Done when: `grep -rn "gardeNotice\|GardeNotice" src` is empty.
4. **One cron check**: create `src/lib/cron.ts` with `isCronRequest` moved verbatim, and
   `src/lib/cron.test.ts` with the cases from `purge.test.ts`. Remove it from `purge.ts` and
   drop that file's `timingSafeEqual` import. The four routes call
   `isCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)` and keep
   their responses. Update the three hourly routes' header comments with the floor. Done when:
   `timingSafeEqual` appears only in `src/lib/cron.ts`.

## Risks

- **`CRON_SECRET` shorter than 16 characters on UAT.** The purge would already refuse it, but
  the purge only runs on production, so UAT's value has not been tested against the floor. The
  signal is a 401 on the next `demandes-digest`/`gardes-rappel`/`avis-invitations` Actions run
  after the merge. The fix is a longer secret in Vercel and GitHub (the operator's), not a code
  change.
- **Moving `Side` can pull `demandes/rules.ts` into client components** (`conversation-view.tsx`
  and others). demandes/rules.ts is already pure and client-safe, so this is fine, but it must not
  gain a server import.
- **The type of `bookingNotice`'s new columns.** They come from the schema enums, so the
  `BookingNotice` fields must be `BookingSide | null` / `CancellationKind | null`, not widened,
  or `gardes/notify.ts`'s wording switch loses its exhaustiveness.
- **`ratings-table.tsx` shadows `ratedSide` as a local const.** When the import comes in, rename
  the local or use `otherSide` directly so the two cannot collide.
