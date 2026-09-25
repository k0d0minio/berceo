# Plan: avis-etoiles

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Pass 0 — before anything

Confirm cycle-de-garde-et-annulation has **merged** on `main`, then merge `main` into this branch.
Read its merged spec and `src/lib/gardes/` (or wherever it landed) for the three facts this run
uses: terminée, annulée, and the instant the garde ended. Write down in `notes.md` which
function or column provides each. If any of the three is missing, STOP and `revise`. Never
re-implement the state here. Done when: the three facts are named in `notes.md`.

## Passes

1. **Schema and migration.**
   - Files: `src/db/schema.ts` gains the `rating_side` enum and the tables `ratings` and
     `rating_invitations`, exactly as in the spec (check `BETWEEN 1 AND 5` on each score, unique
     `(booking_id, rater_side)`, index on `rated_user_id`, no text column), plus their exported
     types.
   - Generate with `npm run db:generate -- --name avis` on the tree merged with cycle-de-garde,
     then commit `drizzle/`. Load `.icm/skills/database-migration/`.
   - Done when: drizzle-kit emitted exactly one migration and the journal test passes.
2. **The rules module.**
   - Files: `src/lib/avis/rules.ts`, pure and client-safe. It holds:
     - `CRITERIA` per side, in the spec's order;
     - `WINDOW_DAYS = 14`;
     - `windowCloses(endedAt)`;
     - `canRate(facts, side, rated, now)`, returning a refusal reason or null;
     - `isPublished(bothRated, endedAt, now)`;
     - `noteOf(scores)` (mean to one decimal) and `formatNote` (comma);
     - `parseScores(formData)`, taking exactly four integers from 1 to 5.
   - Tests: `rules.test.ts` on every edge the spec lists (the window around end + 14 days and
     across a daylight-saving change, each refusal, the three publication paths, the rounding at
     4,95, a single rating).
   - Done when: the tests pass.
3. **The data module.**
   - Files: `src/lib/avis/` (server-only). It exports:
     - `submitRating(userId, bookingId, scores, now)`, which derives the side and the rated user
       from the booking and relies on the unique constraint for races;
     - `ratingGiven(bookingId, side)`, the rater's own stars, read-only;
     - `noteFor(userIds[], now)`, which returns `{ note, gardes }` for many users in one query,
       counting published ratings only (the other side exists OR `endedAt + 14 d <= now`);
     - `gardesCount`, built on cycle-de-garde's terminée, annulée excluded;
     - `adminRatings(page)`;
     - `invitationsDue(now)` and `markInvited`.
   - Done when: unit tests cover side derivation, refusal on a foreign booking, and the
     publication filter in the note read (one side rated → no note; both → note; one side and
     window closed → note).
4. **Words.**
   - Files: `src/content/avis.ts` (criteria labels, the form, the reason lines, the double-blind
     line, the no-edit line, thanks, the no-note line, the gardes-count plural, « Laisser un
     avis » marked as a guide quote) and `src/content/emails.ts` (the family e-mail verbatim and
     marked as a quote; the professional's e-mail and the 14-day line, `@relecture Surya`).
   - `src/content/admin.ts` gains the admin link and the list's labels.
   - `src/content/avis.test.ts` follows `disponibilites.test.ts`.
   - Done when: the catalogue tests pass.
5. **Components.**
   - Files: `src/components/avis/`:
     - `StarInput`, a client component: a radiogroup of five, keyboard arrows, 44 px targets,
       an accessible name per star;
     - `NoteDisplay`, a server component: five stars filled to the value, the text value, the
       gardes count hidden at zero, and the no-note line;
     - `GivenRating`, which shows the rater's own stars, read-only.
   - Add all three to `/design-system/portail`.
   - Done when: they render there in every state.
6. **The rating flow.**
   - Files: `espace/famille/reservations/[id]/avis/` and `espace/professionnelle/gardes/[id]/avis/`
     (`page.tsx` and `actions.ts` each: `requireAccess`, `noindex`, `force-dynamic`, the reason
     line or the form, and the thank-you state after sending). Put a « Laisser un avis » link or
     `GivenRating` on both lists and both booking pages.
   - Update `routing.test.ts`.
   - Done when: the flow works on the preview at 360 px for both sides, and the form renders no
     text input.
7. **Where the notes show.**
   - `PublicProfile` and `Applicant` (`src/lib/reservations/profiles.ts`, `answers.ts`) gain
     `note` and `gardes`, read through `noteFor`, and are mounted on the full profile and the
     answer cards.
   - The professional's request card read in `src/lib/demandes/requests.ts` gains the publishing
     family's `note` and `gardes`, still with no identity column, and is mounted on
     `/espace/professionnelle/demandes` and on her garde page.
   - Both homes show their own note.
   - Done when: the existing column-whitelist tests (`columns.test.ts`) still pass, with the two
     new fields added to their allowed lists.
8. **Invitations.**
   - The e-mail templates go in `src/lib/email/templates.ts`, with tests in `templates.test.ts`.
   - The route `src/app/api/cron/avis-invitations/route.ts` is modelled on `demandes-digest`:
     `CRON_SECRET`, send, `markInvited` per side, log and continue on a failed send. Its tests
     go in `route.test.ts`.
   - Add `.github/workflows/avis-invitations.yml`: hourly, uat and production, skipping on a
     missing secret.
   - Done when: the route tests cover the secret, the once-per-side rule, no e-mail to a side
     that already rated, no e-mail after the window closes, and none for an annulée garde.
9. **The founders' list.**
   - Files: `src/app/(portail)/admin/avis/page.tsx` (admin guard, 50 per page, newest first,
     the publication state) and a link from `admin/page.tsx`.
   - Update `routing.test.ts`.
   - Done when: the page lists a seeded rating on the preview.
10. **Docs.** Add the README section « The ratings » and the `AGENTS.md` routing row. Done when:
    every acceptance criterion in `tasks.md` is checked.

## Risks

- **The dependency's shape.** cycle-de-garde may store the state or compute it from time. The note
  and invitation reads need `endedAt` in SQL (for the publication filter and `invitationsDue`), so
  if it is computed only in TypeScript, express the same rule as a SQL expression and share one
  constant. Signal: a note read that loads every booking into memory.
- **A parallel migration.** Any run that merges a migration first forces this one to be
  regenerated on the merged tree. Never hand-edit the journal.
- **The request-card whitelist.** Adding the family's note to the professional's card must not add
  an identity column. `columns.test.ts` is the guard, so extend its allowed list by exactly the
  two fields.
- **Smoke on UAT needs a terminée garde.** A real one needs an 11-hour wait. Seed one on the
  preview's own Neon branch with a night in the past (as earlier runs did), or book a night of
  yesterday if cycle-de-garde permits it. Never edit the shared database.
- **The GitHub Actions secret.** The new workflow reuses `CRON_SECRET`. There is nothing new to
  set, but check that the repository secret exists.
- **Decision ids** were renumbered D-105–D-111 → D-115–D-121 at Build (cycle-de-garde merged first with D-105–D-114). Re-check on every merge of `main`.
