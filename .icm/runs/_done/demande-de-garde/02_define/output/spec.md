# Spec: Publish a request for a night

- slug: demande-de-garde
- personas: parent, professionnel
- touches: src/db/schema.ts, drizzle/**, src/lib/demandes/**, src/app/(portail)/espace/famille/**, src/app/(portail)/espace/professionnelle/page.tsx, src/app/(portail)/espace/professionnelle/demandes/**, src/app/api/cron/demandes-digest/**, src/components/demandes/**, src/components/shell/space-shell.tsx, src/content/demandes.ts, src/content/emails.ts, src/content/comptes.ts, src/lib/email/templates.ts, src/lib/auth/routing.test.ts, .github/workflows/demandes-digest.yml, .env.example, README.md, AGENTS.md
- complexity: standard

## Problem

A family can create an account and give her commune (profil-famille), and a professional can
complete her file and declare the communes she serves (onboarding-professionnelle), but nothing
connects the two. The care request is the object every later stub hangs on: the answer and the
booking (candidature-et-reservation), the fee, the conversation, the garde's cycle and the ratings.
This run builds the request and the list of requests a professional sees for her communes, the
first half of the one matching flow (D-10). It advances the Plateforme Berceo V1 objective: a
first usable version on uat.berceo.be before December 2026, for a launch in January 2027.
Cahier des charges D-01, D-02, D-03 and the statuses of F (as reduced by D-17).

## Proposed change

**Two ways to publish, one form (the operator's choice, 2026-09-25, D-60).**

- **« Publier une demande de garde de nuit »**, the normal request: the night is at least the day
  after tomorrow and at most 8 weeks (56 days) after today, Brussels time.
- **« Publier une demande urgente »**, a visible button of its own that opens the same form in
  urgent mode: the night is tonight or tomorrow night, nothing else. A night of today whose start
  time has already passed is refused.

Urgency is fixed at publication. A normal request cannot become urgent by editing it, nor the
reverse; the family cancels it and publishes the other kind. Dates are compared in Europe/Brussels.

**Where.** In the family's space, guarded by `requireAccess(SPACES.parent)`, all `noindex`:

- `/espace/famille/demandes` — « Mes demandes »: her requests, open ones first by night date, then
  the others (cancelled, past) most recent first. Each shows its night, its commune, the children
  line, whether it is urgent and its status.
- `/espace/famille/demandes/nouvelle` — the normal form; `/espace/famille/demandes/nouvelle?urgente=1`
  (or a sibling route, Build's choice) — the urgent form. Both buttons also sit on the family's
  home `/espace/famille`, replacing its « vide » line, and above the list on « Mes demandes ».
- `/espace/famille/demandes/[id]` — one request: its details, « Modifier » and « Annuler ma
  demande » while it can still be changed.

`SpaceShell` gains a « Mes demandes » navigation entry for the parent role.

**The form (D-20, the guide's "Les annonces" block, verbatim where the guide gives words).** Title
« Publier une demande de garde de nuit », subtitle « Plus votre demande est précise, plus vite vous
trouverez la professionnelle qui vous correspond. » Fields:

- **« Date de la garde »** — a date within the window of its mode (above).
- **« Heure de début »** — a half-hour between 18:00 and 23:00 included (D-65), with the note « La garde de
  nuit standard est de 11 heures. » The end shown everywhere is start + 11 hours (e.g. « de 20h00 à
  7h00 »); no end time is entered or stored.
- **« Nombre d'enfants »** — « Un bébé » or « Jumeaux ».
- **« Âge du bébé »** — a whole number and a unit, « semaines » (0 to 12) or « mois » (1 to 24),
  the operator's choice (D-64). It is the age on the day of publishing, as the family gives it; for twins
  it is their shared age.
- **« Votre commune »** — read-only, copied from the family's profile (the operator's choice), with
  the note « L'adresse exacte sera communiquée uniquement après confirmation de la réservation. »
  and a link to the profile to change it (D-63). The request stores its own copy (INS code, postcode,
  locality) at publication; changing the profile later does not move a request already published.
- **The mandatory checkbox** « Mon enfant n'a pas de condition médicale particulière nécessitant des
  soins spécialisés. » — unticked by default; the request is refused without it, and the moment it
  was ticked is stored.

There is no free-text field of any kind on a request (D-20): no context, no medical detail, no
name of the child. The profile's context line is not shown on a request in this run.

A family without a commune in her profile cannot publish: the form's routes send her to
`/espace/famille/profil` with the « Complétez votre profil » message the home already uses.

A family has **at most one open request per night** (D-65): publishing a second open request for the same
date is refused with a field error on the date (also enforced by the database).

**After publication.** A normal request shows a confirmation line (words written to the guide,
`@relecture`). An urgent one shows the guide's message verbatim: « Votre demande urgente a bien été
publiée. Les professionnelles disponibles dans votre zone seront notifiées immédiatement. Nous ne
pouvons garantir qu'une professionnelle sera disponible dans ce délai, mais nous faisons tout pour
vous aider. »

**Edit and cancel (D-02).** While a request is `ouverte` and its night has not started (date + start
time, Brussels), the family can edit its date (within its own mode's window, recomputed from the
day of the edit), its start time, its number of children and the baby's age. The commune and the
urgent flag are not editable. Editing sends no e-mail; a normal request edited before the next
digest goes out in its edited form. The family can cancel it through a confirmation dialog (the
red/green of D-24); a cancelled request moves to `annulee`, records when, is no longer editable,
disappears from every professional's list, and stays in the family's list as « Annulée ». Nothing
is sent to professionals on a cancellation.

**Statuses.** A new enum `care_request_status` with `ouverte` and `annulee`. `attribuee` is added by
candidature-et-reservation, and the time-driven statuses by cycle-de-garde-et-annulation (D-17). A
request `ouverte` whose night has started is shown to the family as « Passée » (derived, no stored
status), cannot be edited or cancelled, and is on no professional's list.

**What a professional sees (D-10, D-11, D-15).** `/espace/professionnelle/demandes`, guarded by
`requireAccess(SPACES.professionnel)`, `noindex`, with a « Demandes » navigation entry for the
professional role:

- Only a professional whose profile status is `valide` sees requests. Any other status sees a line
  saying requests become visible once her profile is validated, and no request.
- The list holds every request that is `ouverte`, whose night has not started, and whose commune
  INS code is one of her `professional_communes`. Urgent requests first, then the others, each group
  newest first.
- Each request is the DA's request card: « Garde de nuit à <Commune> », the locality, the night
  (« 30/09/2026 de 20h00 à 7h00 »), the children line (« Un bébé de trois mois », « Jumeaux de six
  semaines », written from the stored number and unit), an « Urgente » mark on an urgent one, and
  when it was published. No family name, no address, no phone, no e-mail. The card's price line and
  « Je suis disponible pour cette garde » button come with candidature-et-reservation.

The professional's home `/espace/professionnelle` links to the list once her profile is `valide`.

**Who can read what.** All reads and writes go through `src/lib/demandes/` (server-only). A family
reads and changes only her own requests: the user id comes from the session, never from the form,
and an id that is not hers answers not found. The professional's list query never selects the
family's user id, name or contact. `src/lib/famille/` stays the only reader of the address (the
existing column guard test keeps passing); this run reads the commune through its commune-only
reader.

**E-mails to professionals (the operator's choice: urgent at once, the rest as a daily digest, D-61).**
Every e-mail goes to a professional whose profile is `valide` at sending time and who serves the
request's commune. Words follow the guide's e-mail structure (« Bonjour [Prénom], », 2 to 4
sentences, one button « Voir les demandes disponibles » to `/espace/professionnelle/demandes`,
signed « L'équipe Berceo »); the guide gives no copy for these two e-mails, so every line carries
`@relecture Surya`. Links use the deployment's own origin, so UAT e-mails point at UAT.

- **Urgent — at once.** Publishing an urgent request sends one e-mail per matching professional
  right after the response (Next's `after()`), with an urgent subject naming the commune and the
  night. Each send uses the idempotency key `demande-<request id>-<professional id>`. A failed send
  is logged and does not undo or block the publication.
- **Digest — once a day, 18:00 Brussels.** A route `/api/cron/demandes-digest` (POST, refused
  without `Authorization: Bearer $CRON_SECRET`) gathers every normal request that is `ouverte`,
  whose night has not started, and that no digest has carried yet (`digest_sent_at` null). It sends
  each matching professional one e-mail listing her requests (commune, night, children line), then
  sets `digest_sent_at` on each request it processed, including requests no professional serves, so
  a request is in at most one digest. A professional with no new request gets nothing. The route
  sends only when it is 18:00 or later in Brussels, so it can be called at both 16:00 and 17:00 UTC
  and send once at 18:00 local, summer and winter. Idempotency key per professional per Brussels
  day: `digest-<professional id>-<YYYY-MM-DD>`.
- **Scheduling.** Vercel Cron runs only on production deployments, not on the `uat` custom
  environment where the founders test (D-22). So the schedule (D-62) is a GitHub Actions workflow
  `.github/workflows/demandes-digest.yml` (`cron: "0 16,17 * * *"`, plus `workflow_dispatch` for a
  manual run) that POSTs the route on `https://uat.berceo.be` and `https://www.berceo.be` with the
  secret. Each environment has its own `CRON_SECRET`; the workflow reads them from repository
  secrets `CRON_SECRET_UAT` and `CRON_SECRET_PRODUCTION`, and skips an environment whose secret is
  missing with a warning instead of failing. `CRON_SECRET` is added to `.env.example`.

**Data model (one migration, generated by drizzle-kit).** A new table `care_requests`:

- `id` uuid PK; `family_user_id` uuid, not null, → `users.id` `on delete cascade`.
- `status` `care_request_status`, not null, default `ouverte`; `urgent` boolean, not null.
- `night_date` date, not null; `start_time` time, not null (check: minutes 00 or 30, 18:00–23:00).
- `children` enum `care_request_children` (`un_bebe`, `jumeaux`), not null.
- `baby_age_value` smallint, `baby_age_unit` enum `baby_age_unit` (`semaines`, `mois`), both not
  null, with a check: `semaines` 0–12, `mois` 1–24.
- `commune_ins`, `postcode`, `locality` text, not null (the copy from the profile).
- `no_medical_condition_at` timestamptz, not null — when the checkbox was ticked.
- `digest_sent_at`, `cancelled_at` timestamptz, nullable.
- `created_at`, `updated_at` timestamptz.
- Indexes: `(commune_ins, status, night_date)` for the professional's list; a partial unique index
  on `(family_user_id, night_date)` where `status = 'ouverte'`; a partial index on `created_at`
  where `digest_sent_at IS NULL AND NOT urgent` for the digest.

The date window, the start-time slots and the age ranges live in one rules module in
`src/lib/demandes/` shared by the form, the server actions and the tests; the database checks
back the ranges that do not depend on today's date.

**Words (D-19).** Every visible word lives in a new `src/content/demandes.ts` (forms, lists, card,
statuses, confirmations, errors, the dialog) and `src/content/emails.ts` (the two e-mails), keyed
by locale. Entries quoted from the guide say so; every other entry carries `@relecture Surya`.
Vouvoiement, no `!`, `…` or `—`, no price, no insurance wording (D-8). The catalogue tests cover the
new file.

**Look (D-9).** The DA's tokens, the retuned shadcn components and the DA's request card (32 px
card, no shadow). The « Urgente » mark uses butter yellow, never red. Red and green only in the
cancel confirmation dialog (D-24).

**Docs.** A README section « The care request » (where the files live, the two modes, the digest
and its schedule, the secrets) and the routing row in `AGENTS.md`.

## Acceptance criteria

- [ ] On a phone (360 px wide, no horizontal scroll), a family with a commune in her profile goes from her home to a published normal request by picking a date, a start time, the number of children and the age, and ticking the checkbox; nothing else is asked.
- [ ] The form shows the guide's title, subtitle, labels and notes verbatim; the commune is her profile's, read-only, with the address note and a link to the profile.
- [ ] Publishing without the checkbox ticked is refused with a field error and nothing is stored; a stored request records when the checkbox was ticked.
- [ ] A normal request for today, tomorrow, or later than 56 days from today (Brussels) is refused; the day after tomorrow and day 56 are accepted.
- [ ] « Publier une demande urgente » is visible on the family's home and on « Mes demandes »; its form accepts only tonight or tomorrow night, refuses a night of today whose start time has passed, and after publication shows the guide's urgent message verbatim.
- [ ] A start time outside 18:00 to 23:00 or not on the half hour, an age outside 0–12 weeks or 1–24 months, or an unknown children value is refused by the server action and by the database.
- [ ] A second open request for a night that already has an open request of hers is refused with a field error on the date.
- [ ] A family without a commune in her profile who opens the form is sent to her profile with the « Complétez votre profil » message.
- [ ] « Mes demandes » lists her requests with night, commune, children line, urgency and status; an open request can be edited (date within its mode's window, start time, children, age) and the edit is saved; the commune and the urgent flag cannot be changed.
- [ ] Cancelling an open request goes through a confirmation dialog; the request shows « Annulée », can no longer be edited, and is gone from every professional's list.
- [ ] An open request whose night has started shows « Passée » to the family, cannot be edited or cancelled, and is on no professional's list.
- [ ] A family can neither read, edit nor cancel another family's request: its id answers not found, and a forged user id in the form is ignored.
- [ ] A `valide` professional serving the request's commune sees it on `/espace/professionnelle/demandes` as the DA's request card, urgent ones first then newest first; one serving only other communes does not see it; a professional whose profile is not `valide` sees the « visible once validated » line and no request.
- [ ] The professional's card and list show no family name, address, phone or e-mail, and the list query selects none of them.
- [ ] Publishing an urgent request sends at once one e-mail per `valide` professional serving that commune, with an urgent subject and a button to the list; a send failure is logged and the request stays published.
- [ ] `POST /api/cron/demandes-digest` without the right bearer secret answers 401 and sends nothing; with it, before 18:00 Brussels it sends nothing; at or after 18:00 it sends each matching professional one e-mail listing her new normal requests, marks them, and a second call the same day sends nothing more.
- [ ] Cancelled requests, urgent requests and requests whose night has started are never in a digest; a professional with no new request receives no digest.
- [ ] `.github/workflows/demandes-digest.yml` runs at 16:00 and 17:00 UTC and on demand, calls the route on UAT and production with each environment's secret, and skips an environment whose secret is missing with a warning.
- [ ] The migration adding `care_requests` and its enums is generated by drizzle-kit, the journal test passes, and a preview build applies it to its own Neon branch with `db:verify` passing.
- [ ] Deleting a family's user row deletes her requests (cascade).
- [ ] Unit tests cover the rules module: both date windows around their edges in Brussels time, the start-time slots, the age ranges, the end time (start + 11 h), the children line wording, and the digest's 18:00 gate in summer and winter time.
- [ ] Every visible word, e-mails included, lives in `src/content/`; entries not quoted from the guide carry `@relecture Surya`; the catalogue tests pass on the new file (no `!`, `…`, `—`, no price, no insurance wording).
- [ ] `routing.test.ts` covers the new family and professional paths (the wrong role is sent to its own space, a signed-out visitor to sign in).
- [ ] README has a « The care request » section and `AGENTS.md` a routing row; `.env.example` lists `CRON_SECRET`.

## Out of scope

- Answering a request (« Je suis disponible pour cette garde »), the family comparing answers, the booking, the `attribuee` status, revealing the address, sending a request « en priorité » to a known professional: candidature-et-reservation (D-10, D-15).
- The price line on the request card: candidature-et-reservation, with the professional's own rate (D-4).
- The time-driven statuses (à venir, en cours, terminée) and cancellation after a booking: cycle-de-garde-et-annulation (D-17).
- Republishing a request that got no suitable answer (cahier des charges « Réouverture annonce »): after candidature-et-reservation, as a later stub if the founders still want it.
- Recurring or multi-night requests, more than two children, different ages for twins.
- A free-text description, the profile's context line on a request, anything about the child's health beyond the checkbox (D-20).
- A per-request commune or address different from the profile's.
- E-mails on edit or cancellation, e-mail preferences or unsubscribing from the digest, SMS or push notifications.
- Requests in the admin back-office: back-office-admin.
- Validating professionals: verification-back-office. Until it merges, no profile on UAT becomes `valide` except by a direct database change, so the professional's list can only be smoke-tested that way.
- Scope decisions this run neither builds nor changes: D-1, D-2, D-3, D-4, D-5, D-6, D-7, D-8, D-12, D-13, D-14, D-16, D-18, D-21, D-23, D-25, D-26, D-27.

## Open questions

- none. Non-blocking notes: verification-back-office (stub 5, not yet run) may also add a migration; the two must be generated one after the other on the merged tree, never in parallel. The 18:00–23:00 start-time range and the one-open-request-per-night rule are Define's choices, not the sources'; `revise` changes them.

Context budget: read Surya's editorial guide ("Les annonces", "La mise en relation", "Les e-mails") and the DA's card page beyond the Inputs table, to quote the form's words and the request card exactly.
