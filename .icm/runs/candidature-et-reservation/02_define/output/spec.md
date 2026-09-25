# Spec: Answer a request, choose a professional, confirm the booking

- slug: candidature-et-reservation
- personas: parent, professionnel
- touches: src/db/schema.ts, drizzle/**, src/lib/demandes/**, src/lib/reservations/**, src/lib/famille/**, src/lib/professionnelle/rules.ts, src/app/api/fichiers/[id]/route.ts, src/app/(portail)/espace/famille/**, src/app/(portail)/espace/professionnelle/demandes/**, src/app/(portail)/espace/professionnelle/gardes/**, src/app/(portail)/espace/professionnelle/page.tsx, src/components/demandes/**, src/components/reservations/**, src/components/shell/space-shell.tsx, src/content/demandes.ts, src/content/reservations.ts, src/content/emails.ts, src/lib/email/templates.ts, src/lib/auth/routing.test.ts, README.md, AGENTS.md
- complexity: complex

## Problem

A family can publish a request and a validated professional serving her commune can see it
(demande-de-garde), but nothing lets the professional answer it, and a family has nobody to
choose. This is the core of the marketplace: the moment two people agree on a night. It is the
second half of the one matching flow (D-10) and the last piece of the first usable loop
(account, profile, verification, request, answer, booking) the breakdown promises after stub 8.
It advances the Plateforme Berceo V1 objective: a first usable version on uat.berceo.be before
December 2026, for a launch in January 2027. Cahier des charges D-04, D-05, D-06, D-07,
« Réouverture annonce », « Contact récurrent »; the guide's « La mise en relation » and « La
réservation » (minus the insurance line, D-8).

## Proposed change

**The words.** Every visible word lives in `src/content/` (D-19): the answer, the choice and the
booking in a new `src/content/reservations.ts`, card additions in `src/content/demandes.ts`, the
e-mails in `src/content/emails.ts`, keyed by locale. Entries quoted from the guide say so; every
other entry carries `@relecture Surya`. Vouvoiement, no `!`, `…` or `—`, no insurance wording
(D-8), no price but the professional's own rate (100 to 300 €, D-4), written with the € after the
number (« 150 € pour la garde de nuit »). The catalogue tests cover the new file.

### 1. The professional answers (D-10, cahier des charges D-04)

On `/espace/professionnelle/demandes` each request card gains the DA's two last lines:

- **The price line**: her own current rate, « <rate> € pour la garde de nuit » (DA, « Cartes et
  blocs de contenu »).
- **« Je suis disponible pour cette garde »** (guide, verbatim). Pressing it records her answer
  and shows the guide's confirmation verbatim: « Votre disponibilité a bien été transmise à la
  famille. Vous serez notifiée dès qu'elle aura fait son choix. »

Once she has answered, the card shows « Vous avez répondu » (`@relecture`) and a button
« Retirer ma disponibilité » (`@relecture`) instead. Withdrawing needs no dialog, sends no e-mail,
and takes her off the family's list at once; while the request is still open and its night has
not started she may answer again (D-73).

An answer is accepted only when, at the moment of the click: her profile is `valide`; the request
is `ouverte` and its night has not started; the request's commune is one she serves **or** the
request was sent to her in priority (§4); she has not been declined on it (`non_retenue`); and she
holds no confirmed booking on that night. The server refuses anything else with a plain message.
Answers are not capped (cahier des charges « Positionnement », annotated).

Her list hides: requests she was declined on, and requests whose night she is already booked for
(D-73). Priority requests sent to her come first, marked « Demande prioritaire » (`@relecture`,
butter yellow like « Urgente », never red), then urgent ones, then the rest newest first.

**The rate she answers at is frozen on the answer** (D-74): the answer stores her rate at that
moment; the family compares those rates, and the booking carries the rate of the answer it was
made from. A later change of her profile's rate moves neither.

**E-mail to the family, one per answer** (guide « Nouvelle candidature (famille) », verbatim):
subject « [Prénom] a répondu à votre demande »; body « [Prénom], [profession], a postulé pour
votre garde du [date]. Consultez son profil et confirmez votre choix. »; button « Voir le profil
de [Prénom] » to her full profile opened from that request (§3). Re-answering after a withdrawal
sends it again. A failed send is logged and never undoes the answer (the same `after()` pattern
as the urgent e-mail). Idempotency key `reponse-<answer id>-<n>`, `n` counting that answer's
(re)submissions.

### 2. The family compares and chooses (cahier des charges D-05, D-06)

On `/espace/famille/demandes/[id]`, under the request, the section « Les professionnelles qui ont
répondu à votre demande » (guide, verbatim) lists every pending answer, earliest first. Each shows
her photo, prénom, profession, her answered rate (« 150 € pour la garde de nuit »), « Voir le
profil complet » (guide) and « Accepter et réserver » (guide). No rating: it arrives with
avis-etoiles. An answer whose professional is no longer `valide` is not shown and cannot be
accepted. No answer yet: one line saying so (`@relecture`). On « Mes demandes », a card with
pending answers shows how many (« 2 réponses », `@relecture`).

**« Accepter et réserver »** opens a confirmation dialog (green confirm, D-24) titled
« Récapitulatif de votre garde » (guide) showing the date, the hours (« de 20h00 à 7h00 »), the
duration (« 11 heures »), her prénom, her profession, her rate and the line saying the family pays
the professional directly (`@relecture`; nothing about how, nothing about insurance, D-1, D-8).
Confirming, in one transaction:

- the request moves to the new status `attribuee` (only from `ouverte`: two acceptances racing
  produce one booking, the second is refused with a plain message);
- her answer becomes `retenue`, every other pending answer on that request `non_retenue`;
- a booking is created from her answer;
- her pending answers on other requests for the **same night** become `retiree` (D-73), silently;
  those families no longer see her;
- the professional must not already hold a booking that night (also enforced by the database).

**The family must have given her address** (D-77). The profile keeps it optional until now; if
her profile has no street and house number, « Accepter et réserver » does not open the dialog but
tells her to complete her address, with a link to `/espace/famille/profil` (`@relecture`).

After confirmation:

- **E-mail to the family** (guide « Confirmation de réservation (famille) », minus its insurance
  sentence, D-8): subject « Votre garde du [date] est confirmée ✓ »; body « Tout est prêt.
  [Prénom] sera chez vous le [date] à partir de [heure]. L'adresse lui a été transmise. »; button
  « Voir les détails de ma réservation » to the booking.
- **E-mail to the professional** (guide « Confirmation de réservation (professionnelle) »):
  subject « Garde confirmée : [date] chez [Prénom de la famille] »; body « Votre garde du [date]
  est confirmée. L'adresse et les coordonnées de la famille vous ont été transmises. Bonne
  nuit. » (the guide's « Bonne nuit ! » loses its `!`, `@relecture`, D-78); button « Voir les
  détails de la garde » to her booking.
- **E-mail to every professional declined** (`non_retenue`) by this choice: « not retained »
  (§5).

A request `attribuee` can no longer be edited, cancelled or republished by the family in this
run: cancelling a confirmed garde is cycle-de-garde-et-annulation. It shows « Attribuée »
(`@relecture`) and links to its booking. It leaves every professional's list.

**Until frais-de-service lands, confirmation has no payment step**; that stub inserts Stripe
between the click and the booking. The accept path lives in one server function in
`src/lib/reservations/` so it has one place to change.

### 3. The professional's full profile, as a family sees it (D-3, D-10, D-75)

`/espace/famille/professionnelles/[id]` (`id` is the profile id), guarded by
`requireAccess(SPACES.parent)`, `noindex`. Any signed-in family may open any `valide` profile
(D-3: a free account opens the full profiles); any other status, or an unknown id, answers not
found. It shows the DA's profile card and the rest of the file:

- her photo, prénom, profession, « Profil vérifié par Berceo » (DA, verbatim), the communes she
  serves, her spécialisations, experience range, bio, and her current rate;
- never her surname, e-mail, phone, INAMI number or documents (her phone only on a confirmed
  booking, §6).

Her photo becomes readable by parents: `/api/fichiers/[id]` serves a file of kind `photo` to a
signed-in parent when its profile is `valide`; documents stay owner and admins only, and anything
else still answers 404.

Buttons:

- **« Lui envoyer ma demande en priorité »** (guide), always (§4).
- **« Accepter et réserver »**, only when the page is opened from one of the family's open
  requests (`?demande=<request id>`, from the answers list or the answer e-mail) and this
  professional has a pending answer on it; it opens the same dialog as §2. An id that is not one
  of the family's requests is ignored.

### 4. The priority request (D-10, D-71)

« Lui envoyer ma demande en priorité » opens `/espace/famille/professionnelles/[id]/priorite`,
which shows the guide's message verbatim: « Votre demande sera envoyée en priorité à [Prénom].
Elle restera également visible des autres professionnelles de votre zone jusqu'à confirmation. »
and offers:

- **choose** one of her requests that is `ouverte`, whose night has not started, and that has no
  priority professional yet; or
- **publish** a new one: the demande-de-garde form, normal or urgent (both buttons), carrying the
  professional so the new request is created with her as its priority.

A request has **at most one** priority professional, set once and never changed (D-71). Sending
it:

- **no head start** (operator, D-71): the request stays on every serving professional's list
  exactly as before, and the normal digest or urgent e-mail rules apply to them unchanged;
- the priority professional is e-mailed at once (`@relecture`): subject « Une famille vous envoie
  sa demande en priorité », the request's commune, night and children line, button « Voir la
  demande » to her list. No family name. Idempotency key `priorite-<request id>`;
- the request sits at the top of her list marked « Demande prioritaire », **even when she does not
  serve its commune** (she was asked by name), and she may answer it under §1.

A family without a commune in her profile is sent to her profile, as the form already does. The
button stays available on a profile whose professional does not serve the family's commune.

### 5. Republish, and the « not retained » e-mail (cahier des charges « Réouverture annonce », D-70)

On an `ouverte` request whose night has not started and which has at least one pending answer,
the family sees « Republier ma demande » (`@relecture`) with a confirmation dialog explaining
that the current answers will be declined (`@relecture`). Confirming:

- every pending answer becomes `non_retenue`; those professionals can no longer answer it and no
  longer see it;
- the request goes out again: an urgent one sends the urgent e-mail again at once to every
  `valide` professional serving the commune who has not been declined on it; a normal one is
  cleared for the next daily digest (`digest_sent_at` back to null), which carries it to the same
  set. The digest's « already sent today » check must keep working when a republished request is
  claimed again; the urgent e-mail's idempotency key gains the republish count.

A request with a pending answer **cannot be edited** (D-76): its edit link is replaced by a line
saying why (`@relecture`); republishing clears the pending answers and editing opens again. It
**can be cancelled** as before.

**« Not retained » e-mail** (`@relecture`), one template for every way an answer is declined
while she waited: the family chose another professional (§2), republished (§5) or cancelled the
request. Subject « Votre disponibilité pour la garde du [date] », 2 to 4 sentences saying the
family has made another choice or the request is no longer open, and a button « Voir les
demandes disponibles » to her list. On a cancellation her answer becomes `non_retenue` too.
Withdrawn answers (`retiree`) get nothing.

### 6. The booking, on both sides (D-15, D-72)

**The family**: `/espace/famille/reservations`, « Mes réservations » (`@relecture`), guarded by
`requireAccess(SPACES.parent)`, `noindex`, with a navigation entry for the parent role: her
bookings, coming nights first by date, then past ones latest first. `/espace/famille/reservations/[id]`
is « Récapitulatif de votre garde » (guide): date, hours, duration, the professional's prénom,
profession and photo, the booked rate, the line saying she pays the professional directly, the
professional's **phone** (operator, D-72), « Voir le profil complet », and « Lui envoyer une
nouvelle demande en priorité » (`@relecture`, §4). This list is how a family finds the
professionals she already booked and re-contacts them (cahier des charges D-07, « Contact
récurrent »). Another family's booking id answers not found.

**The professional**: `/espace/professionnelle/gardes`, « Mes gardes » (`@relecture`), guarded by
`requireAccess(SPACES.professionnel)`, `noindex`, with a navigation entry for the professional
role and a link from her home: her bookings, coming first, then past. `/espace/professionnelle/gardes/[id]`
shows the night, the children line, the booked rate, and, **only here and only on her own
booking**, the family's first name and surname, full address (street, number, box, postcode,
locality) and phone. Another professional's booking id answers not found.

**The address never leaves before confirmation** (D-15): no list, card, answer, e-mail or query a
professional reaches selects the family's name, address, phone or e-mail unless it is her own
confirmed booking. `src/lib/famille/` stays the only reader of the address columns: it gains one
function returning the address for a booking, given the booking and the professional asking, and
it is read live from the family's profile at display time, never copied into the booking (D-77).
The existing column guard test keeps passing and gains that function's case.

How long the address stays visible after the night, and the garde's time-driven statuses (à
venir, en cours, terminée), belong to cycle-de-garde-et-annulation.

### 7. Data model (one migration, generated by drizzle-kit)

- `care_request_status` gains `attribuee`.
- `care_requests` gains `priority_profile_id` uuid, nullable, → `professional_profiles.id`
  `on delete set null`, and `priority_sent_at` timestamptz, nullable (both set together or both
  null, by a check).
- A new enum `application_status`: `en_attente`, `retenue`, `non_retenue`, `retiree`.
- A new table `care_request_applications` (an answer):
  - `id` uuid PK; `request_id` → `care_requests.id` `on delete cascade`; `profile_id` →
    `professional_profiles.id` `on delete cascade`;
  - `status` `application_status`, not null, default `en_attente`;
  - `night_rate_eur` integer, not null, check 100 to 300 (the rate frozen at the answer, D-74);
  - `answered_at`, `created_at`, `updated_at` timestamptz;
  - unique `(request_id, profile_id)` (one row per professional per request; re-answering after a
    withdrawal updates it); index `(profile_id, status)`; at most one `retenue` per request
    (partial unique index).
- A new table `bookings`:
  - `id` uuid PK; `request_id` unique → `care_requests.id` `on delete cascade`; `application_id`
    unique → `care_request_applications.id` `on delete cascade`; `profile_id` →
    `professional_profiles.id` `on delete cascade`; `family_user_id` → `users.id` `on delete
    cascade`;
  - `night_date` date, not null (copied from the request for the index below); `night_rate_eur`
    integer, not null, check 100 to 300; `confirmed_at`, `created_at` timestamptz;
  - unique `(profile_id, night_date)`: one garde per professional per night; index
    `(family_user_id, night_date)`.

No status column on `bookings` yet: cancellation and the time-driven states are
cycle-de-garde-et-annulation, which may turn the unique index into a partial one.

All reads and writes of answers and bookings go through a new `src/lib/reservations/`
(server-only), with a rules module for what is pure (who may answer, the same-night rule, the
accept and republish transitions, the display of the récapitulatif) shared by the server actions
and the tests. `src/lib/demandes/` keeps owning `care_requests`: the professional's list, the
priority fields and the republish reset are added there.

### 8. Look (D-9, D-24)

The DA's tokens, the retuned shadcn components, the DA's request card and profile card (32 px
cards, no shadow). « Demande prioritaire » and « Urgente » in butter yellow, never red. Red and
green only in the confirmation dialogs (accept, republish, cancel). At 360 px wide nothing
scrolls sideways.

### 9. Docs

A README section « The answer and the booking » (where the files live, the statuses, the
priority request, republish, who sees the address and phone and when) and the routing row in
`AGENTS.md`.

## Acceptance criteria

- [ ] A `valide` professional serving a request's commune sees its card with « <her rate> € pour la garde de nuit » and « Je suis disponible pour cette garde »; pressing it shows the guide's confirmation verbatim and the card then shows « Vous avez répondu » and « Retirer ma disponibilité ».
- [ ] The server refuses an answer from a professional who is not `valide`, on a request that is not `ouverte` or whose night has started, on a commune she does not serve (unless the request was sent to her in priority), after she was declined on it, or on a night she is already booked for.
- [ ] Each answer sends the family the guide's « [Prénom] a répondu à votre demande » e-mail, with the professional's prénom, profession and the night's date, and a button to her full profile opened from that request; a failed send is logged and the answer stays.
- [ ] Two professionals answer the same request; the family's request page lists both under « Les professionnelles qui ont répondu à votre demande » with photo, prénom, profession, answered rate, « Voir le profil complet » and « Accepter et réserver »; « Mes demandes » shows « 2 réponses » on that request.
- [ ] A professional changes her profile rate after answering; the family still sees, and the booking still carries, the rate she answered at.
- [ ] A professional withdraws her answer; she disappears from the family's list at once, no e-mail leaves, and she can answer again while the request is open.
- [ ] « Accepter et réserver » shows « Récapitulatif de votre garde » with date, hours, « 11 heures », prénom, profession, rate and the pay-directly line, no insurance wording; confirming creates one booking, moves the request to « Attribuée », sets the chosen answer `retenue` and the other `non_retenue`.
- [ ] After confirmation the family and the chosen professional each receive their guide confirmation e-mail (the family's without its insurance sentence, the professional's ending « Bonne nuit. »), and the other applicant receives the « not retained » e-mail.
- [ ] Two acceptances of the same request racing produce exactly one booking; the second is refused with a plain message.
- [ ] A professional booked for a night has her other pending answers for that night set to `retiree` and hidden from those families, cannot answer another request for that night, and a second booking for her on that night is refused by the database.
- [ ] A family whose profile has no street and house number cannot open the accept dialog and is sent to complete her address.
- [ ] Before confirmation, no page, card, list, e-mail or query a professional reaches selects the family's name, address, phone or e-mail; after confirmation, her own booking page shows the family's full name, full address and phone, and another professional's booking id answers not found.
- [ ] The family's booking page shows the professional's phone and never her surname; another family's booking id answers not found.
- [ ] `/espace/famille/professionnelles/[id]` shows a `valide` profile (photo, prénom, profession, « Profil vérifié par Berceo », communes, spécialisations, experience, bio, rate) and never her surname, e-mail, phone, INAMI or documents; a profile that is not `valide`, or an unknown id, answers not found.
- [ ] `/api/fichiers/[id]` serves a `valide` professional's photo to a signed-in parent, and still answers 404 to a parent for her documents, for the photo of a profile that is not `valide`, and to a signed-out visitor.
- [ ] From a professional's full profile, « Lui envoyer ma demande en priorité » shows the guide's explanatory message verbatim and lets the family choose one of her open requests without a priority professional, or publish a new normal or urgent request, that then carries her as its priority.
- [ ] A priority request reaches the chosen professional by e-mail at once and sits first on her list marked « Demande prioritaire », even when she does not serve its commune, and she can answer it; the other professionals serving the commune still see it and are notified exactly as for any request.
- [ ] A request's priority professional cannot be set twice or changed.
- [ ] « Republier ma demande » on an open request with pending answers declines each of them (each professional e-mailed « not retained », none can answer it again) and re-announces it: an urgent request e-mails the serving professionals again at once, a normal one is carried by the next digest.
- [ ] A request with a pending answer cannot be edited; once republished it can. Cancelling a request with pending answers e-mails each of those professionals « not retained ».
- [ ] An `attribuee` request can no longer be edited, cancelled or republished, shows « Attribuée » with a link to its booking, and is gone from every professional's list.
- [ ] « Mes réservations » lists the family's bookings; a booking's récapitulatif links to the professional's full profile and offers « Lui envoyer une nouvelle demande en priorité ».
- [ ] « Mes gardes » lists the professional's bookings and links to each one.
- [ ] The migration adding `attribuee`, the priority columns, `care_request_applications` and `bookings` is generated by drizzle-kit, the journal test passes, and a preview build applies it to its own Neon branch with `db:verify` passing.
- [ ] Deleting a family's user row deletes her requests, their answers and her bookings; deleting a professional's profile deletes her answers and bookings and clears her as a priority professional.
- [ ] Unit tests cover the rules module: who may answer (each refusal above), the same-night rule, the accept transition, the republish transition, the edit lock with pending answers, and the récapitulatif's hours and duration.
- [ ] Every visible word, e-mails included, lives in `src/content/`; entries not quoted from the guide or the DA carry `@relecture Surya`; the catalogue tests pass on the new and changed files (no `!`, `…`, `—`, no insurance wording).
- [ ] `routing.test.ts` covers the new family and professional paths (the wrong role is sent to its own space, a signed-out visitor to sign in).
- [ ] README has a « The answer and the booking » section and `AGENTS.md` a routing row.

## Out of scope

- The service fee and any payment step at confirmation: frais-de-service inserts Stripe between « Accepter et réserver » and the booking (D-2).
- Messaging, including the conversation that opens when a professional answers: messagerie (D-16).
- Cancelling a confirmed booking by either side, the time-driven statuses (à venir, en cours, terminée), how long the address stays visible after the night, and reopening a request after a cancelled booking: cycle-de-garde-et-annulation (D-17).
- The rating on the answers list and the profile, « gardes réalisées »: avis-etoiles (D-18).
- « Prochaines disponibilités » on the profile: disponibilites-indicatives (D-12).
- Search, profile cards in search results, the DA card's « Envoyer une demande » from a result, public teaser pages: recherche-et-fiches-publiques (D-11, D-14).
- A favourites list: the guide's « professionnelle favorite » is read as any profile the family opens; her past bookings are the list of known professionals.
- Copying an ended request into a new one; declining one answer at a time; a cap on answers.
- Answers and bookings in the admin back-office: back-office-admin.
- E-mails on withdrawal, SMS or push notifications, e-mail preferences.
- Scope decisions this run neither builds nor changes: D-4 (the rate range, already enforced on the profile), D-5, D-6, D-7, D-11, D-12, D-13, D-14, D-16, D-17, D-18, D-20, D-21, D-22, D-23, D-25, D-26, D-27.

## Open questions

- none. Non-blocking notes: D-74 (the rate frozen at the answer), D-75 (the family's full-profile page and the photo opened to parents), D-76 (the edit lock while answers are pending), D-77 (the address required to accept, read live) and D-78 (« Bonne nuit. ») are Define's choices, not the sources'; `revise` changes them. frais-de-service's open point on the fee base should read the booking's `night_rate_eur`, which is the answered rate.

Context budget: read Surya's editorial guide (« La mise en relation », « La réservation », « Les e-mails ») and the DA's « Cartes et blocs de contenu » page beyond the Inputs table, to quote the buttons, the card lines and the e-mails exactly; read the frais-de-service, messagerie and cycle-de-garde-et-annulation stubs to draw this run's edges against them.
