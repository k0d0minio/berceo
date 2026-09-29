# Spec: The night's end, the other side, the booking e-mail read and the cron check written once

- slug: gardes-shared-helpers
- personas: parent, professionnel, admin
- touches: src/lib/demandes/rules.ts, src/lib/messagerie/rules.ts, src/lib/gardes/rules.ts, src/lib/avis/rules.ts, src/components/avis/ratings-table.tsx, src/lib/reservations/notices.ts, src/lib/gardes/gardes.ts, src/lib/gardes/notify.ts, src/lib/avis/notify.ts, src/lib/cron.ts, src/lib/admin/purge.ts, src/app/api/cron/demandes-digest/route.ts, src/app/api/cron/gardes-rappel/route.ts, src/app/api/cron/avis-invitations/route.ts, src/app/api/cron/purge-dossiers-refuses/route.ts, and the matching `*.test.ts`
- complexity: standard

## Problem

The cycle-de-garde-et-annulation run and then avis-etoiles copied helpers that already existed.
The night's end is computed twice: `hasNightEnded` in `src/lib/messagerie/rules.ts` closes the
conversation (D-89), `hasNightEnded` in `src/lib/gardes/rules.ts` makes a garde « Terminée » and
hides the address (D-110). These must end at the same moment, and nothing makes them. « The other
side » is written three times (`otherSide` in messagerie and gardes, `ratedSide` in
`src/lib/avis/rules.ts`), plus once inline in `src/components/avis/ratings-table.tsx`.
`gardeNotice` in `src/lib/gardes/gardes.ts` repeats `bookingNotice` in
`src/lib/reservations/notices.ts` (same aliases, same joins) plus two columns, and avis now reads
it too. The cron bearer check is copied as `authorised()` in three routes (the digest, the
reminder, the invitations), while the purge route uses a fourth, stricter `isCronRequest` in
`src/lib/admin/purge.ts`. This is the second stub of the gardes-annulation-suivi epic. It settles
`gardes.ts`'s helper surface before `care-requests-read-ownership` moves its reads.

## Proposed change

A chore: no persona sees a new behaviour.

1. **One night's end.** `hasNightEnded(date, startTime, now)` lives in `src/lib/demandes/rules.ts`
   beside `hasNightStarted` and `endTime`, with the same comparison the two copies make today
   (the next day at `endTime(startTime)`, compared with Brussels now as `YYYY-MM-DDTHH:MM`).
   `messagerie/rules.ts` and `gardes/rules.ts` drop their copies and import it. There is no
   re-export, so callers import from `@/lib/demandes/rules`. `gardes/rules.ts` keeps
   `nightEnd`, `absenceDeadline` and its private stamps for the absence window.
2. **One other side (D-154).** `demandes/rules.ts` exports `type Side = "famille" |
   "professionnelle"` and `otherSide(side)`. Messagerie's `Side` becomes that type: either
   messagerie re-exports it or its importers switch to `@/lib/demandes/rules`, and Build picks.
   `gardes/rules.ts` drops `otherSide`, and `gardes.ts` imports it from demandes. `avis/rules.ts`
   drops `ratedSide`, and its callers use `otherSide`. `ratings-table.tsx` replaces its inline
   ternary with `otherSide`. `BookingSide` and `RatingSide` from the schema are the same union and
   stay assignable.
3. **One booking e-mail read.** `bookingNotice` in `src/lib/reservations/notices.ts` also selects
   `cancelledBy` and `cancellationKind`, and `BookingNotice` gains both, typed as `GardeNotice`
   types them today. `gardeNotice` and `GardeNotice` are removed from `gardes.ts`, which also drops
   its `familyUser`/`professionalUser` aliases and any imports that become unused.
   `src/lib/gardes/notify.ts` (three calls) and `src/lib/avis/notify.ts` call `bookingNotice`.
   The booking-confirmed e-mail in `src/lib/reservations/notify.ts` ignores the two new fields.
