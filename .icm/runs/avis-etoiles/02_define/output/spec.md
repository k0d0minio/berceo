# Spec: Star ratings after the garde

- slug: avis-etoiles
- personas: parent, professionnel, admin
- touches: src/db/schema.ts, drizzle/**, src/lib/avis/**, src/components/avis/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/espace/famille/professionnelles/[id]/page.tsx, src/app/(portail)/espace/famille/demandes/[id]/page.tsx, src/app/(portail)/espace/professionnelle/demandes/page.tsx, src/app/(portail)/espace/famille/page.tsx, src/app/(portail)/espace/professionnelle/page.tsx, src/app/(portail)/admin/avis/**, src/app/(portail)/admin/page.tsx, src/app/(portail)/design-system/portail/page.tsx, src/app/api/cron/avis-invitations/**, .github/workflows/avis-invitations.yml, src/lib/reservations/answers.ts, src/lib/reservations/profiles.ts, src/lib/demandes/requests.ts, src/lib/email/templates.ts, src/content/avis.ts, src/content/avis.test.ts, src/content/emails.ts, src/content/admin.ts, src/lib/auth/routing.test.ts, README.md, AGENTS.md
- complexity: standard

## Problem

Once a garde is over, nothing is left of it but the fact that it happened. The next family has
nothing to tell it whether a professional was good, a professional has nothing to tell her whether
a family is easy to work with, and the founders cannot see which accounts need watching. The
cahier des charges asks for exactly this, stars only with no written review (G-01, G-02, G-03;
scope D-18). Surya's guide ranks the rating system among the family's reassurance arguments (« Le
système d'avis : des retours laissés par de vraies familles, dans les deux sens »), and the vitrine
already promises it (the home page's « Des avis dans les deux sens », the FAQ's « Comment
fonctionnent les avis ? »). It advances the Plateforme Berceo V1 objective: a first usable version
on uat.berceo.be before December 2026, for a launch in January 2027.

**Dependency.** A rating hangs on a garde being *terminée*, and never on one that was *annulée*.
Both states come from cycle-de-garde-et-annulation (stub 11, scope D-17), which is not yet built:
on `main` today a booking has no state, no end instant and no cancellation. The operator chose to
define this run first (2026-09-25). **Build starts only once cycle-de-garde-et-annulation has
merged**, and reads the garde's state through whatever that run exposes. This spec uses only
three facts about a booking: whether it is terminée, whether it is annulée, and the instant it
ended (its start plus its duration, the standard night being 11 hours, D-20).

## Proposed change

**Who rates whom.** After a garde, the family rates the professional who came and the
professional rates the family she came to. Each side rates once per garde (D-107). A rating is
made of four criteria, each scored from 1 to 5 whole stars. All four are required. There is no
free text anywhere in the flow: no comment field, no « autre » field, no text column (D-18).

**The criteria (D-105).** The labels live in `src/content/avis.ts` and carry `@relecture Surya`:

- the family rates the professional on « Ponctualité », « Communication », « Soin », « Confiance »;
- the professional rates the family on « Accueil », « Communication », « Clarté des consignes »,
  « Respect du cadre ».

**When a garde can be rated (D-107).** The rating window opens when the garde is terminée and
closes 14 days after the instant it ended. A garde that was annulée is never rated. Outside the
window, and for a side that has already rated, there is no form. A rating cannot be edited or
withdrawn by the person who gave it.

**Double-blind (D-106).** A rating is *published* once both sides have rated the garde, or once
the window has closed, whichever comes first. Until then it counts nowhere and nobody but the
founders sees it. Publication is computed at read time from those two facts; no job flips it. The
form page says so in one line (`@relecture Surya`), so that neither side waits for the other.
Nobody ever sees the other side's individual scores, only the aggregate note below. This
overrides the stub's rough criterion « update on the first rating ».

**The note and the gardes count (D-109).**

- A person's *note* is the mean of every criterion score in the published ratings they received,
  rounded to one decimal and written with a French decimal comma (« 4,7 »). It is shown as five
  stars filled to the value, with the value in text. Its accessible name reads « Note 4,7 sur 5 ».
  With no published rating, one line (`@relecture Surya`) says there is no note yet. It never
  shows a zero.
- The *gardes count* is the number of that person's bookings that are terminée, cancelled ones
  excluded, whether rated or not (« 12 gardes avec Berceo », « 1 garde avec Berceo »,
  `@relecture Surya`). It updates when a garde becomes terminée, not when it is rated. It is not
  shown while it is zero.
- Both are read by one server-only module, `src/lib/avis/`, which holds the only reads and writes
  of the new tables. The pages below call it; none of them computes a note itself.

**Where the professional's note shows (family side).** It shows on her full profile
(`/espace/famille/professionnelles/[id]`), next to her profession, and on each answer card the
family compares on `/espace/famille/demandes/[id]`. `PublicProfile` and `Applicant` gain `note`
(the value, or null) and `gardes` (the count). These are the fields D-14's teaser pages
(recherche-et-fiches-publiques) will reuse.

**Where the family's note shows (professional side) (D-108).** It shows on every request card in
the professional's list (`/espace/professionnelle/demandes`), before she answers, so that it can
inform her choice. It also shows on her booking (`/espace/professionnelle/gardes/[id]`). The card
still carries no family identity: a note and a count, never a name. The request card read in
`src/lib/demandes/requests.ts` gains the two fields for the family that published the request.

**Each side's own note (D-111).** The family's home (`/espace/famille`) and the professional's
home (`/espace/professionnelle`) show the person's own note and gardes count. Only the aggregate
is shown, never a single rating.

**Rating a garde.**

- Entry points: on the family's « Mes réservations » list and her booking page, and on the
  professional's « Mes gardes » list and her garde page, a past garde whose window is open and
  which this side has not rated carries a « Laisser un avis » link (the guide's CTA). Once rated,
  the booking page shows the stars this side gave, read-only, with the date. It never shows the
  other side's rating.
- The form: `/espace/famille/reservations/[id]/avis` and `/espace/professionnelle/gardes/[id]/avis`,
  guarded by `requireAccess` of the matching space, `noindex`, `force-dynamic`. The page shows a
  title naming the garde's night and the other person's first name (`@relecture Surya`), then the
  four criteria. Each criterion is a radiogroup of five stars. The stars are keyboard-operable,
  each has a 44 × 44 px tap target, and each has an accessible name (« 3 étoiles sur 5 » for
  « Ponctualité »). Under the criteria come the double-blind line and a line saying the avis cannot
  be changed once sent (both `@relecture Surya`), then the submit button « Envoyer mon avis »
  (`@relecture Surya`). There is no confirmation dialog (D-24 does not apply).
- The server action takes the booking id and four integers only. The side, the rater and the
  rated person come from the session and the booking, never from the form. It refuses, and stores
  nothing, when:
  - the booking is not this user's;
  - the garde is not terminée, or it is annulée;
  - the window has closed;
  - this side has already rated this garde (a unique constraint backs the check);
  - a score is missing, is not an integer, or falls outside 1 to 5.
  Any other form field is ignored. On success the page shows a thank-you line
  (`@relecture Surya`) and the stars given, read-only.
- Opening the form on a closed window, an annulée garde or an already-rated garde shows one line
  saying why, and no form. Another user's booking reads as not found, as the booking pages do
  today. A signed-out user following the e-mail link goes through the existing sign-in and comes
  back to the form.

**The invitation e-mail (D-110).** When a garde becomes terminée, each side gets one e-mail
inviting them to rate. Nothing else is sent: no reminder and no e-mail on publication (D-107).

- Family: the guide's « Demande d'avis post-garde (famille) », verbatim.
  - Subject: « Votre garde avec [Prénom] est terminée : partagez votre retour ».
  - Body: « La garde de [Prénom] s'est terminée. Votre retour nous aide à maintenir la qualité du
    réseau Berceo. Cela prend moins de 2 minutes. ».
  - CTA « Laisser un avis », linking to her form.
  - Wrapped in the guide's structure: « Bonjour [Prénom], » and « L'équipe Berceo ».
- Professional: the same structure, written to the guide's rules and `@relecture Surya`. It names
  the family's first name and the night, says her retour helps keep the network's quality, and
  carries the same CTA to her form.
- Both say, in one line (`@relecture Surya`), that the avis can be left for 14 days.
- Templates live in `src/lib/email/templates.ts`, and every word in `src/content/emails.ts`.
- Sending is done by an hourly scheduled pass: the route `/api/cron/avis-invitations`, secured with
  `CRON_SECRET` exactly like `/api/cron/demandes-digest`. It is called on both uat and production
  by a new `.github/workflows/avis-invitations.yml`, modelled on `demandes-digest.yml`: Vercel
  Cron does not run on the uat environment, and a missing secret skips the run with a warning. On
  each pass it finds the gardes that are terminée, not annulée and still inside their window, and
  for each side not yet invited and not yet rated it sends the e-mail and records the invitation.
  A side is invited at most once: the record is written per garde and side, and a unique key
  holds it. A garde whose window had already closed when the pass first sees it gets no e-mail,
  so no backlog is sent on the first deploy. A failed send is logged and retried on the next pass.

**The founders' list — `/admin/avis` (G-03, D-108).** It is guarded by admin access, `noindex`
and read-only, and linked from the admin home (`src/app/(portail)/admin/page.tsx`, label in
`src/content/admin.ts`, `@relecture Surya`). Every rating is listed, published or not, newest
first, 50 per page. Each row shows:

- the date it was given;
- the garde (its night and the commune's name);
- who rated whom: first name, surname and role of each side;
- the four criteria with their labels and scores;
- the rating's mean;
- « Publiée » or « En attente de publication ».

It writes nothing and journals nothing. back-office-admin (stub 14) folds it into its « Vue
d'ensemble »; this run does not build that.

**Data model (one migration, generated by drizzle-kit).**

- An enum `rating_side`: `famille`, `professionnelle`. This is the side of the person who rates.
- A table `ratings`:
  - `id` uuid primary key;
  - `booking_id` → `bookings.id`, not null, `on delete cascade`;
  - `rater_side` `rating_side`, not null;
  - `rater_user_id` → `users.id`, not null;
  - `rated_user_id` → `users.id`, not null;
  - `score_1` … `score_4` smallint, not null, each with a check `BETWEEN 1 AND 5`. Their labels
    are the side's criteria in the order above, and the order is fixed by `src/lib/avis/rules.ts`;
  - `created_at` timestamptz, not null, default now;
  - unique `(booking_id, rater_side)`;
  - an index on `rated_user_id`, for the note read.

  No text column exists on the table.
- A table `rating_invitations`:
  - `booking_id` → `bookings.id`, `on delete cascade`;
  - `side` `rating_side`;
  - `sent_at` timestamptz, not null;
  - primary key `(booking_id, side)`.

**The rules module.** `src/lib/avis/rules.ts` is pure, with no database access. It holds:

- the criteria per side and their order;
- the window (open when terminée and not annulée, closed at end + 14 days);
- `canRate`, from the garde's facts, the side, whether this side has rated, and now;
- `isPublished`, from both sides' presence, the end instant and now;
- the note: a mean rounded to one decimal, formatted with a comma;
- the validation of a submitted set of scores.

The pages, the server actions, the route and the tests share it.

**Words (D-19).** Every visible word lives in the new `src/content/avis.ts` keyed by locale, plus
the e-mails in `src/content/emails.ts` and the admin link and list in `src/content/admin.ts`.
Lines quoted from the guide (the family e-mail, « Laisser un avis ») say so. Every other entry
carries `@relecture Surya`. The rules: vouvoiement, no `!`, `…` or `—`, no price, no insurance
wording (D-8) and no « diplômées » (D-7). The new `src/content/avis.test.ts` follows
`disponibilites.test.ts`: it checks the mechanical rules on every entry and the guide's lines
verbatim.

**Look (D-9).** Stars use the DA's tokens: a filled star in an ink colour, an empty star in its
outline. No new colour, no red or green (D-24), no shadow, 32 px cards, capsule buttons. The star
input and the note display are added to `/design-system/portail` with a sample note, the no-note
state and the input.

**Docs.** A README section « The ratings » (where the files live, the criteria, the window, the
double-blind rule, where each note shows, the invitation pass and its workflow) and an `AGENTS.md`
routing row.

## Acceptance criteria

- [ ] On a 360 px wide phone, a family whose garde is terminée opens « Laisser un avis » from « Mes réservations », scores « Ponctualité », « Communication », « Soin » and « Confiance » with the stars, sends, and sees the stars she gave, read-only, on her booking page, with no horizontal scroll.
- [ ] A professional does the same from « Mes gardes » with « Accueil », « Communication », « Clarté des consignes » and « Respect du cadre ».
- [ ] The form has no textarea and no text input, and the `ratings` table has no text column (a test on the schema and one on the rendered form hold both).
- [ ] The server action refuses, and stores nothing for, another user's booking, a garde not yet terminée, an annulée garde, a closed window, a second rating from the same side, and a missing, non-integer or out-of-range score. A forged side or rated user in the form is ignored.
- [ ] Each side can rate a given garde at most once. Two concurrent submissions store one rating (the unique constraint).
- [ ] « Laisser un avis » shows only on terminée, non-annulée gardes, inside the 14 days after their end, for a side that has not rated. Opening the form outside those conditions shows the reason line and no form.
- [ ] A rating given while the other side has not rated counts in no note. It counts as soon as the other side rates, or once 14 days have passed since the garde's end, with no action by anyone.
- [ ] A professional's note on her full profile and on the family's answer cards equals the mean of every criterion score of her published ratings, to one decimal with a comma. With no published rating, the no-note line shows and no zero.
- [ ] The gardes count equals the person's terminée, non-annulée bookings, counts a garde from the hour it becomes terminée whether or not it is rated, and is hidden at zero.
- [ ] Each request card in the professional's list shows the publishing family's note and gardes count, and still no family name, e-mail, phone or address. Her garde page shows the family's note.
- [ ] Each side's home shows their own note and gardes count, never an individual rating. Neither side can read the other side's scores for a garde anywhere.
- [ ] When a garde becomes terminée, the next hourly pass sends the family the guide's post-garde e-mail verbatim, and sends the professional hers. Each links to its form. A garde gets at most one e-mail per side across any number of passes. A side that has already rated is not invited. A garde whose window closed before its first pass gets none. An annulée garde gets none.
- [ ] The invitation route refuses a call without the right `CRON_SECRET`. The workflow calls uat and production hourly, and skips with a warning when the secret is missing.
- [ ] `/admin/avis` lists every rating, published or not, newest first, 50 per page. Each row shows the garde, both sides' names and roles, the four labelled scores, the mean and the publication state. It is reachable from the admin home, and a parent or professional opening it is sent to their own space.
- [ ] The star input is operable by keyboard alone. Each star has a 44 × 44 px target and an accessible name. The note display's accessible name reads « Note X,Y sur 5 ».
- [ ] Unit tests cover the rules module: the window edges (end, end + 14 days, across a daylight-saving change), `canRate` for each refusal, `isPublished` for each of its three paths (both rated, window closed, neither), the note's mean and rounding (including 4,95 and a single rating), and score validation.
- [ ] The migration is generated by drizzle-kit, the journal test passes, and a preview build applies it to its own Neon branch with `db:verify` passing.
- [ ] Every visible word lives in `src/content/`. Entries not quoted from the guide carry `@relecture Surya`. `src/content/avis.test.ts` passes: no `!`, `…` or `—`, no price, no insurance wording, and the guide's lines verbatim.
- [ ] `routing.test.ts` covers both form routes and `/admin/avis`.
- [ ] `/design-system/portail` shows the star input, a sample note and the no-note state.
- [ ] README has a « The ratings » section and `AGENTS.md` a routing row.

## Out of scope

- Written reviews, comments, public testimonials, the kick-off's « rendre public votre témoignage » follow-up (scope out of scope, D-18).
- Internal admin notes (G-04) and a quality board ranking accounts (cahier des charges « plus tard »).
- Folding the ratings into the « Vue d'ensemble » and any sort, filter, export or moderation of ratings: back-office-admin (stub 14).
- The note on the public teaser pages and the search cards: recherche-et-fiches-publiques (stub 15) reads `note` and `gardes` from this run's module.
- Sorting or filtering professionals or requests by note.
- A reminder e-mail, an e-mail when a rating is published, and a notification of the note to the rated person (D-107).
- Editing, withdrawing or deleting a rating by its author, and founders deleting a rating.
- Per-criterion averages shown to anyone but the founders.
- A minimum number of ratings before a note shows (it shows from the first published one).
- The garde's states themselves, their timing and cancellation: cycle-de-garde-et-annulation.
- What a suspended or deleted account does to its ratings: back-office-admin.
- Scope decisions this run neither builds nor changes: D-1 to D-16, D-19 to D-27 except where cited above.

## Open questions

- none. Non-blocking notes:
  - The criteria (D-105), double-blind publication (D-106), the 14-day window with no reminder and no edits (D-107), the family's note on request cards and `/admin/avis` in this run (D-108) are the operator's answers in this Define session, 2026-09-25. The note and count rules (D-109), the invitation pass (D-110) and each side's own note on their home (D-111) are Define's choices. `revise` changes any of them.
  - This run was defined before its dependency cycle-de-garde-et-annulation (operator, 2026-09-25). Build waits for that run's merge.
  - The decision ids D-105 to D-111 are the next free ones on `main`. cycle-de-garde-et-annulation, defined after this run, takes the ids after D-111, and whichever run merges second renumbers on collision, as frais-de-service did.

Context budget: read Surya's editorial guide (« Les e-mails », the reassurance hierarchy), the kick-off notes on ratings, `src/lib/reservations/` (profiles, bookings), `src/db/schema.ts` and `.github/workflows/demandes-digest.yml` beyond the Inputs table: to quote the guide's e-mail exactly, to confirm bookings carry no state yet, and to model the scheduled pass.
