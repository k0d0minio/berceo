# BERCEO

**Berceo** — a Belgian marketplace connecting parents of newborns with professionals who
take overnight post-partum care shifts.

In French: the public site (the vitrine) at `/`, accounts on Neon Auth and the signed-in
spaces, on Surya's design system, the app shell and the content catalogue.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Where things live

| Path | Purpose |
| --- | --- |
| [src/content/](src/content/) | Every word the site shows, one file per surface. See **The content catalogue** below. |
| [src/app/(public)/](src/app/(public)/) | The vitrine, under the public header and footer: `/`, `/comment-ca-marche`, `/tarifs`, `/faq`, the placeholders `/qui-sommes-nous`, `/conditions-generales`, `/confidentialite`, and `/design-system`. `page-metadata.ts` builds each page's title, description, canonical and OG tags. |
| [src/components/vitrine/](src/components/vitrine/) | The vitrine's blocks: section band, page header, photo, steps, reason cards, the two-door CTA pair, the placeholder page. Words come in as props. |
| [src/app/sitemap.ts](src/app/sitemap.ts), [robots.ts](src/app/robots.ts), [site.ts](src/app/site.ts) | The four indexable pages on `https://www.berceo.be`; crawling allowed on production only (`VERCEL_ENV`). |
| [src/app/(portail)/](src/app/(portail)/) | The signed-in spaces (`/espace/famille`, `/espace/professionnelle` and its onboarding, `/admin`) and `/design-system/portail`. |
| [src/lib/professionnelle/](src/lib/professionnelle/), [src/lib/documents/](src/lib/documents/) | The professional's file: its rules, the private document bucket and `/api/fichiers/[id]`. |
| [src/lib/admin/](src/lib/admin/), [src/components/admin/](src/components/admin/) | The founders' review: the queue and decision rules, the admin journal, the purge of refused files. See **The founders' verification** below. |
| [src/app/api/cron/](src/app/api/cron/), [vercel.json](vercel.json) | Scheduled jobs: the daily purge of refused files (`vercel.json`) and the daily digest of new requests (`.github/workflows/demandes-digest.yml`), both guarded by `CRON_SECRET`. |
| [src/lib/demandes/](src/lib/demandes/) | The care request: its rules, reads and writes, the urgent e-mail and the daily digest. See **The care request** below. |
| [src/lib/reservations/](src/lib/reservations/), [src/components/reservations/](src/components/reservations/) | Answers and bookings: who may answer, the booking transaction, the family's view of a professional, the priority request, their e-mails. See **The answer and the booking** below. |
| [src/lib/messagerie/](src/lib/messagerie/), [src/components/messagerie/](src/components/messagerie/) | The conversation per answer: its rules, reads and writes, the send action, the new-message e-mail. See **The conversation** below. |
| [src/lib/disponibilites/](src/lib/disponibilites/), [src/components/disponibilites/](src/components/disponibilites/) | The professional's indicative calendar and the « Prochaines disponibilités » block. See **The professional's availability** below. |
| [src/app/api/health/route.ts](src/app/api/health/route.ts) | `GET /api/health` → `200 {"status":"ok"}`; the `health_endpoint` in `.icm/project.json`. |
| [src/app/globals.css](src/app/globals.css) | The design system's tokens (colours, type scale, radii, stripes, transparency). The only file that holds a colour. |
| [src/app/fonts.ts](src/app/fonts.ts) | Every typeface, bound once: the display slot (Fraunces standing in for Comodo) and Nunito. |
| [src/app/theme-color.ts](src/app/theme-color.ts) | The browser-chrome colour — a `<meta>` cannot read a CSS variable. |
| [src/app/layout.tsx](src/app/layout.tsx) | The light root layout; `metadataBase` is production. |
| [src/components/ui/](src/components/ui/) | shadcn components retuned to the DA, plus `confirm-dialog`, `striped-section`, `translucent-block`, `input`. |
| [src/components/shell/](src/components/shell/) | Public header and footer, the portal shell, the mobile menu, the sign-out dialog. |
| [src/components/berceo-logo.tsx](src/components/berceo-logo.tsx) | Wordmark and logomark, inlined so they take `currentColor`. |
| [public/logos/](public/logos/) | Brand pack. SVG is what the site uses; PNG for raster; `.ai` is the source. |
| [public/photos/](public/photos/), [public/og.png](public/og.png) | The DA's four photographs as WebP (1600 × 900, under 300 KB each) and the 1200 × 630 share card. |

