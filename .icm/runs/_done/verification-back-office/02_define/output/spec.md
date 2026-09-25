# Spec: The founders' verification queue and the admin journal

- slug: verification-back-office
- personas: admin, professionnel
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/admin/**, src/app/(portail)/espace/professionnelle/**, src/app/api/cron/**, src/lib/admin/**, src/lib/professionnelle/**, src/lib/settings/**, src/lib/email/**, src/components/admin/**, src/content/admin.ts, src/content/emails.ts, src/content/professionnelle.ts, vercel.json, .env.example, README.md, AGENTS.md
- complexity: standard

## Problem

A professional can now submit her file (`onboarding-professionnelle`), but nobody can read it. It
sits in `en_attente` for good. The whole brand rests on "chaque profil est vérifié manuellement"
(D-5, D-8: the manual check is the reassurance, not an insurance), and Alix and Jordane have no
screen to do that check, no way to tell the professional the outcome, and no trace of what they
did. Every later stub that shows a professional to a family (7, 8, 15) reads only `valide` files,
so nothing downstream works until a file can be validated. This is stub 5 of 15 of Plateforme
Berceo V1, whose objective is a first usable version on uat.berceo.be before December 2026 for a
launch in January 2027.

## Proposed change

**Where it lives.** The admin space stays at `/admin` (under `src/app/(portail)/admin/`), behind
the existing guard: anyone but an admin, signed in or not, gets a 404 (D-33). Every page is
`noindex`. `/admin` becomes the queue, followed by the existing "Réglages" section (the students
switch) and a link to the journal. Two new pages: `/admin/dossiers/[id]` (one file) and
`/admin/journal`. Every server action checks the admin role at runtime, whatever the page showed
(Learned rules).

**The queue: "Dossiers en attente de vérification"** (the guide's title). A table of every file in
`en_attente` or `complement_demande`, oldest first by `submitted_at`. Columns are the guide's:
Prénom / Nom, Profession, Date d'inscription (the date she sent her file, `submitted_at`),
Documents déposés (the kinds and the number of files, e.g. "diplôme (2)"), Statut. The Statut
column reads one of four values (`@relecture`):

- "En attente", an `en_attente` file;
- "Complément demandé", a `complement_demande` file (waiting on her);
- "Complément reçu", an `en_attente` file she sent back after a complément;
- "Étudiantes non admises", a student file while the students switch is off (see below).

Each row opens the file. An empty queue says so in one line. On a phone the table scrolls
horizontally inside its card; the page never does.

**The file view** (`/admin/dossiers/[id]`) shows, read-only:

- her identity: first name, surname, e-mail, phone, the date her account was created and the date
  she sent her file;
- her profile: photo, profession, spécialisations, zone (commune names), night rate, experience,
  "Quelques mots sur moi", and the INAMI number where her profession has one;
- each document inline: an image as an image, a PDF embedded, each with a link that opens it in a
  new tab. Every file comes through `/api/fichiers/[id]`, which already serves admins; no store
  URL reaches the browser;
- the declarations she accepted, each with its wording version and date;
- the file's history: every journal entry about this account, newest first, with the reasons.

The three actions sit at the bottom, only while the file is `en_attente` or
`complement_demande`: "Valider le profil", "Demander un complément", "Refuser le profil". A file in
any other state (a draft, a validated or refused file opened by URL) shows no action.

**The three actions.** Each opens a confirmation dialog built on `confirm-dialog.tsx` (red and
green only there, D-24: green to validate or request, red to refuse).

- **Valider le profil.** The dialog is the guide's line with her name: "Êtes-vous sûre de vouloir
  valider le profil de [Prénom Nom] ? Cette action activera son compte et rendra son profil
  visible." Confirming moves the file to `valide` and sends the validation e-mail.
- **Demander un complément.** The dialog asks for the reason ("Motif", required). Confirming moves
  the file to `complement_demande`, stores the reason on the file and sends the complément
  e-mail with it.
- **Refuser le profil.** The dialog asks for the reason (required). Confirming moves the file to
  `refuse`, stores the reason and the moment of refusal, and sends the refusal e-mail with it.

A reason is plain text, trimmed, 1 to 1,000 characters, refused on the form and the server when
empty or longer. It is escaped wherever it is shown or sent. The dialogs other than the guide's
validation line are `@relecture`.

Each action takes effect only if the file is still in a state that allows it when the server
receives it. If two founders act on the same file, the second is told the file has already been
handled and nothing changes (no second e-mail, no second journal entry). The state change and its
journal entry are written in one transaction. The e-mail is sent after the commit, once per
decision (a Resend idempotency key per decision). If Resend refuses it, the decision stands and
the founder sees that the e-mail did not leave; resending it is not built here.

**The e-mails (D-19, D-8).** Built on the existing layout in `src/lib/email/templates.ts`, words in
`src/content/emails.ts`:

- **Validation.** The guide's e-mail verbatim: subject "Votre profil Berceo est activé", body
  "Votre dossier a été vérifié. Votre profil est maintenant visible et vous pouvez accéder aux
  demandes de garde dans votre zone. Bienvenue dans le réseau.", button "Voir les demandes
  disponibles", pointing to `/espace/professionnelle` until the requests list exists (stub 7). No
  insurance wording.
- **Complément.** The guide's message with the contact address removed, since Berceo has none
  yet: "Nous avons bien reçu votre dossier. Pour finaliser votre inscription, nous avons besoin
  d'un complément : [motif]. Merci de nous transmettre ce document via votre espace personnel."
  Button to `/espace/professionnelle/profil`. Subject and button are `@relecture`; so is the
  shortened last sentence.
- **Refusal.** The guide's message without its last sentence ("Si vous pensez qu'il s'agit d'une
  erreur, contactez-nous à [email]"), for the same reason: "Nous avons examiné votre dossier avec
  attention. Malheureusement, nous ne sommes pas en mesure d'activer votre profil pour la raison
  suivante : [motif]." Subject and button (to `/espace/professionnelle`) are `@relecture`.

Once Berceo has a published address, a tweak adds the guide's contact sentences back.

**What she sees in her space.** `/espace/professionnelle` shows, by state:

- `valide`: the guide's line "Votre profil Berceo a été validé. Vous pouvez désormais accéder aux
  demandes de garde dans votre zone. Bienvenue dans le réseau." in place of today's "Votre profil
  est validé.";
- `complement_demande`: that a complément was asked, the reason, and a link to
  `/espace/professionnelle/profil`;
- `refuse`: that her file was refused and the reason. The file stays locked, as today. The
  sentence pointing her to "l'équipe Berceo" goes, since there is no address to reach them;
- a student file held by the switch (see below): a line saying student files are held until
  Berceo admits students, and that nothing is asked of her.

**Answering a complément.** While `complement_demande`, she edits her file on
`/espace/professionnelle/profil` exactly as she can while `en_attente` (onboarding rules, D-48
included). The page shows the reason at the top and a button "Renvoyer mon dossier"
(`@relecture`). It sends the file back to `en_attente`. `submitted_at` does not change, so the file
keeps its place in the queue, and the queue reads "Complément reçu". She does not tick the
declarations again. The button is refused on the server unless the file is `complement_demande`
and complete.

**Refusal is final.** A refused file cannot be edited or sent again (today's lock). The account
stays and she can still sign in to read the reason. A founder reversing a refusal is out of scope.

**The purge of a refused file (D-41, operator 2026-09-24).** Thirty days after the refusal, a
scheduled job deletes every file of that profile, documents and photo, from the bucket and from
`professional_documents`. The profile row, the declarations and the journal stay. The job is a
route under `src/app/api/cron/` that answers only a request carrying `Authorization: Bearer
<CRON_SECRET>` and 404 to any other. `vercel.json` schedules it once a day. It is idempotent: a
second run finds nothing to delete. Each profile purged writes one journal entry. Vercel runs cron
jobs only on the production deployment, so on uat.berceo.be and previews the route is proven by
calling it with the secret. `CRON_SECRET` is declared by name in `.env.example`; Build sets it for
the Preview and `uat` environments; production's is the operator's.

**The students switch (D-7, D-39).** It stays on `/admin` as built. With it off, a student file
(`etudiante_sage_femme`) that is `en_attente` is held. It stays `en_attente` in the database and
no new state is added. The queue reads "Étudiantes non admises". "Valider le profil" is shown
disabled with the reason, and the server refuses it too. "Demander un complément" and "Refuser le
profil" stay available. Her space says why (above). Turning the switch on releases every held file
into the ordinary queue at its original place. The rule is one pure function in
`src/lib/professionnelle/rules.ts` (or `src/lib/admin/`), tested.

**The admin journal: "Journal des actions administratives."** One table, `admin_journal`, one row
per admin action: when, the action, the account concerned, the administrator, and a detail (the
reason, or the switch's new value). This run writes:

- "Profil validé", "Complément demandé", "Profil refusé" (with the reason);
- "Réglage : étudiantes admises" / "étudiantes non admises" (the students switch, which today is
  logged only on `app_settings`);
- "Documents supprimés" by the purge, with "Berceo (automatique)" as the administrator.

Every later admin action (stub 14: suspension and the rest) writes through the same helper,
`src/lib/admin/journal.ts`. The journal cannot be edited or deleted:

- the code has no update or delete path for it;
- a database trigger refuses any `UPDATE` or `DELETE` on the table, whoever sends it;
- the account concerned and the administrator are kept as ids with their names as they were when
  the action was taken, without foreign keys, so deleting an account later never rewrites or
  removes an entry.

`/admin/journal` lists it newest first, 50 per page, with the guide's columns: Date, Heure,
Action, Compte concerné, Administrateur. The reason shows under the action. Times are
Europe/Brussels.

**Data model (one migration, generated by drizzle-kit, the trigger added in the same file).**

- `professional_profiles` gains `review_reason` (text, nullable: the reason of the last complément
  or refusal, cleared on validation) and `reviewed_at` (timestamptz, nullable: when the last
  decision was taken; the purge counts thirty days from it on a refused file).
- `admin_journal`: `id`, `occurred_at`, `action` (an enum of the actions above), `subject_user_id`
  and `subject_name` (nullable, for a switch), `admin_user_id` (null for an automatic action) and
  `admin_name`, `detail` (text, nullable). An index on `occurred_at` and one on `subject_user_id`.
  The trigger refusing `UPDATE` and `DELETE`.

**Words (D-19).** Every visible string lives in `src/content/admin.ts`,
`src/content/professionnelle.ts` or `src/content/emails.ts`. The guide's verbatim lines are the
queue's title and columns, the three action names, the validation dialog, the validation e-mail,
the complément and refusal bodies up to the removed contact sentences, the in-space validated line
and the journal's title and columns. Every other entry carries `@relecture Surya` with why. No
`!`, `…` or `—`, no insurance wording (D-8), and students are never called "diplômées" (D-7). The
guide's "Êtes-vous sûre" is kept as written.

**Look (D-9).** Built from the socle's components and tokens: `table.tsx`, `badge.tsx` for the
Statut, `confirm-dialog.tsx`, the existing cards. New components go under
`src/components/admin/`.

## Acceptance criteria

- [ ] An admin opening `/admin` sees "Dossiers en attente de vérification": every `en_attente` and `complement_demande` file, oldest `submitted_at` first, with the columns Prénom / Nom, Profession, Date d'inscription, Documents déposés and Statut. Drafts, validated and refused files are not listed. An empty queue says so.
- [ ] Opening a row shows her identity, her whole profile, every document and her photo inline through `/api/fichiers/[id]` (PDFs embedded, images shown, each with an "open in a new tab" link), the five declarations with version and date, and the file's journal history.
- [ ] "Valider le profil" asks for confirmation with the guide's sentence and her name. Confirming moves the file to `valide`, clears `review_reason`, records `reviewed_at`, writes a "Profil validé" journal entry and sends the guide's validation e-mail. Her space then shows the guide's validated line. No part of the e-mail or the page mentions an insurance.
- [ ] "Demander un complément" and "Refuser le profil" cannot be confirmed without a reason of 1 to 1,000 characters (form and server). Confirming stores the reason, moves the file to `complement_demande` or `refuse`, writes the journal entry with the reason, and sends the e-mail carrying the reason. The professional reads the same reason in her space. No e-mail contains a placeholder or a contact address.
- [ ] While `complement_demande`, she can edit her file and "Renvoyer mon dossier" returns it to `en_attente` with the same `submitted_at`; the queue then reads "Complément reçu" at the file's original place. The server refuses "Renvoyer" from any other state.
- [ ] A refused file stays locked for her, shows the reason, and cannot be sent again.
- [ ] An action on a file that is no longer in an allowed state (another founder acted first, or the page is stale) changes nothing, writes no journal entry, sends no e-mail, and tells the founder the file was already handled. A unit test covers the allowed transitions.
- [ ] If Resend refuses an e-mail, the decision and its journal entry stand and the founder is told the e-mail did not leave.
- [ ] With the students switch off, an `en_attente` student file reads "Étudiantes non admises" in the queue, "Valider le profil" is disabled and refused by the server, the other two actions work, and her space says why her file is held. Turning the switch on shows the file as "En attente" at its original place and lets it be validated. Unit tests cover the rule.
- [ ] Each validation, complément, refusal, students-switch change and purge writes exactly one `admin_journal` row with its date and time, action, account concerned and administrator. `/admin/journal` lists them newest first, 50 per page, with the guide's columns, in Europe/Brussels time.
- [ ] The journal has no update or delete path in the code, and the migration installs a trigger that refuses `UPDATE` and `DELETE` on `admin_journal`. A test proves the trigger is in the migration and refuses both statements.
- [ ] A parent, a professional and a signed-out visitor get a 404 on `/admin`, `/admin/dossiers/[id]` and `/admin/journal`, and each new server action refuses a non-admin at runtime. Tests cover the actions' role check.
- [ ] The purge route answers 404 without the right `CRON_SECRET` bearer. With it, it deletes from the bucket and from `professional_documents` every file of each profile refused more than 30 days ago, leaves profiles refused less than 30 days ago untouched, writes one "Documents supprimés" journal entry per purged profile, and a second call deletes nothing. `vercel.json` schedules it daily. Unit tests cover the selection and the idempotence.
- [ ] The migration, generated by drizzle-kit, adds `review_reason` and `reviewed_at` to `professional_profiles` and the `admin_journal` table with its enum, indexes and trigger. The journal test passes, and a preview and uat.berceo.be apply it through `vercel-build`.
- [ ] Every visible word of the queue, the file view, the dialogs, the journal, the three e-mails and the professional's new lines lives in `src/content/`. Entries not verbatim from the guide carry `@relecture Surya`. No `!`, `…`, `—` or insurance wording appears, and the content tests pass.

## Out of scope

- The dashboard "Vue d'ensemble", user search, suspension, reactivation, contacting or deleting an account (stub 14, `back-office-admin`). They will write to this journal.
- Showing a validated profile to families: search, full profiles and teaser pages (stubs 7, 8, 15). This run sets `valide`, which is what they read.
- Reversing a refusal, or a refused professional starting over (operator, 2026-09-25).
- A contact address in the complément and refusal e-mails, and the "contactez-nous" sentence. They come with a tweak once Berceo publishes an address (standing rule: never invent a contact).
- Resending an e-mail that Resend refused.
- Notifying the founders when a file is submitted or sent back.
- Internal admin notes and a quality board (annotated "plus tard" in the cahier des charges).
- Automated document checks, AI-assisted triage, identity checks (D-5).
- Account deletion, and what it does to journal names under data-protection rules (a later stub; the journal keeps names as snapshots and has no foreign key, so that stub decides).
- Scope decisions this run neither builds nor changes: D-1 to D-4, D-6, D-10 to D-18, D-20 to D-23, D-25 to D-27.

## Open questions

- none

Context budget: over the Inputs table. Surya's guide (`.icm/processed/2026-09-23-guidelines-ditoriale-seo-berceo.txt`, "L'outil de vérification", "Les e-mails", "Le backoffice") was read for verbatim lines. The `onboarding-professionnelle` spec and decisions (D-38 to D-49), `src/db/schema.ts`, `src/lib/professionnelle/rules.ts`, `src/lib/settings/`, `src/lib/email/`, `src/lib/documents/serve.ts` and `/admin` were read to fix the states, routes and data model. Operator decisions of 2026-09-25 in session: "Renvoyer mon dossier" after a complément, no contact address in the e-mails until one exists, the students hold derived rather than a new state, a refusal final.
