# Spec: The founders' back-office

- slug: back-office-admin
- personas: admin, parent, professionnel
- touches: src/db/schema.ts, drizzle/**, src/lib/admin/**, src/components/admin/**, src/app/(portail)/admin/**, src/content/admin.ts, src/content/admin.test.ts, src/content/comptes.ts, src/content/emails.ts, src/lib/email/templates.ts, src/lib/auth/guard.ts, src/lib/auth/current-user.ts, src/lib/auth/routing.ts, src/lib/auth/routing.test.ts, src/app/(auth)/actions.ts, src/app/(auth)/connexion/**, src/lib/recherche/**, src/app/sitemap.ts, src/lib/reservations/answers.ts, src/lib/reservations/bookings.ts, src/lib/reservations/profiles.ts, src/lib/demandes/requests.ts, src/lib/demandes/notify.ts, src/lib/gardes/gardes.ts, src/lib/avis/ratings.ts, src/lib/messagerie/conversations.ts, src/lib/paiements/payments.ts, src/lib/documents/**, src/lib/disponibilites/**, src/lib/famille/**, src/components/gardes/absences-table.tsx, src/app/(portail)/design-system/portail/page.tsx, README.md, AGENTS.md
- complexity: complex

## Problem

The founders can verify a professional's file, refund a fee and read the ratings and reported
absences, but they cannot see the platform as a whole: who is on it, which requests are open,
which gardes are coming, what was paid this week, and they have no way to stop an account that
misbehaves. The cahier des charges makes this a Must Have (H « Tableau de bord admin », « Gestion
utilisateurs », « Suivi des paiements »; C « Gestion admin des comptes »), and Surya's guide
writes the tool (« Le backoffice »: « Vue d'ensemble », its four blocks, the user search, the five
actions on an account, a confirmation naming the person, the immutable journal; scope D-19). A
dispute arrives by e-mail (D-17), so what the founders need in-app is a count of what went wrong
and a way to act on the account. It advances the Plateforme Berceo V1 objective: a first usable
version on uat.berceo.be before December 2026, for a launch in January 2027.

What already exists and stays: the verification queue and file page (`/admin/dossiers/[id]`), the
students switch (D-7), the journal (`/admin/journal`, D-54), the fees (`/admin/paiements`), the
reported absences (`/admin/absences`) and the ratings (`/admin/avis`). This run adds the overview,
the accounts, the requests, the bookings and the reports, and hangs everything off one navigation.

## Proposed change

**Navigation (D-132).** Every admin page carries the same navigation: « Vue d'ensemble »,
« Dossiers », « Utilisateurs », « Demandes », « Réservations », « Signalements », « Paiements »,
« Avis », « Journal » (`@relecture` for all but the first). `/admin` becomes the overview. The
verification queue and the students switch, today on `/admin`, move to `/admin/dossiers`
unchanged. `/admin/absences` redirects permanently to `/admin/signalements`, which supersedes it.
Every admin page stays a 404 to anyone but an admin (D-33) and `noindex`. « Pro » is allowed in
the back-office only (the guide's lexicon).

**« Vue d'ensemble » (`/admin`).** The guide's four blocks, each a number and a link to the list
that shows exactly those rows (D-133):

| Block | Counts | Links to |
| --- | --- | --- |
| « Dossiers en attente de validation » | the files the verification queue lists | `/admin/dossiers` |
| « Réservations en cours » | confirmed gardes not yet ended: *à venir* and *en cours* by the clock | `/admin/reservations?etat=en-cours` |
| « Signalements à traiter » | cancelled gardes (by either side) and reported absences not yet marked handled | `/admin/signalements` (default filter « À traiter ») |
| « Paiements récents » | fees paid in the last 7 days, by payment instant | `/admin/paiements?periode=7j` |

The number and its list come from one query each, so they cannot disagree.

**Accounts (`/admin/utilisateurs`).** A search field labelled « Rechercher un utilisateur par
nom, e-mail ou téléphone » (the guide) matches, case- and accent-insensitively, on first name, last
name, « prénom nom », e-mail and phone (digits only, so `0470 12 34 56`, `+32470123456` and
`470123456` all find the same number). Without a query the page lists the most recent accounts
first. Rows show name, role (« Famille », « Pro », « Admin »), e-mail, phone, state (« Actif »,
« Suspendu »), sign-up date; paged like the journal. Deleted accounts never appear.

**The profile view (`/admin/utilisateurs/[id]`, « Voir le profil »).** Identity (name, role,
e-mail, phone, sign-up date, state and since when); for a family, her commune (never the address,
D-15), her requests and gardes as links to the lists filtered on her; for a professional, her file's
status with a link to `/admin/dossiers/[id]`, her profession, communes, rate, note and gardes count
(read from `src/lib/avis/`), her answers and gardes as links; the journal entries about the account
(`journalFor`). The actions follow, per the guide: « Contacter l'utilisateur », « Suspendre le
compte » or « Réactiver le compte » (whichever applies), « Supprimer le compte ». An admin account
shows the view with no actions: an admin cannot suspend, delete or contact another admin, or herself.

**Suspending (D-134).** « Suspendre le compte » opens a confirmation dialog naming the person
(« Suspendre le compte de Prénom Nom ? », `@relecture`) in the D-24 red. If the account has upcoming
confirmed gardes (*à venir* or *en cours*), the dialog lists them (date, the other side's name and
phone) and says they are not cancelled: the founders handle them themselves. On confirmation, in
one transaction: the account is marked suspended (instant and administrator), every *en_attente*
answer of hers becomes *retiree*, every *ouverte* request of hers becomes *annulee* the way a
family's own cancellation does (its waiting answers declined, same notifications), and a
`compte_suspendu` journal entry is written with the administrator's name. Confirmed gardes are not
touched. From then on:

- she cannot sign in: the sign-in form refuses with « Votre compte est suspendu. » plus a line in
  the guide's rules that invents no contact address (`@relecture`); a session already open ends at
  her next page load or action, landing on the same message;
- a suspended professional disappears wherever a family or the public could find her: the search,
  the public teaser page (404), the per-commune pages, the sitemap, the family's view of a
  professional (`espace/famille/professionnelles/[id]`, 404), the priority-request candidates, and
  the recipients of the urgent e-mail and the daily digest;
- no new answer, booking or priority request can involve her: a family's Checkout that completes
  after the suspension ends in the existing « booking no longer possible » refund (frais-de-service,
  reason `reservation_impossible`);
- e-mails that invite action she can no longer take are not sent to her (the digest, the urgent
  e-mail, the rating invitation, the new-message e-mail); the reminder of the day before is still
  sent to both sides of a garde that stands, since the garde stands.

A suspended family is handled the same way on its side: sign-in refused, open requests cancelled,
no new request, answer or booking possible.

**Reactivating (D-135).** « Réactiver le compte », with a dialog naming the person in the D-24
green, clears the suspension and writes `compte_reactive`. She can sign in again and a `valide`
professional reappears everywhere. What the suspension withdrew or cancelled is not restored.

**Deleting (D-136, D-137).** « Supprimer le compte » is offered only on a suspended account with no
upcoming confirmed garde; otherwise it is shown disabled with the reason (« Suspendez d'abord le
compte », « Des gardes sont à venir », `@relecture`). Its dialog names the person, says the act is
irreversible, and asks the founder to type the person's last name to confirm (D-24 red). On
confirmation the account is **anonymised, not erased**:

- the `users` row stays (its id holds the history) with first name « Compte », last name
  « supprimé », a unique non-deliverable e-mail (`supprime-<id>@invalid`), no phone, and a deletion
  instant; it stays suspended, so every filter above keeps hiding it;
- the family profile (commune, address, context) is deleted;
- the professional's bio, communes and availability are deleted, her documents are deleted from
  the private bucket and their rows removed (D-41: a validated file keeps its documents only while
  the account exists), and her profile's personal fields are cleared;
- her Neon Auth identity (user, sessions, accounts) is deleted, so she cannot sign in and the same
  e-mail can sign up again as a new account;
- requests, answers, bookings, payments, conversations and ratings stay as records attached to
  « Compte supprimé »; ratings she gave keep counting in the other side's note, and payments already
  outlive an account (D-96);
- a `compte_supprime` journal entry is written; the journal keeps the name as it was (D-54).

The whole anonymisation is one transaction on the database; the bucket deletion runs after it
commits and a failure there is retried by the existing purge path rather than rolling the
anonymisation back.

**Contacting (D-138).** « Contacter l'utilisateur » opens a form (subject, message) on an active or
suspended account. Sending e-mails the user from Berceo's transactional sender in the existing
e-mail frame, with the message as plain text, and with **Reply-To set to the sending founder's own
account e-mail**, so the answer reaches her and no address is invented. A `utilisateur_contacte`
journal entry records the subject; the message itself is not stored. A send failure shows an error
and writes no entry.

**Requests (`/admin/demandes`).** Every care request, newest night first: the night and start time,
commune, family (link to her profile view), urgent flag, number of answers, and its state with the
labels the spaces already use. Filters by state and by family (`?famille=<id>`). Paged.

**Bookings (`/admin/reservations`).** Every booking, nearest night first: the night, the family and
the professional (links to their profile views, with « Suspendu » beside a suspended one), the rate,
the fee's status, and the garde's state by the clock (*à venir*, *en cours*, *terminée*, *annulée*)
read from `src/lib/gardes/`. Filters: `etat=en-cours` (*à venir* and *en cours*, the dashboard's
block), each single state, and by account (`?compte=<id>`). Paged.

**Reports (`/admin/signalements`, D-139).** Replaces « Absences signalées »: every cancelled garde
(by the family, by the professional) and every reported absence, newest first, with the side, the
reason given if any, the fee's status and a link to the payments page for a refund (D-101, unchanged).
Filter « À traiter » (default) or « Tous ». Each untreated row has « Marquer comme traité »; it
records the instant and the administrator on the booking and writes a `signalement_traite` journal
entry; the row then shows « Traité le … par … ». Marking is not reversible.

**Payments.** `/admin/paiements` gains the `periode=7j` filter the dashboard links to (fees whose
payment instant is in the last 7 days); without it the page is as today.

**Ratings and journal.** `/admin/avis` and `/admin/journal` are unchanged apart from the navigation;
the journal shows the five new actions with their labels (`@relecture`).

**Data (one migration, D-140).** `users` gains `suspended_at`, `suspended_by`, `deleted_at`;
`bookings` gains `report_handled_at`, `report_handled_by`; `admin_action` gains `compte_suspendu`,
`compte_reactive`, `compte_supprime`, `utilisateur_contacte`, `signalement_traite`. A check keeps
`deleted_at` only on a suspended row. The journal's trigger is untouched.

**Words.** Every label, dialog, error and the contact e-mail's frame lives in `src/content/admin.ts`,
`src/content/comptes.ts` and `src/content/emails.ts`, in the guide's rules (vouvoiement, no `!`,
`…` or `—`), `@relecture` on anything the guide does not quote. The guide's back-office tone:
functional and direct.

## Acceptance criteria

- [ ] `/admin` shows « Vue d'ensemble » with the four blocks, each a number and a link; for each block, the number equals the row count of the list it links to, on seeded data covering every state.
- [ ] The verification queue and the students switch work unchanged at `/admin/dossiers`; `/admin/absences` redirects to `/admin/signalements`; every admin page carries the navigation and is a 404 to a signed-out visitor, a family and a professional.
- [ ] A founder finds any active or suspended account in one search by first name, last name, full name, e-mail or phone in any of the three notations; a deleted account is never found.
- [ ] The profile view shows the account's identity, state, related lists and journal entries, never a family's address, and shows no action on an admin account.
- [ ] Suspending asks for confirmation naming the person, lists the upcoming gardes if any, and on confirmation withdraws her waiting answers, cancels her open requests, leaves her confirmed gardes as they were, and writes `compte_suspendu` with the administrator's name.
- [ ] A suspended professional is absent from the search, the public and per-commune pages, the sitemap, the family's professional view, the priority candidates and the urgent and digest recipients; a Checkout completing after her suspension is refunded as « booking no longer possible ».
- [ ] A suspended account's sign-in is refused with the suspension message, and an already-open session lands on that message at its next page load or action.
- [ ] Reactivating asks for confirmation naming the person, restores sign-in and, for a `valide` professional, her presence in search and on her public page, and writes `compte_reactive`.
- [ ] Deletion is refused on an active account and on one with an upcoming garde; on a suspended account without one, after typing the last name, the account is anonymised as specified, her documents are gone from the bucket, her Neon Auth identity is gone, her bookings, payments and ratings remain under « Compte supprimé », and `compte_supprime` is written.
- [ ] « Contacter l'utilisateur » sends the e-mail with Reply-To set to the sending founder's address and writes `utilisateur_contacte` with the subject; a failed send writes nothing.
- [ ] `/admin/demandes` and `/admin/reservations` list every request and booking with their states and filters; `/admin/signalements` lists cancellations and absences, and « Marquer comme traité » removes the row from « À traiter » and from the dashboard count and writes `signalement_traite`.
- [ ] Every admin action of this run (suspend, reactivate, delete, contact, mark handled) appears in `/admin/journal` with the date, time, action, account and administrator's name, and the journal still refuses update and delete.
- [ ] Every new word is in the content catalogue, passes the catalogue tests, and the pages keep the DA (no shadow, red and green only in the confirmation dialogs, D-24).

## Out of scope

- Content editing of the vitrine, internal notes on an account, a quality board, exports of any list (the stub; cahier des charges « plus tard », CH).
- Automatic cancellation or refund of a suspended account's confirmed gardes: the founders handle them (D-134); an admin action that cancels a garde.
- An automatic e-mail telling a user she was suspended, reactivated or deleted; the founders use « Contacter l'utilisateur ».
- A reason field on a suspension, and storing the body of a contact e-mail.
- Restoring what a suspension withdrew or cancelled, on reactivation.
- Erasing the content of messages a deleted account wrote: conversations stay readable to the other side (D-16), under « Compte supprimé ».
- Deleting, hiding or moderating a rating; the ratings list beyond the navigation (avis-etoiles).
- A self-service « delete my account » for users; suspending or deleting an admin account; granting admin rights from the back-office (stays `npm run admin:grant`, D-33).
- Search beyond name, e-mail and phone (by commune, by state), sort options, and filters not named above.
- In-app disputes (D-17), refunds beyond the existing button (D-101).
- Scope decisions this run neither builds nor changes: D-1 to D-16, D-18, D-20 to D-23, D-25 to D-27.

## Open questions

- none

## Decisions taken at Define

- D-132 — One admin navigation; `/admin` becomes « Vue d'ensemble »; the queue and the students switch move to `/admin/dossiers`; `/admin/absences` redirects to `/admin/signalements`. Define.
- D-133 — Each overview block is one query shared with its list, so number and list cannot disagree. « Paiements récents » is the last 7 days by payment instant. Define.
- D-134 — Suspension freezes the account: sign-in refused, hidden everywhere, waiting answers withdrawn and open requests cancelled at once, confirmed gardes left as they are and listed in the dialog for the founders to handle. Operator, Define, 2026-09-25.
- D-135 — Reactivation restores access and visibility, not what the suspension withdrew. Define.
- D-136 — Deletion is anonymisation, allowed only on a suspended account with no upcoming garde, confirmed by typing the last name; the Neon Auth identity is deleted so the e-mail can sign up again. Operator, Define, 2026-09-25.
- D-137 — A deleted account's records (requests, answers, bookings, payments, conversations, ratings, journal) stay under « Compte supprimé »; its documents, profile details, communes, availability and family profile are deleted. Define.
- D-138 — « Contacter l'utilisateur » sends an in-app e-mail from the transactional sender with Reply-To the founder's own account address, journaled with its subject only. Operator, Define, 2026-09-25.
- D-139 — « Signalements à traiter » counts cancelled gardes and reported absences not yet marked handled; « Marquer comme traité » is journaled and not reversible. Operator, Define, 2026-09-25.
- D-140 — One migration: suspension and deletion columns on `users`, the handled marker on `bookings`, five new `admin_action` values. Define.

Context budget: over the Inputs table. The guide's « Le backoffice » section was read for its verbatim labels; `src/db/schema.ts`, `src/lib/admin/journal.ts`, `src/lib/auth/guard.ts`, the current `/admin` page and the archived specs of onboarding-professionnelle, verification-back-office, frais-de-service, avis-etoiles and recherche-et-fiches-publiques were read for the deferrals they left to this stub (retention D-41, the journal D-54, the suspension refund, ratings of a suspended account, hiding suspended professionals).