`/design-system` shows every token and component of the DA on one page, with the header and
footer. It and `/design-system/portail` are `noindex, nofollow` and linked from nowhere.

## The design system

Surya's *Direction artistique web* (D-9), applied literally — including its text and button
colours, which fall below WCAG AA contrast on white (an operator decision, to be raised with
Surya).

- **Colours** are Tailwind tokens named as the DA names them: `blanc`, `sauge`, `taupe`,
  `perle`, `beurre`. Tailwind's default palette is switched off, so no other colour exists.
  `rouge-confirmation` and `vert-confirmation` are used by `confirm-dialog.tsx` alone (D-24).
- **Type**: `font-display` (Comodo's slot, Fraunces until Surya delivers Comodo) for H1, H2
  and navigation; Nunito for everything else. The DA's hierarchy is `text-h1`, `text-h2`,
  `text-nav`, `text-h3`, `text-intro`, `text-corps`, `text-bouton`, `text-champ`,
  `text-legende`, each switching from its mobile to its desktop size at `md`.
- **Shapes**: `rounded-carte` (32 px) for cards and blocks, `rounded-capsule` for buttons and
  fields. No shadow anywhere; focus is an outline.
- **Buttons** take the background they sit on as their variant: `blanc`, `raye`, `sauge`,
  `taupe`, with the DA's hover colours and a 1.03 scale in 200 ms (none under reduced motion).
- **Surfaces**: `motif-raye` (text only in a solid block over it — use `StripedSection`) and
  `voile-perle` (pearl at 75 % — use `TranslucentBlock`, never over the stripes).
- **What the DA rules out** stays out: gendered pink and blue, naïve illustrations, shadows,
  gadget animations.

## The content catalogue

Every word lives in `src/content/`, in French, written to Surya's editorial guide (D-19):
vouvoiement, no exclamation mark, no em dash, no ellipsis, the validated lexicon.

- **One file per surface**: `common.ts` (brand, header, footer, the CTAs of D-25),
  `accueil.ts`, `comment-ca-marche.ts`, `tarifs.ts`, `faq.ts`, `qui-sommes-nous.ts`,
  `legal.ts`, `photos.ts` (sources and alt texts), `comptes.ts`, `emails.ts`,
  `design-system.ts`, `portal.ts`. A new screen adds its own file. A vitrine page's `meta`
  (title and description) sits in its own file.
- **Keyed by locale**: each file exports `catalogue({ fr: { … } })`. Components read it with
  `words(surface)`, which returns the default locale. `locale.ts` holds `locales`,
  `defaultLocale` and the types.
- **`@relecture`**: an entry the guide does not give verbatim carries a JSDoc
  `@relecture Surya — <why>` tag (on an object, it covers every entry inside it).
  `grep -rn @relecture src/content` is the list to send Surya.
- **The rules are tested**: `src/content/vitrine.test.ts` fails on `!`, `…`, `—`, insurance
  wording (D-8), Facebook (D-23), a subscription tier, an amount in euros other than 100 and
  300, "abonnement" except to say there is none, and a title or description out of the
  guide's lengths (50–60, 140–160) or used twice.
- **Adding a language**: add its code to `locales` in `locale.ts`, then add the same key to
  every `catalogue({ … })`. The type is derived from French, so a surface that misses the new
  locale, or a key inside it, fails the typecheck.

## Database (Neon Postgres + Drizzle)

The platform's data starts here: one Neon Postgres database, read through
[Drizzle ORM](https://orm.drizzle.team). The vitrine itself reads nothing from it.

- **Schema:** `src/db/schema.ts` — `users` (the Neon Auth id in `auth_user_id`, e-mail, first
  and last name, E.164 phone, role: `parent` | `professionnel` | `admin`, `welcome_sent_at`) and
  `user_consents`, an append-only ledger of the CGU and privacy-policy versions each account
  accepted, with the moment. A professional's file (0002): `professional_profiles` (one per
  professional: status, profession, spécialisations, experience, night rate held to 100–300 € by
  a `CHECK`, bio, INAMI number, `submitted_at`), `professional_communes` (REFNIS codes),
  `professional_documents` (her files in the private bucket) and `professional_declarations`
  (append-only, with the wording version). `app_settings` holds the founders' switches.
  The founders' review (0004): `review_reason` and `reviewed_at` on `professional_profiles`, and
  `admin_journal`, one row per admin action, which a trigger keeps append-only (no `UPDATE`,
  `DELETE` or `TRUNCATE`) and which names people by id and name without foreign keys.
  `care_requests` (0005): a family's night, its start, children, baby's age, the commune copied
  from her profile, the urgent flag, when the no-medical-condition box was ticked, and
  `digest_sent_at`; at most one open request per family and night.
  Answers and bookings (0007): `care_request_status` gains `attribuee`; `care_requests` gains
  its priority professional (`priority_profile_id`, `priority_sent_at`, set once) and
  `republished_at` / `republish_count`; `care_request_applications` is one answer per
  professional and request (`application_status`: `en_attente`, `retenue`, `non_retenue`,
  `retiree`), with the rate she answered at; `bookings` is one per request and one per
  professional and night, with that rate, and no address.
  Conversations (0008): `conversations` is one per answer (the family, the professional, each
  side's read marker, `last_message_at`); `messages` holds the people's text (1 to 2 000
  characters, the browser's id as key) or one of Berceo's two keys (`amorce`, `bonne_garde`, at
  most one each). The migration backfilled a conversation for every earlier answer and booking.
  Identity itself lives in Neon Auth's `neon_auth` schema, which Neon manages and Drizzle never
  declares.
- **Client:** `src/db/index.ts` — a lazily-initialized Drizzle client on Neon's serverless HTTP
  driver. Import `db` from server code only.
- **Migrations:** `drizzle/` — `NNNN_<name>.sql` plus `meta/_journal.json`, the order of record.

Copy `.env.example` to `.env.local` and set `DATABASE_URL` (a Neon branch's connection string,
never production's), then:

```bash
npm run db:generate -- --name <what>   # regenerate SQL after editing the schema
npm run db:migrate                     # apply pending migrations
npm run db:verify                      # every journal entry is in __drizzle_migrations
npm run db:studio                      # browse the database
```

Production is migrated by the **DB migrate** workflow (`.github/workflows/db-migrate.yml`) on
pushes to `main` that touch `drizzle/` or `src/db/`, from the `DATABASE_URL` repository secret.
Every other Vercel build (previews and uat.berceo.be) migrates its own Neon branch first:
the `vercel-build` script runs `db:migrate` and `db:verify` unless `VERCEL_ENV` is `production`.
`src/db/migrations-journal.test.ts` refuses a journal whose stamps are out of order — the one
way Drizzle's migrator skips a file silently.

## Accounts and e-mail

Accounts run on **Neon Auth** (Managed Better Auth, `@neondatabase/auth`), e-mail on **Resend**.

- **Auth instance:** `src/lib/auth/server.ts` (`getAuth()`, created on first use). Pages and
  actions ask `currentUser()` (`src/lib/auth/current-user.ts`), which joins the session to the
  `users` row, because the role lives on the row. Spaces call `requireAccess(path)`
  (`src/lib/auth/guard.ts`); the redirect table is `src/lib/auth/routing.ts`.
- **Routes:** `/inscription-famille`, `/inscription-professionnelle`, `/connexion`,
  `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`, `/verification-email` (`src/app/(auth)/`);
  the spaces `/espace/famille`, `/espace/professionnelle`, `/admin` (`src/app/(portail)/`).
  `src/proxy.ts` refreshes the session on `/espace/**` and bounces signed-out visitors to
  `/connexion?retour=…`. `/admin` answers 404 to anyone but an admin.
- **E-mail:** Neon Auth's `send.magic_link` webhook calls `/api/webhooks/neon-auth`, which
  checks the Ed25519 signature and sends Berceo's own verification and reset e-mails
  (`src/lib/email/`, words in `src/content/emails.ts`). Their links carry the raw token to this
  site: `/verification-email/confirmer` (signs the user in and sends a family's welcome e-mail
  once) and `/nouveau-mot-de-passe`.
- **Admins** never sign up. A founder signs up as a family, then
  `npm run admin:grant -- --email <address>` promotes the account on the database
  `DATABASE_URL` points at.
- **Environment:** `NEON_AUTH_BASE_URL` (the auth URL of the environment's own Neon branch),
  `NEON_AUTH_COOKIE_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`. On each Neon branch, Neon Auth's
  config requires verification, turns Google off, trusts the site's domains and points the
  webhook at that environment's `/api/webhooks/neon-auth`.

## The family's profile and the commune list

- **The page:** `/espace/famille/profil` (`src/app/(portail)/espace/famille/profil/`), linked
  as "Mon profil" in a parent's portal navigation. Prénom, nom and téléphone are saved on
  `users`; the e-mail is shown and cannot be changed, because Neon Auth does not support an
  e-mail change yet (parked: `.icm/intake/triage/famille-changement-email.md`). The commune is
  required, the address (rue, numéro, boîte) optional until a booking, the context line at most
  300 characters. `/espace/famille` asks the family to complete her profile until a commune is
  saved. Words in `src/content/famille.ts`.
- **The address is private (D-15).** Commune, address and context live in `family_profiles`,
  one row per parent, off `users` so the address never travels with `currentUser()`. Only
  `src/lib/famille/` reads that table (`ownFamilyProfile` for her own page, `familyCommune`
  for everything else); `src/lib/famille/address-guard.test.ts` fails if another file under
  `src/` names it. A later reader, such as the reveal after a confirmed booking, is added there.
- **The commune list:** `src/lib/communes/` — every Belgian postal locality (2,720) with its
  commune (565) and the commune's REFNIS (INS) code, searched by postcode prefix or name,
  accents ignored. Matching keys on the REFNIS code. `data.ts` is generated by
  `scripts/communes/generate.py` (Python 3 with `xlrd` and `openpyxl`) from bpost's postcode
  list and Eurostat's LAU list for Belgium, plus the 2025 mergers' codes listed in the script;
  its header records the sources and the date. Regenerate it by hand when bpost or Statbel
  publish a change; never edit it.

## The care request

- **The family's pages:** `/espace/famille/demandes` (« Mes demandes »), `/nouvelle` (the
  guide's form) and `/nouvelle?urgente=1` (« Publier une demande urgente »), `/[id]` (one request,
  cancel through the confirmation dialog) and `/[id]/modifier`. Both publish buttons also sit on
  `/espace/famille`. A normal request is for the day after tomorrow up to day 56, an urgent one
  for tonight or tomorrow night (D-60), in Brussels time; the urgency and the commune are fixed
  at publication. Without a commune in her profile she is sent to `/espace/famille/profil?completer=1`.
- **The professional's list:** `/espace/professionnelle/demandes` — open requests whose night
  has not started, in the communes she serves, urgent first then newest; a profile that is not
  `valide` sees a line instead. The card (`src/components/demandes/request-card.tsx`) shows the
  commune, the night (start + 11 h) and the children, never the family: `cardColumns` in
  `src/lib/demandes/requests.ts` is what a professional's query selects, and a test holds it.
- **The rules:** `src/lib/demandes/rules.ts` (pure: date windows, start times 18:00 to 23:00 by
  half hour, age 0–12 semaines or 1–24 mois, a night started, the digest's 18:00 gate),
  `validation.ts` (the form), `format.ts` (« Un bébé de trois mois », « 30/09/2026 de 20h00 à
  7h00 »). Words in `src/content/demandes.ts`; e-mails in `src/content/emails.ts`.
- **E-mails (D-61):** an urgent request e-mails every validated professional serving its commune
  right after publication (`after()`, `notifyUrgentRequest`). Normal requests go out in one
  digest a day: `POST /api/cron/demandes-digest`, bearer `CRON_SECRET`, sends from 18:00 in
  Brussels only, once a day at most, and puts each request in one digest at most. **Scheduling (D-62):**
  `.github/workflows/demandes-digest.yml` calls the route on UAT and production at 16:00 and
  17:00 UTC (and on demand), with the repository secret `CRON_SECRET`; Vercel Cron is not
  used because it never runs on the `uat` environment. One value serves both environments
  (D-68): set it as `CRON_SECRET` on each Vercel environment and in the repository's secrets.

## The answer and the booking

- **The professional answers** on `/espace/professionnelle/demandes`: each card carries her rate
  (« 150 € pour la garde de nuit ») and « Je suis disponible pour cette garde »; once answered,
  « Retirer ma disponibilité » (D-73). Her list holds the open requests ahead in her communes
  and those sent to her in priority wherever they are, priority first; never one she was
  declined on nor one on a night she is booked. `answerRequest` in
  `src/lib/reservations/answers.ts` checks the rules (`rules.ts`) and the INSERT holds them
  again. The rate is frozen on the answer (D-74). Each answer e-mails the family.
- **The family chooses** on `/espace/famille/demandes/[id]`: « Les professionnelles qui ont
  répondu à votre demande », each with « Voir le profil complet » and « Accepter et réserver »,
  which opens « Récapitulatif de votre garde ». `acceptAnswer` in `bookings.ts` is one
  transaction (`db.batch`): the answer `retenue`, the booking, the request `attribuee`, the other
  waiting answers `non_retenue`, her other answers that night `retiree`; the unique indexes turn
  two clicks racing into one booking and a « conflit ». Accepting needs the family's street and
  number (D-77). Both sides get the guide's confirmation, the others « not retained ».
  Frais-de-service puts the payment before `acceptAnswer`.
- **Republish and edit (D-70, D-76):** a request with a waiting answer cannot be edited;
  « Republier ma demande » declines the waiting answers and sends the request out again (the
  urgent e-mail at once, or the next digest, which carries a request republished since its last
  one). Cancelling declines the waiting answers too.
- **The full profile (D-75):** `/espace/famille/professionnelles/[id]`, any signed-in family, any
  `valide` profile; `profileColumns` in `profiles.ts` is all that leaves (a test holds it). Her
  photo is served to parents by `/api/fichiers/[id]`; her documents never are. It mounts
  « Prochaines disponibilités » (D-69, D-86).
- **The priority request (D-71):** `/espace/famille/professionnelles/[id]/priorite` sends one of
  the family's open requests, or a new one (`/nouvelle?pour=<id>`), to her « en priorité »: set
  once, she is e-mailed at once and sees it first even outside her communes; nobody else waits.
- **The bookings:** « Mes réservations » (`/espace/famille/reservations`, the récapitulatif, the
  professional's phone, re-contact in priority) and « Mes gardes »
  (`/espace/professionnelle/gardes`). The family's name, address and phone reach the
  professional only on her own booking's page; the address is read live through
  `bookingAddress` in `src/lib/famille/profile.ts`, still the only reader of `family_profiles`.
- **Words:** `src/content/reservations.ts`; e-mails in `src/content/emails.ts`.

## The conversation

- **One per answer (D-16, D-91):** `withConversation` in `src/lib/messagerie/conversations.ts`
  wraps the answer's INSERT, so the answer, its conversation and Berceo's amorce land in one
  statement; a re-answer finds the same conversation. Only the family who owns the request and
  the professional who answered read it; anyone else's id is not found. Nothing else creates one.
- **Berceo's two messages (D-87):** the guide's amorce when she answers, the cahier des charges'
  « excellente garde » in the booked conversation when the family confirms
  (`bonneGardeStatement`, a statement of `acceptAnswer`'s batch). Stored as keys, rendered from
  `src/content/messagerie.ts`; neither sends an e-mail.
- **Where:** « Messages » in each space (`/espace/famille/messages`,
  `/espace/professionnelle/messages`, a conversation at `…/[id]`), with the number of
  conversations holding an unread message beside it, on the menu button too below md.
  « Écrire à [Prénom] » on the family's answers and booking, « Voir la conversation » on the
  professional's answered requests and garde.
- **Reading and sending:** opening a conversation moves the viewer's read marker; « Lu » sits
  under her last message once the other side opened it after. `sendMessageAction`
  (`src/lib/messagerie/actions.ts`) sends 1 to 2 000 characters of plain text with the id the
  browser gave it: a retry inserts once. Each inserted message e-mails the other side once,
  without its text (`notify.ts`, key `message-<id>`, D-90). A reminder line follows every third
  message of the two people outside the booked conversation (D-88).
- **Closing (D-89):** a conversation accepts messages until the night ends (start + 11 h,
  Brussels), whatever its answer's state; a cancelled request closes it at once. Closed, it stays
  readable. `isConversationOpen` in `rules.ts` is the one rule; `sendMessage` holds it again in
  SQL. Cycle-de-garde-et-annulation extends it for a cancelled booking.
- **Words:** `src/content/messagerie.ts`; the e-mail in `src/content/emails.ts`.

## The professional's availability

- **« Mes disponibilités » (D-12):** `/espace/professionnelle/disponibilites`, for a `valide`
  profile only (any other sees one line). The nights from tonight to today + 56 days in
  Brussels (D-79), one block per month in Monday-to-Sunday rows; she taps nights, then « Disponible » or « Indisponible » saves
  the selection (`actions.ts` beside the page). A night is named by its evening's date, like a
  care request's `night_date`.
- **Two states (D-81):** `professional_availability` holds one row per night marked available,
  `(profile_id, night_date)`, cascading with the profile. « Indisponible » deletes the row;
  nights that fell behind today are ignored by every read, never purged.
- **Indicative only:** nothing about a care request (list, e-mails, digest) reads the table, and
  `src/lib/disponibilites/isolation.test.ts` holds that.
- **The block families see (D-69, D-80):** `ProchainesDisponibilites`
  (`src/components/disponibilites/`) shows the next five nights from `nextAvailableNights`
  (none for a profile that is not `valide`) with the guide's caveat, or one line when none is
  marked. She sees it under her calendar; `/design-system/portail` shows both states. The
  family-facing full profile (candidature-et-reservation) and the search cards
  (recherche-et-fiches-publiques) mount it.
- **Where:** rules in `src/lib/disponibilites/rules.ts` (window, month blocks, what a save may
  carry), wording in `format.ts` (« Nuit du lundi 12 au mardi 13 octobre »), reads and writes in
  `nights.ts`; words in `src/content/disponibilites.ts`.

## The professional's onboarding and documents

- **Steps (D-21):** `/espace/professionnelle` sends a draft file to its first incomplete step:
  `/espace/professionnelle/inscription/profil`, `…/justificatifs`, `…/declarations`. Once
  submitted, the file is `en_attente` and `/espace/professionnelle/profil` edits it. The rules
  (requirements per profession, completeness, states, file checks) are pure functions in
  `src/lib/professionnelle/rules.ts`; the actions are
  `src/app/(portail)/espace/professionnelle/actions.ts`; the words `src/content/professionnelle.ts`.
- **Documents and photos** live in a private bucket on **Neon Object Storage** (S3-compatible,
  eu-central-1), one per Neon project: UAT and previews share the non-production one, production
  has its own. The browser uploads straight to it with a five-minute presigned PUT; the server
  then checks the size and first bytes before recording the file (`src/lib/documents/`). Files are
  read only through `/api/fichiers/[id]`, streamed to their owner or an admin, 404 to anyone else.
  Environment: `DOCUMENTS_S3_ENDPOINT`, `DOCUMENTS_S3_REGION`, `DOCUMENTS_BUCKET`,
  `DOCUMENTS_S3_ACCESS_KEY_ID`, `DOCUMENTS_S3_SECRET_ACCESS_KEY` (not `AWS_*`: Vercel reserves
  those). The bucket's CORS rule allows PUT from `https://uat.berceo.be`, the project's preview
  origins and `http://localhost:3000`.
- **Her zone (D-11)** is one to fifty communes from the shared commune list (below), stored as
  REFNIS codes in `professional_communes.commune_ins`, the key `family_profiles` carries too.
  `searchCommunes` in `src/lib/communes/` groups the list's localities by commune for the picker.
- **The students switch (D-7)** is `etudiantes_admises` in `app_settings`, flipped on `/admin`.

## The founders' verification

- **The queue:** `/admin` opens on "Dossiers en attente de vérification", every `en_attente` and
  `complement_demande` file, oldest `submitted_at` first, then the students switch and a link to
  the journal. `/admin/dossiers/[id]` shows one file whole (documents embedded through
  `/api/fichiers/[id]`, declarations, the file's journal history) and, while it waits, the three
  decisions: "Valider le profil", "Demander un complément", "Refuser le profil" (the last two with
  a reason of 1 to 1,000 characters). All three are 404 to anyone but an admin.
- **A decision** (`src/lib/admin/review.ts`) is one statement: the state change and its journal
  entry, applied only if the file still has the state and the last decision the founder's page
  showed, so a second founder or a stale page changes nothing. The e-mail
  (`src/lib/email/templates.ts`: the guide's validation e-mail; the complément and the refusal
  without a contact address, D-51) leaves after, once per decision; a refused send leaves the
  decision standing and says so. The rules (statuts, allowed decisions, the reason, the students
  hold, the purge's cutoff) are pure functions in `src/lib/admin/rules.ts`.
- **Her side:** `/espace/professionnelle` shows the guide's validated line, or the reason of a
  complément or a refusal. Asked for a complément, she edits her file and sends it back with
  "Renvoyer mon dossier" (`/espace/professionnelle/profil`): it returns to `en_attente` with its
  `submitted_at`, so its place in the queue, and reads "Complément reçu". A refusal is final.
- **Students (D-7, D-52):** while the switch is off, a waiting student file is held without a new
  state: the queue reads "Étudiantes non admises", validation is refused on the page and the
  server, and her space says why. Turning the switch on releases it at its place.
- **The journal:** `/admin/journal`, newest first, 50 per page. Every admin action writes through
  `src/lib/admin/journal.ts` (the decisions, the students switch, the purge, and stub 14's actions
  to come); the module has no update or delete, and the database refuses both.
- **The purge (D-41, D-55):** `/api/cron/purge-dossiers-refuses`, scheduled daily in
  `vercel.json`, deletes every file (documents and photo) of a profile refused more than 30 days
  ago, from the bucket and `professional_documents`, and journals "Documents supprimés". It answers
  404 without `Authorization: Bearer <CRON_SECRET>`. Vercel runs cron jobs on production only; on
  uat.berceo.be the route is called by hand with the environment's `CRON_SECRET`.

## The vitrine

- **Two doors from the first screen.** The home page's H1 and both calls to action sit above
  the fold on a phone: the family's (filled sage) to `/inscription-famille`, "Rejoindre le
  réseau" (outlined) to `/inscription-professionnelle`. "Trouver votre gardienne de la nuit"
  is used only under text that names health professionals; everywhere else it is "Trouver une
  professionnelle" (D-25).
- **Reassurance is the manual verification**, never insurance (D-8).
- **Prices**: the professional's night rate between 100 € and 300 €, paid to her directly, and
  the 3 % service fee with its refund rule. No subscription in V1 (D-3).
- **Placeholders**: `/qui-sommes-nous` waits for the founders' first-person story (D-23), the
  two legal pages for the founders' texts. All three are `noindex` and out of the sitemap;
  lifting that is part of the change that brings the text.
- **No contact is shown.** Berceo has no published address yet, and inventing one would
  be worse than showing none.
- **Indexed on production only.** See AGENTS.md if that needs reversing.

## Notes

- [.icm/docs/](.icm/docs/) holds the research and the client's cahier des charges.
- Brand masters live in Drive. **Do not commit archives** — `.gitignore` blocks `*.zip`
  after a 58MB pack had to be purged from history.