4. **One cron check (D-153).** `isCronRequest(authorization, secret)` moves unchanged (its
   16-character floor included) from `src/lib/admin/purge.ts` to `src/lib/cron.ts`. The digest,
   reminder, invitations and purge routes call it with `request.headers.get("authorization")`
   and `process.env.CRON_SECRET`, and the three `authorised()` copies and their
   `timingSafeEqual` imports go. Each route keeps its own refusal: 401 `{ error: "unauthorised" }`
   for the three hourly routes, 404 for the purge. The `isCronRequest` cases in `purge.test.ts`
   move to `src/lib/cron.test.ts` unchanged. The route comments that say "Refused without
   `CRON_SECRET` … when no secret is set at all" also mention the 16-character floor.
5. **Tests follow their helper.** The existing cases for `hasNightEnded` and `otherSide` in
   `messagerie/rules.test.ts` and `gardes/rules.test.ts`, and for `ratedSide` in
   `avis/rules.test.ts`, keep their assertions. Each case either moves to
   `demandes/rules.test.ts` (or wherever demandes' rules are tested) or re-imports from the new
   home. None is deleted without an equivalent case in the new home.

## Acceptance criteria

- [ ] `grep -rn "function hasNightEnded\|function otherSide\|function ratedSide\|function authorised\|function isCronRequest\|function gardeNotice" src --include=*.ts --include=*.tsx` finds exactly three definitions: `hasNightEnded` and `otherSide` in `src/lib/demandes/rules.ts`, and `isCronRequest` in `src/lib/cron.ts`.
- [ ] `grep -rn "gardeNotice\|GardeNotice\|ratedSide\|timingSafeEqual" src` finds `timingSafeEqual` only in `src/lib/cron.ts` and none of the others anywhere.
- [ ] `src/components/avis/ratings-table.tsx` has no `=== "famille" ? "professionnelle"` ternary. The side it shows comes from `otherSide`.
- [ ] Every existing case for `hasNightEnded`, `otherSide`/`ratedSide` and `isCronRequest` still runs with the same assertions, from its helper's new home. `npm test` passes on the branch, as do the unchanged `messagerie`, `gardes`, `avis`, `reservations`, `demandes` and `admin` suites.
- [ ] Each of the four cron routes answers a call without `Authorization`, or with a wrong bearer, exactly as before: 401 JSON for the digest, the reminder and the invitations, 404 for the purge.
- [ ] On the UAT preview, for a confirmed garde: the conversation, the garde's state and the address visibility change together when the night ends. Before the end: messages accepted, « En cours », address shown. After: conversation closed, « Terminée », address hidden. Also check that a cancellation by either side still sends its e-mails with the right wording (who cancelled, the fee line) and that a booking confirmation still reaches both sides.
- [ ] After the merge, the next scheduled runs of `demandes-digest`, `gardes-rappel` and `avis-invitations` (GitHub Actions) return 200 on UAT, which confirms `CRON_SECRET` meets the 16-character floor there.

## Out of scope

- `checkedId()` in the two gardes actions files, and the same UUID-or-`notFound()` check inlined across the other actions files: three lines per copy; left as is (D-155).
- The SQL clocks (`nightEnd`/`localNow` in `src/lib/admin/lists.ts` and `src/lib/avis/ratings.ts`) and the private `stamp`/`nowStamp` helpers in `gardes/rules.ts` and `avis/rules.ts`: each module keeps its own for the windows it alone computes (absence, rating).
- Moving `care_requests` reads out of `gardes.ts` and `reservations/bookings.ts`. That is `care-requests-read-ownership`, next in this epic, on the shape this run leaves.
- Renaming `isCronRequest` or changing its floor; any change to a route's response body, status or schedule.
- The AGENTS.md routing row and the README, which Release updates if a path they name moved (`isCronRequest` now in `src/lib/cron.ts`).

## Open questions

- none. The three choices the stub left open were settled with the operator on 2026-09-28: the one cron check is the purge's `isCronRequest`, floor included, for all four routes (D-153); one `otherSide` covers messagerie, gardes, avis and the inline copy (D-154); `checkedId` stays (D-155).
