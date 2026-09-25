# Spec: The life of a garde and its cancellation

- slug: cycle-de-garde-et-annulation
- personas: parent, professionnel, admin
- touches: src/db/schema.ts, drizzle/**, src/lib/gardes/**, src/lib/reservations/bookings.ts, src/lib/reservations/format.ts, src/lib/demandes/requests.ts, src/lib/demandes/rules.ts, src/lib/famille/profile.ts, src/lib/paiements/payments.ts, src/lib/paiements/rules.ts, src/lib/email/templates.ts, src/components/gardes/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/famille/demandes/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/admin/absences/**, src/app/(portail)/admin/page.tsx, src/app/api/cron/gardes-rappel/**, .github/workflows/gardes-rappel.yml, src/content/gardes.ts, src/content/gardes.test.ts, src/content/emails.ts, src/content/reservations.ts, src/content/admin.ts, README.md, AGENTS.md
- complexity: complex

## Problem

A confirmed booking (candidature-et-reservation, frais-de-service) never changes state: the family
and the professional see the same « Attribuée » the evening before, during and a week after the
night, and neither can cancel it. D-2 promises a refund of the 3 % fee when the professional
cancels and none when the family does, and the Tarifs page and the FAQ say so already, but nothing
triggers either. D-17 names the garde's states (à venir, en cours, terminée, annulée) and nothing
computes them; the address the professional reads has no end. This run gives the garde its life
by time, a cancellation for each side with the fee rule, a way to record a no-show, a reminder the
day before and the one-line platform reminder at the key steps. It advances the Plateforme Berceo
V1 objective, a first usable version on uat.berceo.be before December 2026 for a launch in January
2027, and it is what avis-etoiles (stub 12) waits on to know a garde is terminée. Cahier des
charges F statuses and « Rappel cadre plateforme », I-04, the « annulation » e-mail of the
Exigences; F-01 to F-04 stay struck (D-17).

## Proposed change

### 1. The garde's state, read from the clock (D-17, D-109)

A booking stores only `confirmee` or `annulee`. What each side sees is derived at display time
from the request's night date and start hour, Europe/Brussels, never stored, so no job has to run
for it to be right at each hour:

- **À venir** — `confirmee`, before the start hour;
- **En cours** — `confirmee`, from the start hour until start + 11 hours (D-20);
- **Terminée** — `confirmee`, from start + 11 hours;
- **Annulée** — `annulee`, whatever the hour.

One pure function in `src/lib/gardes/rules.ts` returns it from `(status, nightDate, startTime,
now)`, reusing `hasNightStarted` and `hasNightEnded`. The family's « Mes réservations » list and
page, the professional's « Mes gardes » list and page, and the family's request page (which shows
« Attribuée » today and links to the booking) show it as a badge. Labels in the new
`src/content/gardes.ts`, `@relecture Surya`. The conversation already closes at the night's end
(D-89): nothing changes there.

### 2. Cancelling a confirmed garde (D-2, D-105, D-110)

**Who and until when.** The family, from her garde's page, and the professional, from hers, see
« Annuler la garde » while the garde is à venir, that is until the start hour (D-105). From the
start hour the button is gone and the server refuses a cancellation.

**The dialog.** The button opens the confirmation dialog (`confirm-dialog.tsx`, red confirm,
D-24). The family's says the service fee stays with Berceo (D-2); the professional's says the
family is told and the family's fee refunded. Words `@relecture`, no `!`, `…` or `—`.

**What it records.** In one statement: the booking becomes `annulee` with `cancelled_at`,
`cancelled_by` (`famille` or `professionnelle`, the side responsible), `cancelled_by_user_id`
(who clicked) and `cancellation_kind = annulation`; its request becomes `annulee` with
`cancelled_at` (D-110), which closes every conversation of that request at once under the
existing rule (D-89). A second click, or both sides at once, cancels once: the first write wins
and the other sees the garde already annulée.

**The fee (D-2).**
- **The professional cancels** → after the cancellation commits, `refundFee(paymentId,
  "annulation_professionnelle", now)` (D-94) on the booking's `payee` payment. The family's garde
  page shows « Frais de service remboursés » once the payment is `remboursee`, and « Remboursement
  en cours » while it is still `payee` or `remboursement_echoue` (a Stripe error leaves the
  cancellation standing; the founders retry with their button in `/admin/paiements`, D-101).
- **The family cancels** → no refund; her page shows the fee kept.
- A booking with no payment (made on UAT before frais-de-service) cancels with no fee line.

**The other side is told.** One e-mail to the other side, idempotency key
`garde-annulee-<bookingId>`: the family's cancellation to the professional, the professional's to
the family (which says the fee is refunded and links to the garde page, where she can republish).
Subjects and bodies to the guide's e-mail structure (« Bonjour [Prénom], », 2 to 4 sentences, a
button, « L'équipe Berceo »), all `@relecture`. A refused send is logged and never undoes the
cancellation.

**Both pages after it** show « Annulée », who cancelled and when (« Annulée par vous le … » /
« Annulée par [Prénom] le … »), never the surname.

### 3. Reporting an absence (D-106)

**Who and until when.** From the start hour until 24 hours after the night ends (start + 35 hours),
each side's garde page shows « Signaler une absence » on a `confirmee` garde. It opens the
confirmation dialog (red confirm) saying the founders will look at it.

**What it records.** The same columns as §2, with `cancellation_kind = absence` and `cancelled_by`
the **absent** side (the other side from the one reporting), `cancelled_by_user_id` the reporter.
The request becomes `annulee` too. The garde shows « Annulée » with « Absence de [Prénom]
signalée le … » (or « Votre absence a été signalée le … » on the absent side's page). Once
recorded, neither side can report again; there is no in-app contest (D-17).

**No automatic refund.** Whichever side is reported absent, the fee stays as it is; the founders
decide and refund from `/admin/paiements` with the existing button (D-101).

**Told.** The absent side gets one e-mail (key `garde-absence-<bookingId>`) saying an absence was
recorded for that night and the founders will review it, `@relecture`.

**The founders' list.** A new `/admin/absences` page (admins only, noindex, in the admin shell)
lists every reported absence, newest first: the night, the family's and the professional's full
names, who reported it, when, and the fee's amount and status with a link to `/admin/paiements`.
The admin home links it with the count. Read-only: no review marker, no journal line (it is not
an admin action).

### 4. Republishing after a cancelled garde (D-107)

On an annulée garde whose night has not started, whoever cancelled and whatever the kind, the
family's garde page shows « Republier ma demande » (`@relecture`). It publishes a **new** request
with the old one's night date, start hour, children, baby's age and commune, the urgent flag
recomputed by the existing date window (D-60), no priority, the medical checkbox's timestamp set
anew (the button's dialog repeats the checkbox's sentence as the thing she confirms, D-20). It goes
through `publishRequest`, so the urgent e-mail or the next digest carries it exactly like a new
one, and every professional of the commune can answer, the one who cancelled included. If the
family already holds an open request for that night (D-65), the button is replaced by a link to
it. The old request and garde stay annulée and readable.

### 5. The reminder the day before (D-108)

At about 10:00 Europe/Brussels on the day before the night, the family and the professional of
each `confirmee` garde each get one reminder e-mail: the date, the start hour, the other side's
first name, a button to the garde page, and the platform line (§6). A garde confirmed after that
day's send gets none. `bookings.reminder_sent_at` is set in the statement that claims the
bookings to remind, so a second call sends nothing; idempotency keys
`garde-rappel-<bookingId>-famille` and `-professionnelle`.

A new route `/api/cron/gardes-rappel` does it, guarded by `CRON_SECRET` like the digest (D-68),
sending only between 10:00 and 10:59 Brussels. Vercel Cron does not run on the `uat` environment,
so a new `.github/workflows/gardes-rappel.yml`, the digest's twin, calls the route on UAT and
production at 08:00 and 09:00 UTC (one of the two lands at 10:00 Brussels, summer or winter).
`vercel.json` is not touched.

### 6. The platform line (« Rappel cadre plateforme », D-111)

One sentence, from the guide's Tarifs instruction (« Rappeler que la rémunération de la
professionnelle se fait directement. Berceo est un intermédiaire. »), written without any
insurance claim (D-8), `@relecture`, in `src/content/emails.ts`: in both existing confirmation
e-mails (family and professional) and in both reminders. Nowhere else in this run.

### 7. The address after the night (D-110)

`bookingAddress` (`src/lib/famille/profile.ts`, still the only reader of `family_profiles`)
returns the address only on a `confirmee` garde whose night has not ended; on an annulée or
terminée garde the professional's page shows the commune only. The address-guard test gains both
cases.

### 8. Data (one migration, `db:generate -- --name cycle-de-garde`)

- New enum `booking_status`: `confirmee`, `annulee`.
- New enum `booking_side`: `famille`, `professionnelle`.
- New enum `cancellation_kind`: `annulation`, `absence`.
- `bookings` gains `status` (not null, default `confirmee`, so every existing booking is
  confirmed), `cancelled_at` timestamptz, `cancelled_by` `booking_side`, `cancelled_by_user_id` →
  `users.id` on delete set null, `cancellation_kind`, `reminder_sent_at` timestamptz.
- Checks: `(status = 'annulee') = (cancelled_at IS NOT NULL)`, and `cancelled_by` and
  `cancellation_kind` set exactly when `cancelled_at` is.
- `bookings_profile_night_key` becomes partial, `WHERE status = 'confirmee'`, so a cancelled garde
  frees the professional's night. `request_id` and `application_id` stay unique (a republished
  request is a new row).
- An index for the reminder claim (`night_date` where `status = 'confirmee' AND reminder_sent_at
  IS NULL`) and one for the absences list (`cancelled_at` where `cancellation_kind = 'absence'`).

The writes of the booking's status columns and the reads the garde pages need live in the new
`src/lib/gardes/` (server-only; `rules.ts` pure and tested); creation and the existing reads stay
in `src/lib/reservations/bookings.ts`. The request's status change goes through
`src/lib/demandes/` inside the same transaction.

## Acceptance criteria

- [ ] With the clock set before the start hour, at the start hour, at start + 11 h and after, a confirmed garde shows « À venir », « En cours », « Terminée » on both sides' lists and pages, with no job run and nobody clicking; an annulée one shows « Annulée » at any hour.
- [ ] Either side can cancel a garde from its page until the start hour through the red confirmation dialog; from the start hour the button is absent and a direct request is refused.
- [ ] A professional's cancellation marks the booking and its request annulées, records `professionnelle`, the user and the moment, calls `refundFee` with `annulation_professionnelle`, and the family's page then shows « Frais de service remboursés » (or « Remboursement en cours » while Stripe has not confirmed).
- [ ] A family's cancellation records `famille`, the user and the moment, refunds nothing, and her page says the fee is kept.
- [ ] Each cancellation sends exactly one e-mail to the other side, in the catalogue's words; a double click or both sides at once cancel once and send one e-mail.
- [ ] After a cancellation, the request's conversations refuse messages and stay readable; the professional's page no longer shows the address, nor does it after the night ends.
- [ ] From the start hour until 24 h after the night ends, either side can report the other absent; the garde becomes annulée with the absent side recorded as `cancelled_by`, kind `absence`, the absent side gets one e-mail, no refund is made, and the absence appears on `/admin/absences` with the fee's status; a non-admin gets the not-found page there.
- [ ] On an annulée garde whose night has not started, « Republier ma demande » publishes a new open request with the same night and details, carried by the urgent e-mail or the digest like any new one; with an open request already that night, the link to it shows instead.
- [ ] A cancelled garde frees the professional's night: she can be booked on another request for the same night.
- [ ] The reminder route, called between 10:00 and 10:59 Brussels with the secret, sends one e-mail to each side of every confirmed garde whose night is tomorrow, once; a second call sends none; outside the window or without the secret it sends nothing.
- [ ] Both confirmation e-mails and both reminders carry the platform line, with no insurance wording.
- [ ] Bookings made before the migration read as `confirmee` and show the state their night gives.
- [ ] Every new visible word is in `src/content/`, quoted or marked `@relecture`, and `gardes.test.ts` passes the catalogue's mechanical rules.

## Out of scope

- Ratings after a terminée garde, and whether an annulée or absence-reported garde can be rated: avis-etoiles (stub 12). It reads the state from `src/lib/gardes/rules.ts`.
- A founders' review marker or decision on an absence, and any automatic refund on one: the founders refund by hand (D-101); the full bookings view is back-office-admin (stub 14).
- An in-app contest of a cancellation or an absence (D-17): disputes go to the founders' e-mail.
- Cancelling after the start hour otherwise than by reporting an absence; partial refunds; any penalty.
- The post-garde « Demande d'avis » e-mail from the guide: stub 12.
- Cancellation or reminder by SMS or push (scope Out of scope).
- A founders' contact address in the e-mails: Berceo publishes none yet (AGENTS standing rule).
- Changing the professional's indicative availability on a cancellation (D-12, not linked to bookings).

## Open questions

- none. The operator's answers in this Define session, 2026-09-25, are D-105 to D-108; D-109 to D-111 are Define's (state derived and never stored, a cancelled garde cancels its request and hides the address, the platform line's placement); `revise` changes them. Surya reviews every `@relecture` entry; a changed wording is a catalogue edit, not a spec change.

Context budget: read `src/db/schema.ts` (requests, bookings, conversations, payments), `src/lib/paiements/payments.ts` (`refundFee`), `src/lib/messagerie/rules.ts`, `src/lib/demandes/rules.ts`, the digest workflow, and Surya's editorial guide (« La réservation », « La messagerie », « Les e-mails », « Tarifs ») beyond the Inputs table, to settle the data model, the refund call and the e-mail wording.
