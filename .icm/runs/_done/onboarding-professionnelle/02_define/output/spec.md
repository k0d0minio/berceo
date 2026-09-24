# Spec: The professional's four-step onboarding and profile

- slug: onboarding-professionnelle
- personas: professionnel, admin
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/espace/professionnelle/**, src/app/(portail)/admin/**, src/app/api/fichiers/**, src/lib/professionnelle/**, src/lib/documents/**, src/lib/communes/**, src/lib/settings/**, src/components/professionnelle/**, src/content/professionnelle.ts, src/content/admin.ts, scripts/communes/**, package.json, package-lock.json, .env.example, README.md, AGENTS.md
- complexity: complex

## Problem

A professional can create an account (`comptes-neon-auth`), but after verifying her e-mail she
lands on a page that only says her account is pending. She has no profile, no documents and no way
to be verified. Nothing downstream works until she has said who she is, where she works and what
she charges, and the founders can see her file: the verification queue (stub 5), the requests list
(stub 7), availability (stub 13) and search (stub 15) all read it. This is stub 4 of 15 of
Plateforme Berceo V1, whose objective is a first usable version on uat.berceo.be before
December 2026 for a launch in January 2027. It completes the professional's half of D-21 and the
qualification check of D-5.

## Proposed change

**The four steps (D-21).** Once her e-mail is verified, a professional whose file is still a draft
can only use the onboarding. `/espace/professionnelle` sends her to the first step not yet
complete. Every page shows the four numbered steps with the guide's titles and a progress bar.
Step 1 "Créez votre compte" is shown as done. Step 2 is "Complétez votre profil", step 3 "Déposez
vos justificatifs", step 4 "Validez vos déclarations". Routes:
`/espace/professionnelle/inscription/profil`, `…/justificatifs`, `…/declarations`. All are
`noindex` and use the existing role guard. She can go back to any earlier step. A later step opens
only once the steps before it are complete. Each step has "Continuer", which saves the step and
requires it to be complete, and "Enregistrer et reprendre plus tard", which saves whatever valid
fields she has filled, even if the step is incomplete, and leaves her on the page. Nothing she has
entered is lost between sessions.

**Step 2, "Complétez votre profil".** It uses the guide's labels.

- **Ma profession**, required, one of four: sage-femme, infirmière en néonatologie, puéricultrice,
  étudiante sage-femme (3e ou 4e année) [D-7]. The student option is offered only while the
  founders' switch is on (see below). A file that already carries it keeps it when the switch is
  turned off, and can still be submitted. The founders decide at review.
- **Mes spécialisations**, optional, any number from a fixed draft list stored as keys:
  allaitement, prématurité, jumeaux, réanimation néonatale, sommeil du nourrisson, soutien
  post-partum. The list lives in the catalogue, tagged `@relecture`, for the founders and Surya
  to correct.
- **Ma zone d'intervention**, required, one to fifty Belgian communes [D-11]. It is picked from a
  searchable list that matches the commune's name (French, and Dutch where it differs) or one of
  its postcodes. Only NIS codes are stored, never free text.
- **Mon tarif de nuit**, required, a whole number of euros from 100 to 300 inclusive [D-4]. The
  form, the server and a database `CHECK` all refuse anything outside that range. There is no
  suggested or automatic tariff and no separate student range.
- **Mon expérience**, required, one of: moins d'un an, un à trois ans, trois à cinq ans, plus de
  cinq ans (`@relecture`).
- **Quelques mots sur moi**, required, up to 500 characters with a live counter, and a hint that
  invites her to write in the first person.
- **A photo**, required, JPEG, PNG or WebP, up to 5 MB, shown as a preview once uploaded.

**Step 3, "Déposez vos justificatifs" (D-5, D-6).** The documents required depend on her
profession:

| Profession | Required |
| --- | --- |
| sage-femme | diplôme + numéro INAMI |
| infirmière en néonatologie | diplôme + numéro INAMI |
| puéricultrice | diplôme ou certificat de puériculture |
| étudiante sage-femme (3e ou 4e année) | attestation d'inscription for the current academic year |

Each required document takes one to three files (front and back, several pages), as PDF, JPEG,
PNG or WebP, up to 10 MB each. She can remove or replace a file. A replaced or removed file is
deleted from storage at once. The INAMI number is a typed field, not an upload: 11 digits, with
spaces, dots and dashes accepted on input and stored as digits only. There is no checksum check,
because the founders verify it. It is never shown to families. The criminal record is not an
upload. It is a declaration at step 4 [D-6]. When she changes profession, documents of a kind her
new profession does not require are deleted, and the INAMI number is cleared if it is no longer
required.

**Step 4, "Validez vos déclarations" (B-07, D-6).** There are five checkboxes, all required:

1. the cahier des charges' four sworn declarations, as written there, feminised per the guide
   ("autorisée"), and
2. "Je déclare que mon extrait de casier judiciaire destiné aux activités avec des mineurs est
   vierge." (`@relecture`).

Submitting stores one row per declaration: its key, the wording version (`cdc-2026-08-02`, one
constant, until the founders deliver the final wording) and a timestamp. Rows are append-only,
like `user_consents`. The button is "Envoyer mon dossier" (`@relecture`). After submitting she
sees the guide's message verbatim: "Votre dossier est bien reçu. Nous le vérifierons dans les
24 heures ouvrables. Vous recevrez un e-mail dès que votre profil sera activé."

**States and visibility.** A professional's file has one state: `brouillon` (draft, the default),
`en_attente` (submitted), and three states that stub 5 will set and this run only declares:
`complement_demande`, `valide`, `refuse`. Submitting moves `brouillon` to `en_attente` and records
`submitted_at`. Only a `valide` profile may ever be shown to anyone but its owner and the admins.
Nothing in this run shows a profile to anyone else. While `en_attente`, `/espace/professionnelle`
shows the pending line from `comptes-neon-auth` ("Votre compte est en attente de validation…"
exactly as the catalogue has it) and a link "Modifier mon dossier" (`@relecture`) to
`/espace/professionnelle/profil`. That page holds the step 2 and step 3 forms and a read-only list
of the declarations accepted and when. In `brouillon` it redirects to the onboarding.

**Editing after submission.** While `en_attente`, she can edit anything. The file stays
`en_attente` and `submitted_at` does not change. Once `valide` (set by stub 5), a change of
profession, or any document added, replaced or removed, sends the file back to review. A
confirmation dialog first tells her that her profile will be hidden until it is checked again.
She must then tick the five declarations again, which appends a fresh set of rows. The file
returns to `en_attente` with a new `submitted_at`. Any other change (specialisations, zone, rate,
experience, bio, photo) applies at once and keeps the file `valide`.

**The students switch (D-7).** `/admin` gains one setting, "Accueillir les étudiantes
sages-femmes" (`@relecture`). It is off by default and changed through a confirmation dialog (red
and green only there, D-24). It is stored in a new `app_settings` table (key, value, `updated_at`,
`updated_by`). No row means off. When it is off, the student option is offered to no one who does
not already carry it, and the server refuses it on save.

**Document storage.** Documents and photos live in Neon Object Storage, which is S3-compatible,
in eu-central-1, in one private bucket per Neon project. Buckets are enabled on both projects
today. The browser uploads directly to the bucket through a presigned PUT, valid for five minutes
and bound to the declared content type and size. This avoids Vercel's request-body limit. Then the
server confirms the upload. It checks the object's size and that its first bytes match the
declared type, and only then records the file. An object that fails the check is deleted. Object
keys are random. No store URL for reading ever reaches a browser. Every file, photos included, is
served by `/api/fichiers/[id]`, which streams it to its owner or to an admin and answers 404 to
anyone else, signed in or not. The S3 client reads `AWS_ENDPOINT_URL_S3`, `AWS_REGION`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `DOCUMENTS_BUCKET`, declared by name in
`.env.example`. UAT and every preview use the nonprod project's `main` branch store and a
credential anchored there. Production uses its own project's store.

**Communes.** The commune register is committed as data under `src/lib/communes/`: every current
Belgian commune from Statbel's REFNIS list (565 since the 1 January 2025 mergers). Each has its NIS
code, its French name, its Dutch name where different, and its bpost postcodes. A script under
`scripts/communes/` regenerates the data and names its sources. Stubs 7 and 15 reuse it.

**Data model (one migration, generated by drizzle-kit).**

- `professional_profiles`: one per professional user (`user_id` unique → `users.id`). It holds
  `status`, `profession`, `specialisations` (keys), `experience`, `night_rate_eur` (integer,
  `CHECK` 100 to 300), `bio` (`CHECK` ≤ 500 characters), `photo_file_id`, `inami_number`,
  `submitted_at` and the timestamps. The step-2 fields are nullable, so a partial save is possible.
  Completeness is checked in code.
- `professional_communes`: (`profile_id`, `nis_code`), primary key on both.
- `professional_documents`: `profile_id`, `kind` (`diplome`, `attestation_inscription`, `photo`),
  `storage_key`, the original file name, `content_type`, `size_bytes`, `uploaded_at`.
- `professional_declarations`: `profile_id`, `declaration` (the five keys), `version`,
  `accepted_at`. Append-only.
- `app_settings`: `key` (primary key), `value`, `updated_at`, `updated_by` → `users.id`.

**Words (D-19).** Every visible string lives in `src/content/professionnelle.ts` (the onboarding,
the profile page) and `src/content/admin.ts` (the switch). The guide's verbatim lines are the step
titles, the field labels, the submission message and the pending line. Every other entry carries
`@relecture Surya` with why. Profession names are lower case in running text. No `!`, `…` or `—`,
and no insurance wording (D-8). Copy never calls students "diplômées" (D-7).

**Look (D-9).** The steps are built from the socle's components and tokens only. The progress bar
and the file slots are new components under `src/components/professionnelle/`, styled from the
existing tokens.

**Configuration outside the code.** Build does this through the Neon API on the nonprod project
`dawn-scene-70949411`: a private bucket, a CORS rule allowing PUT from `https://uat.berceo.be` and
the project's preview origins, and a `storage:write` credential on `main`. The Vercel Preview and
`uat` environments get the five variables. The production bucket, CORS rule, credential and
Vercel Production variables are the operator's to set before the batch is promoted, because
production's Neon project is never written from a run (D41).

## Acceptance criteria

- [ ] A professional with a verified e-mail and a draft file who opens `/espace/professionnelle` is sent to the first incomplete onboarding step. Every step shows the four numbered steps with the guide's titles, step 1 marked done, and a progress bar. A later step cannot be opened before the earlier ones are complete.
- [ ] A professional who fills part of step 2, clicks "Enregistrer et reprendre plus tard", signs out and signs back in finds every saved answer and is brought back to step 2.
- [ ] Step 2 refuses to continue without a profession, at least one commune, a rate, an experience range, a bio and a photo, with a French message on each field concerned. Spécialisations may be left empty.
- [ ] A night rate below 100, above 300 or not a whole number is refused by the form and by the server, and the database `CHECK` refuses it too (a test proves the constraint).
- [ ] A bio over 500 characters is refused. The counter shows the characters left.
- [ ] The commune picker finds a commune by its French name, its Dutch name or a postcode, and the profile stores NIS codes only. One to fifty communes are accepted.
- [ ] With the students switch off, "étudiante sage-femme (3e ou 4e année)" is not offered and the server refuses it. With it on, it is offered. A file that already carries it keeps it when the switch goes off.
- [ ] On `/admin`, an admin can turn the students switch on and off through a confirmation dialog. The change records who made it and when. A non-admin cannot reach the setting (404) or change it through the server action.
- [ ] Step 3 asks exactly for the documents of the chosen profession (see the table) and the INAMI number for sage-femme and infirmière en néonatologie. It refuses to continue while one is missing. It refuses a file over 10 MB or not PDF, JPEG, PNG or WebP, and a photo over 5 MB or not JPEG, PNG or WebP.
- [ ] A file whose content does not match its declared type (for example a renamed executable) is rejected after upload, and its object is deleted from the bucket.
- [ ] Replacing or removing a file deletes its object from the bucket and its row. Changing profession deletes the documents the new profession does not require.
- [ ] `/api/fichiers/[id]` returns the file to its owner and to an admin, and 404 to a signed-out visitor, a parent, and another professional. The bucket is private: the object's store URL without a signature is refused. Tests cover each case.
- [ ] Step 4 cannot be submitted until all five declarations are ticked. Submitting stores five `professional_declarations` rows, each with its key, the version `cdc-2026-08-02` and a timestamp, and moves the file to `en_attente` with `submitted_at` set.
- [ ] After submitting she sees "Votre dossier est bien reçu. Nous le vérifierons dans les 24 heures ouvrables. Vous recevrez un e-mail dès que votre profil sera activé." Afterwards `/espace/professionnelle` shows the pending line and a link to `/espace/professionnelle/profil`.
- [ ] While `en_attente` she can edit her profile and documents on `/espace/professionnelle/profil`, and the file stays `en_attente` with the same `submitted_at`.
- [ ] For a file in `valide` (set directly in the database for the test), a change of profession or of any document asks for confirmation, requires the five declarations again (five new rows), and puts the file back in `en_attente` with a new `submitted_at`. A change of rate, zone, specialisations, experience, bio or photo keeps it `valide`. Unit tests cover these transitions.
- [ ] The migration, generated by drizzle-kit, adds `professional_profiles`, `professional_communes`, `professional_documents`, `professional_declarations` and `app_settings` with their enums and constraints. The journal test passes, and a preview and uat.berceo.be apply it through `vercel-build`.
- [ ] The committed commune data holds every current commune with its NIS code, French name, Dutch name where different and postcodes. A test checks the count and that NIS codes are unique.
- [ ] Every visible word of the onboarding, the profile page and the switch lives in `src/content/`. Entries not verbatim from the guide carry `@relecture Surya`. No `!`, `…`, `—` or insurance wording appears, and the content tests pass.

## Out of scope

- The founders' review: the queue, "Valider le profil", "Demander un complément", "Refuser le profil", their e-mails and the admin journal, including an admin screen to view the documents (stub 5, `verification-back-office`). This run only declares the three states stub 5 sets.
- The retention of a refused file's documents: deleted 30 days after refusal by a scheduled purge (operator's decision, 2026-09-24). Stub 5 owns it, because it creates the refusal. A validated file keeps its documents while the account exists. Account deletion is a later stub.
- Showing profiles to families, public teaser pages, and the photo outside the owner and admins (stubs 7, 8, 15).
- Availability (stub 13). Identity checks: itsme, ID card [D-5].
- Any e-mail at submission, to her or to the founders (stub 5 sends the validation e-mail).
- A checksum check on the INAMI number, and any automated verification of documents.
- The final wording of the sworn declarations and of the criminal-record line. The founders supply it. The version constant changes then, and a re-acceptance flow comes with that change.
- A sweep of uploads that were presigned but never confirmed. Their keys are random and nothing references them.
- Scope decisions this run neither builds nor changes: D-1, D-2, D-3, D-8 beyond wording, D-10, D-12 to D-18, D-20, D-22 to D-27.

## Open questions

- none

Context budget: over the Inputs table. The guide's "Les comptes", "Le profil professionnel" and "L'outil de vérification" sections were read for verbatim labels. The `comptes-neon-auth` spec, `src/db/schema.ts` and `src/lib/auth/routing.ts` were read to fix the routes and the data model. Neon's object-storage docs (authentication, S3 compatibility) and a live read of both projects' storage settled the store. Operator decisions of 2026-09-24 in session: professions and documents, the students switch as a DB setting with an `/admin` toggle, Neon Object Storage, retention, specialisations as a fixed list, experience as ranges, the photo required, editing while pending.
