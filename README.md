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

## Environments

Where the build runs: `.icm/environments.md`.

## Where things live

| Path | Purpose |
| --- | --- |
| [src/content/](src/content/) | Every word the site shows, one file per surface. See **The content catalogue** below. |
| [src/app/(public)/](src/app/(public)/) | The vitrine, under the public header and footer: `/`, `/comment-ca-marche` and `/comment-ca-marche/professionnelles` (one page per side), `/tarifs`, `/faq`, the founders' story `/qui-sommes-nous`, the placeholders `/conditions-generales`, `/confidentialite`, and `/design-system`. `page-metadata.ts` builds each page's title, description, canonical and OG tags. |
| [src/components/vitrine/](src/components/vitrine/) | The vitrine's blocks: section band, page header, photo, steps, reason cards, the two-door CTA pair, the placeholder page. Words come in as props. |
| [src/app/sitemap.ts](src/app/sitemap.ts), [robots.ts](src/app/robots.ts), [site.ts](src/app/site.ts) | The four indexable pages on `https://www.berceo.be`; crawling allowed on production only (`VERCEL_ENV`). |
| [src/app/(portail)/](src/app/(portail)/) | The signed-in spaces (`/espace/famille`, `/espace/professionnelle` and its onboarding, `/admin`) and `/design-system/portail`. |
| [src/lib/professionnelle/](src/lib/professionnelle/), [src/lib/documents/](src/lib/documents/) | The professional's file: its rules, the private document bucket and `/api/fichiers/[id]`. |
| [src/lib/admin/](src/lib/admin/), [src/components/admin/](src/components/admin/) | The founders' back-office: the review (queue and decision rules), the accounts (search, suspend, reactivate, delete, contact), the lists and their overview counts, the admin journal, the purge of refused and deleted accounts' files. See **The founders' verification** and **The back-office** below. |
| [src/app/api/cron/](src/app/api/cron/), [vercel.json](vercel.json) | Scheduled jobs: the daily purge of refused files (`vercel.json`), the daily digest of new requests (`.github/workflows/demandes-digest.yml`), the reminder of the day before a garde (`.github/workflows/gardes-rappel.yml`) and the hourly invitation to rate a finished garde (`.github/workflows/avis-invitations.yml`), all guarded by `CRON_SECRET` through the one bearer check in [`src/lib/cron.ts`](src/lib/cron.ts), which refuses a secret under 16 characters. |
| [src/lib/demandes/](src/lib/demandes/) | The care request: its rules, reads and writes, the urgent e-mail and the daily digest. See **The care request** below. |
| [src/lib/reservations/](src/lib/reservations/), [src/components/reservations/](src/components/reservations/) | Answers and bookings: who may answer, the booking transaction, the family's view of a professional, the priority request, their e-mails. See **The answer and the booking** below. |
| [src/lib/gardes/](src/lib/gardes/), [src/components/gardes/](src/components/gardes/) | The garde's life after its booking: its state by the clock, cancelling, reporting an absence, republishing, the reminder of the day before, the founders' list of absences. See **The garde's life** below. |
| [src/lib/avis/](src/lib/avis/), [src/components/avis/](src/components/avis/) | The stars after a garde: the rating form of each side, the note and gardes count wherever they show, the invitation e-mail, the founders' list. See **The ratings** below. |
| [src/lib/messagerie/](src/lib/messagerie/), [src/components/messagerie/](src/components/messagerie/) | The conversation per answer: its rules, reads and writes, the send action, the new-message e-mail. See **The conversation** below. |
| [src/lib/disponibilites/](src/lib/disponibilites/), [src/components/disponibilites/](src/components/disponibilites/) | The professional's indicative calendar and the « Prochaines disponibilités » block. See **The professional's availability** below. |
| [src/lib/favoris/](src/lib/favoris/), [src/components/favoris/](src/components/favoris/) | A family's favourite professionals: the mark and its reads and writes, and the list « Mes professionnelles ». See **The favourites** below. |
| [src/lib/credits/](src/lib/credits/), [src/components/credits/](src/components/credits/) | A family's Berceo credits: the ledger's rules, its only reads and writes, and the block « Mes crédits ». See **The credits** below. |
| [src/lib/paiements/](src/lib/paiements/), [src/app/api/webhooks/stripe/](src/app/api/webhooks/stripe/) | The 3 % service fee through Stripe: the Checkout, the webhook, refunds, the founders' list. See **The service fee** below. |
| [src/lib/abonnements/](src/lib/abonnements/) | The four family subscriptions through Stripe: the plans, the Checkout in subscription mode, the row the webhook keeps true, `hasActiveSubscription`. See **The subscriptions** below. |
| [src/app/api/health/route.ts](src/app/api/health/route.ts) | `GET /api/health` → `200 {"status":"ok"}`. |
| [src/app/globals.css](src/app/globals.css) | The design system's tokens (colours, type scale, radii, stripes, transparency). The only file that holds a colour. |
| [src/app/fonts.ts](src/app/fonts.ts) | Every typeface, bound once: the display slot (Fredoka standing in for Comodo, JAM-327) and Nunito. |
| [src/app/theme-color.ts](src/app/theme-color.ts) | The browser-chrome colour — a `<meta>` cannot read a CSS variable. |
| [src/app/layout.tsx](src/app/layout.tsx) | The light root layout; `metadataBase` is production. |
| [src/components/ui/](src/components/ui/) | shadcn components retuned to the DA, plus `confirm-dialog`, `striped-section`, `translucent-block`, `input`, `card-field` (the sage zone white cards sit on) and `empty-state`. |
| [src/components/berceo-icons.tsx](src/components/berceo-icons.tsx) | Surya's 18 icons, inlined, `currentColor`. |
| [src/lib/contact/](src/lib/contact/), [src/components/contact/](src/components/contact/) | The contact form: its rules, its server action, the `CONTACT_EMAIL` setting. See "The vitrine". |
| [src/components/shell/](src/components/shell/) | Public header and footer, the portal shell, the mobile menu, the sign-out dialog. |
| [src/components/berceo-logo.tsx](src/components/berceo-logo.tsx) | Wordmark and logomark, inlined so they take `currentColor`. |
| [public/logos/](public/logos/) | Brand pack. SVG is what the site uses; PNG for raster; `.ai` is the source. |
| [public/photos/](public/photos/), [public/og.png](public/og.png) | The DA's four photographs as WebP (1600 × 900, under 300 KB each) and the 1200 × 630 share card. |

`/design-system` shows every token and component of the DA on one page, with the header and
footer. It and `/design-system/portail` are `noindex, nofollow` and linked from nowhere.

## The design system

Surya's *Direction artistique web* (D-9), with every text and control held to WCAG AA
(finition-accueil D-1, D-2): the DA's five colours stay surfaces, borders and accents, and text
is set in two inks darkened from sage and taupe on their own hue.

- **Colours** are Tailwind tokens named as the DA names them: `blanc`, `sauge`, `taupe`,
  `perle`, `beurre`, plus the two inks, `encre-sauge` (`#3c584b`: headings, links, filled
  buttons, the footer, the focus ring) and `encre-taupe` (`#646254`: body text, field borders).
  Text is never `text-sauge` or `text-taupe`, and white text sits only on an ink.
  `src/app/contrast.test.ts` holds every text and surface pair to AA and refuses the light
  text classes. Tailwind's default palette is switched off, so no other colour exists.
  `rouge-confirmation` and `vert-confirmation` are used by `confirm-dialog.tsx` alone (D-24).
  The one exception is form errors: `destructive` points at the same red, so a field that
  blocks a form shows a red border and a red message (onboarding-retour-1).
  The inks and the darkened red carry `@relecture` for Surya.
- **Type**: `font-display` (Comodo's slot, Fredoka at weight 500 with a letter-spacing of 0.08em until Surya delivers
  Comodo, JAM-327) for H1, H2
  and navigation; Nunito for everything else. The DA's hierarchy is `text-h1`, `text-h2`,
  `text-nav`, `text-h3`, `text-intro`, `text-corps`, `text-bouton`, `text-champ`,
  `text-legende`, each switching from its mobile to its desktop size at `md`.
- **Shapes**: `rounded-carte` (32 px) for cards and blocks, `rounded-capsule` for buttons and
  fields. No shadow anywhere; focus is an outline.
- **Buttons** take the background they sit on as their variant: `blanc`, `raye`, `sauge`
  (the light sage band) and `taupe` (the white block on the stripes). Outlines and fills are
  the inks, the hover is butter with the row's ink (the sage-ink fill for `blanc`), with a
  1.03 scale in 200 ms (none under reduced motion).
- **Surfaces**: `motif-raye` (text only in the white block over it — use `StripedSection`) and
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
  wording (D-8, bar the fee sentence on « Tarifs », which the founders wrote: D-8 is superseded
  for that one line, Jamie, 2026-10-29), Facebook (D-23), an amount in euros other than the four subscription prices
  and 130, a percentage other than 3, "sans abonnement" or "aucun abonnement", and a title or
  description out of the guide's lengths (50–60, 140–160) or used twice.
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
  professional: status, profession, « Formations complémentaires » held to 300 characters by a
  `CHECK`, night rate from 130 € with no ceiling and the extra hour's rate from 1 € by `CHECK`s
  (0018, profil-tarifs), bio, INAMI number, `submitted_at`; 0016
  replaced the specialisations list and dropped the experience band; `zone_radius_km` and
  `zone_whole_belgium` from 0027), `professional_communes` (REFNIS codes), `professional_reach`
  (the communes her radius reaches, 0027),
  `professional_documents` (her files in the private bucket) and `professional_declarations`
  (append-only, with the wording version). `app_settings` holds the founders' switches.
  The founders' review (0004): `review_reason` and `reviewed_at` on `professional_profiles`, and
  `admin_journal`, one row per admin action, which a trigger keeps append-only (no `UPDATE`,
  `DELETE` or `TRUNCATE`) and which names people by id and name without foreign keys.
  The back-office (0012): `suspended_at`, `suspended_by`, `deleted_at` on `users` (a `CHECK`
  keeps a deleted row suspended), `report_handled_at` and `report_handled_by` on `bookings`
  (only on a cancelled garde), and five more journal actions.
  `care_requests` (0005): a family's night, its start, children, baby's age, the commune copied
  from her profile, the urgent flag, when the no-medical-condition box was ticked, and
  `digest_sent_at`; at most one open request per family and night (widened to open or booked
  in 0014, D-156). The night's address (0019): `night_street`, `night_house_number` and
  `night_box`, null on a request published before them. Regular nights (0025): `series_id`,
  shared by the nights published together, null on a one-off night.
  Answers and bookings (0007): `care_request_status` gains `attribuee`; `care_requests` gains
  its priority professional (`priority_profile_id`, `priority_sent_at`, set once) and
  `republished_at` / `republish_count`; `care_request_applications` is one answer per
  professional and request (`application_status`: `en_attente`, `retenue`, `non_retenue`,
  `retiree`), with the rates she answered at; `bookings` is one per request and one per
  professional and night, with those rates, and no address. 0018 dropped their 300 € ceiling
  and kept 100 € as their floor, so an answer given before the 130 € floor keeps its rate.
  Conversations (0008): `conversations` is one per answer (the family, the professional, each
  side's read marker, `last_message_at`); `messages` holds the people's text (1 to 2 000
  characters, the browser's id as key) or one of Berceo's two keys (`amorce`, `bonne_garde`, at
  most one each). The migration backfilled a conversation for every earlier answer and booking.
  Subscriptions (0022): `subscriptions` is one row per Stripe subscription (the plan, the
  status, the Stripe ids, the renewal date, the grace period's end, the end), at most one live
  per family, and `users.stripe_customer_id` is the family's Stripe customer (**The subscriptions**).
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

Production is migrated by the workflow `migrate-production.yml`, on Jamie's word, for a release
tag, from the `DATABASE_URL` repository secret, before the staged build is promoted
(`.icm/local/database.md`). A Vercel build of UAT or of a preview migrates its database first:
the `vercel-build` script runs `db:migrate` and `db:verify` (`.icm/local/vercel-build.sh`). The
build of production never migrates.
`src/db/migrations-journal.test.ts` refuses a journal whose stamps are out of order — the one
way Drizzle's migrator skips a file silently.

## Accounts and e-mail

Accounts run on **Neon Auth** (Managed Better Auth, `@neondatabase/auth`), e-mail on **Resend**.

- **Auth instance:** `src/lib/auth/server.ts` (`getAuth()`, created on first use). Pages and
  actions ask `currentUser()` (`src/lib/auth/current-user.ts`), which joins the session to the
  `users` row, because the role lives on the row; that row is read in one place,
  `userByAuthId()` (`src/lib/auth/users.ts`). Spaces call `requireAccess(path)`
  (`src/lib/auth/guard.ts`) with their path and query (`withQuery`): the role is checked on the
  path, and a sign-in redirect keeps both as `retour`; the redirect table is
  `src/lib/auth/routing.ts`.
- **A sign-up that fails half-way:** Neon Auth creates the identity, then `signUp`
  (`src/app/(auth)/actions.ts`) writes the `users` row and its consents in one batch. When the
  batch fails, the identity is deleted at once; a later sign-up with the address replaces an
  identity left with no row (an orphan) once it is five minutes old, and asks a younger one to
  retry in a few minutes; an orphan that signs in is signed out and asked to sign up again. The
  lookup and the delete (`orphanByEmail`, `deleteOrphanIdentity`, `src/lib/auth/users.ts`) are
  the accounts code's only statements on `neon_auth."user"`; the delete refuses any identity a
  `users` row carries, in the same statement. Since JAM-342 the sign-up reads `users` by e-mail before
  it makes an identity: an address that has a row makes no new identity and gets the answer of
  D-34. Two sign-ups at the same time can still meet `users_email_unique`: that error gets the
  same answer, and the new identity is deleted.
- **The second factor (comptes-2fa):** after her password, a professional or a founder types a
  six-digit code Berceo sent to her e-mail address; a family never does. Neon Auth has no managed
  factor yet, so the site makes, sends and checks the code itself: the rules (who, 10 minutes, five
  tries, one code per 60 seconds, 30 days of trust) are `src/lib/auth/second-factor.ts`, the only
  reads and writes of `sign_in_codes` and `trusted_devices` are `second-factor-store.ts`, and the
  e-mail is `sendSignInCode` (`second-factor-send.ts`). The database holds SHA-256 hashes only. A
  correct code trusts the device for 30 days through the cookie `berceo-appareil` (the raw token;
  its hash is the row), and so does a new professional's verification link. `currentUser()` answers
  `needs-code` for a professional or a founder whose device is not trusted, with one read of
  `trusted_devices`; `requireAccess` sends her to `/connexion/code` with the way back, and every
  action refuses her as it refuses any status but `ok`. A trusted device skips the code, never the
  password; a password reset ends no trust.
- **Routes:** `/inscription-famille`, `/inscription-professionnelle`, `/connexion`,
  `/connexion/code`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`, `/verification-email` (`src/app/(auth)/`);
  the spaces `/espace/famille`, `/espace/professionnelle`, `/admin` (`src/app/(portail)/`).
  `src/proxy.ts` refreshes the session on `/espace/**` and bounces signed-out visitors to
  `/connexion?retour=…`. `/admin` answers 404 to anyone but an admin.
- **E-mail:** Neon Auth's `send.magic_link` webhook calls `/api/webhooks/neon-auth`, which
  checks the Ed25519 signature and sends Berceo's own verification and reset e-mails
  (`src/lib/email/`, words in `src/content/emails.ts`). Their links carry the raw token to this
  site: `/verification-email/confirmer` (signs the user in and sends a family's welcome e-mail
  once, after the redirect) and `/nouveau-mot-de-passe`. A welcome that failed to send is tried
  again from `/espace/famille` on each visit until one goes out (`src/lib/auth/welcome.ts`).
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
  e-mail change yet (parked: the stub `famille-changement-email` left the backlog in #73, commit `5119934`, and git history keeps its text). The commune is
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
- **The centres and the distance (communes-centres):** `src/lib/communes/centres.ts` holds each
  commune's official centre (the town hall, or else the main church or crossroads), from
  NGI-IGN AdminVector, layer `municipalcenter`, under the Creative Commons Attribution 4.0
  licence (CC BY 4.0). `python3 scripts/communes/generate.py centres` writes it from the
  committed `data.ts` (Python 3 with `pyshp`), and fails on a code that is in one list and not
  in the other. Its header names the download URL and the date.
  `src/lib/communes/distance.ts` measures the straight line between two centres
  (`distanceKm`, haversine on 6371 km) and returns the communes within a distance of a set of
  communes (`communesWithin`). Both files are server-only, apart from `index.ts`, so the browser
  bundle never carries the centres. The site shows no coordinates.

## The care request

- **The family's pages:** `/espace/famille/demandes` (« Mes demandes »), `/nouvelle` (the
  guide's form) and `/nouvelle?urgente=1` (« Publier une demande urgente »), `/[id]` (one request,
  cancel through the confirmation dialog) and `/[id]/modifier`. Both publish buttons also sit on
  `/espace/famille`. A normal request is for the day after tomorrow up to day 56, an urgent one
  for tonight or tomorrow night (D-60), in Brussels time; the urgency and the commune are fixed
  at publication. Without a profile she is sent to `/espace/famille/profil?completer=1`.
- **Children, feeding and hours (JAM-303):** a request holds 1 to 4 children, each with its own
  age in weeks (0 to 12) or months (1 to 24). A child of more than 24 months is refused. The
  feeding is one answer or more, and « diversification alimentaire » is one of them. The extra
  hours go by half hours, 0 to 6. The form computes the end of the night and shows it large.
  Each night of a regular request has its own start and its own extra hours: the form posts
  them as `heure-<date>` and `heuresSupplementaires-<date>`, and `publishSeries` writes them to
  each row. The columns are `child_ages` (jsonb), `feedings` (`feeding[]`) and `extra_hours`
  (`numeric(3,1)`), from migration 0038, which moves each older request to them with the same
  values. An e-mail or a digest line of a regular request whose nights differ says « à des
  horaires différents selon la nuit ». « Modifier ma demande » on a regular request edits the
  night of the page only.
- **The night's address (demande-adresse-de-la-nuit, D-63 superseded):** the form asks for the
  commune, the rue, the numéro and the boîte, prefilled from her profile. She can change them
  for this request, and her profile does not change. The rue and the numéro are required. The
  professionals of the request's commune see it. The edit page changes the rue, the numéro and
  the boîte. Only `src/lib/famille/` names the three columns (`request-address.ts`), and
  `address-guard.test.ts` holds it. A deletion clears them.
- **The professional's list:** `/espace/professionnelle/demandes` — open requests whose night
  has not started, in the communes she reaches, urgent first then newest; a profile that is not
  `valide` sees a line instead. The card (`src/components/demandes/request-card.tsx`) shows the
  commune, the night (start + 11 h + the extra hours), the children (« Un bébé », « Jumeaux »,
  « Triplés ») and their feeding, never the family: `cardColumns` in
  `src/lib/demandes/requests.ts` is what a professional's query selects, and a test holds it.
- **The reach (zone-rayon-lecture):** every reader that matches a request to a professional reads
  her reach, never her chosen communes: her list and her request page (`herListQuery`), her
  answer (`reachesCommune` in `src/lib/reservations/answers.ts`, read before the answer and held
  again by its INSERT), the urgent e-mail and the daily digest (`professionalsServing`). Her reach
  is `professional_reach`: her own communes at 0 km, and every commune her radius reaches above
  it. « Toute la Belgique » stores no reach and matches every commune by
  `professional_profiles.zone_whole_belgium`. The e-mails group the rows by professional, so a
  request reaches her once.
- **The feeding (demande-enfants-alimentation):** required on a publication and on an edit:
  « Allaitement maternel », « Lait infantile » or « Allaitement mixte ». It is a care instruction,
  not health data (D-20). A request published before the field has a null `feeding` and shows no
  feeding line. The e-mails do not carry it.
- **The optional reason (demande-motif-facultatif, D-20 superseded for this one field):**
  « Pourquoi souhaitez-vous être accompagné(e) la nuit ? » at the end of the form, 300 characters
  at most, with the founders' help line and their notice against medical or sensitive data.
  `care_requests.reason` stores it, null when empty. The family edits it like the other fields.
  A professional reads it on `/espace/professionnelle/demandes/[id]` only, which « Voir la
  demande » opens from each card and which shows only a request of her list (`herListQuery`).
  The founders read it under the row on `/admin/demandes`. No card, digest or e-mail carries it.
  `reason-isolation.test.ts` holds the readers, and a republished garde copies it.
- **Regular nights (demande-nuits-regulieres, D-65 kept per night):** the normal form asks
  « Nuit ponctuelle » or « Nuits régulières ». Regular nights replace the date with a calendar
  where the family ticks each night, from the day after tomorrow to the last day of next month
  (`seriesWindow`), 31 nights at most. `publishSeries` inserts one normal request per night in
  one statement, with the same details and one new `series_id`. A night she already holds refuses
  the whole series, and the form names it. Each night is a request of its own: a professional
  answers night by night, and the edit page changes one night. « Mes demandes » shows a series as
  one card with each night's state (`groupForList` in `series.ts`). « Annuler toutes les nuits »
  (`cancelSeries`) cancels the open nights ahead and declines their waiting answers. A booked
  night keeps its garde. The digest shows the nights of a series that read the same as one line
  (`groupForDigest`). Sent from a professional's profile, every night goes to her in priority,
  in one e-mail (`notifySeriesPriority`, D-71). An urgent request is always one night.
- **One regular request, one professional (JAM-302):** a series published from JAM-302 on has
  `care_requests.series_whole`. It is one request. Her list and its page show it once, with all
  its open nights (`groupForProfessional`, `SeriesEntry`). She answers all the open nights or
  none (`answerSeries`, one answer row per night, one conversation on the last night's answer).
  A night she is booked keeps her out (`seriesAnswerState`, Q5). The family sees the
  professionals who cover every open night (`familySeriesAnswers`) and books one for all of them
  with one Checkout (`startSeriesCheckout`): one `payments` row per night, one Stripe session,
  her credit cut over the nights (`splitCreditPart`). The paid Checkout books each night
  (`confirmPayment` → `settleSeries`), and each night then lives as its own garde (Q2). A refund
  is one night's card part. A whole series is never republished, sent in priority after its
  publication, answered, withdrawn, booked or cancelled night by night. Any request, a whole
  series included, is no longer editable once a professional answered it (`answersEver`, Q4).
  Series published before JAM-302 keep `series_whole` false and work night by night (Q3).
- **The extra hours:** « Heures supplémentaires », 0 to 6 whole hours, default 0, under « Heure
  de début ». `care_requests.extra_hours` stores them. The night ends at start + 11 h + the extra
  hours. `endTime` and `hasNightEnded` in `rules.ts` compute it, `nightEnd` in `night-end.ts`
  holds it in SQL, and `night-end-isolation.test.ts` refuses any other file that adds hours to a
  start. The récapitulatif names them apart: « 11 heures et 2 heures supplémentaires ».
- **The rules:** `src/lib/demandes/rules.ts` (pure: date windows, start times 18:00 to 23:00 by
  half hour, extra hours 0 to 6, age 0–12 semaines or 1–24 mois, the three feedings, a night
  started and ended, the digest's 18:00 gate),
  `validation.ts` (the form), `format.ts` (« Un bébé de trois mois », « 30/09/2026 de 20h00 à
  7h00 »). Words in `src/content/demandes.ts`; e-mails in `src/content/emails.ts`.
- **E-mails (D-61):** an urgent request e-mails every validated professional serving its commune
  right after publication (`after()`, `notifyUrgentRequest`). Normal requests go out in one
  digest a day: `POST /api/cron/demandes-digest`, bearer `CRON_SECRET`, sends from 18:00 in
  Brussels only, once a day at most, and puts each request in one digest at most. **Scheduling (D-62):**
  `.github/workflows/demandes-digest.yml` calls the route on UAT and production at 16:00 and
  17:00 UTC (and on demand), with the repository secret `CRON_SECRET`; Vercel Cron is not
  used because it never runs on the `uat` environment. One value serves both environments
  (D-68): set it as `CRON_SECRET` on each Vercel environment and in the repository's secrets,
  at least 16 characters long, or every cron route refuses the call (`src/lib/cron.ts`, D-153).

## The answer and the booking

- **The professional answers** on `/espace/professionnelle/demandes`: each card carries her rates
  (« 150 € pour la garde de nuit », « 15 € par heure supplémentaire ») and « Je suis disponible
  pour cette garde »; once answered,
  « Retirer ma disponibilité » (D-73). Her list holds the open requests ahead in her communes
  and those sent to her in priority wherever they are, priority first; never one she was
  declined on nor one on a night she is booked. `answerRequest` in
  `src/lib/reservations/answers.ts` checks the rules (`rules.ts`) and the INSERT holds them
  again. Both rates are frozen on the answer (D-74), and the booking copies them. A profile
  validated before profil-tarifs has no extra hour's rate: it still answers, and its cards show
  the night rate only until she fills the field. Each answer e-mails the family.
- **The family chooses** on `/espace/famille/demandes/[id]`: « Les professionnelles qui ont
  répondu à votre demande », each with « Voir le profil complet » and « Accepter et réserver »,
  which opens « Récapitulatif de votre garde ». `acceptAnswer` in `bookings.ts` is one
  transaction (`db.batch`): the answer `retenue`, the booking, the request `attribuee`, the other
  waiting answers `non_retenue`, her other answers that night `retiree`; the unique indexes turn
  two clicks racing into one booking and a « conflit ». Accepting needs the family's street and
  number (D-77). The rules only the SQL decides (her list, the priority candidates, the answers
  declined on a cancel, a republish or an accept, hers withdrawn that night) have no pure twin
  in `rules.ts`: each statement is a named builder, held by `statements.test.ts` beside it
  (D-167). Both sides get the guide's confirmation, the others « not retained ».
  The click only opens the fee's Checkout; `acceptAnswer` runs when the payment lands, and its
  first statement requires that payment, paid (**The service fee**, D-102).
- **Republish and edit (D-70, D-76):** a request with a waiting answer cannot be edited;
  « Republier ma demande » declines the waiting answers and sends the request out again (the
  urgent e-mail at once, or the next digest, which carries a request republished since its last
  one). Cancelling declines the waiting answers too.
- **Her profile leaving `valide` (D-146 to D-148):** reopening a validated file (« Modifier ma
  profession ou mes justificatifs », `reopenFile`) withdraws her waiting answers in the same
  `db.batch` (`reopeningWithdrawsAnswers` in `answers.ts`), so none comes back on a moved night
  at her old rate; the dialog says so beforehand. Once validated again she answers afresh.
  Migration `0013` withdrew the ones left behind before the fix. A suspension withdraws them too
  (D-134).
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
  `bookingAddress` in `src/lib/famille/profile.ts`, still the only reader of `family_profiles`:
  the request's own address, or the profile's for a request published before it had one.
- **Words:** `src/content/reservations.ts`; e-mails in `src/content/emails.ts`.
- **The rate she reads on a request (JAM-344):** in the professional's list and on a request page, a
  regular request shows « en priorité » and her rate as a single request does (`Mark` and `Fact` of
  `request-card.tsx`). While her answer waits, she reads the rate saved on the answer, the one the
  family reads, under « Votre tarif, indiqué à la famille avec votre réponse ». Before an answer and
  after a withdrawal, she reads the current rate of her profile. `shownRates` and `seriesShownRates`
  (`src/lib/reservations/rules.ts`) hold the rule.
- **The adapted schedule (JAM-306):** a professional can answer a night with a start that differs
  from the family's. « Proposer une autre heure de début » is above « Je suis disponible », with
  one list for each night of the request: a half hour from 18:00 to 23:00, the family's own start
  first. This applies to a single night, an urgent night, a regular request and an older series.
  The form posts `heure-<request id>`. `readProposal` in `src/lib/reservations/rules.ts` reads it,
  and the answer saves it in `care_request_applications.proposed_start_time` (null for no
  proposal). The length of the night does not change, so the end moves with the start. She changes
  or removes a proposal by withdrawing and answering again. The family reads each adapted night on
  the answer card, on her profile opened from the request, and in the récapitulatif, where it
  ticks « J'accepte l'horaire proposé par … » before the payment. The checkout opens only when
  what the family confirmed is what the answer holds (`proposalsSignature`), and the booking
  refuses an answer given again after the fee was opened. There is no refuse action: the family
  does not book the answer. The booking writes the proposed start in `care_requests.start_time`
  and keeps the family's in `requested_start_time` (`bookingSetsTheStart`), so each reader of a
  booked night reads the agreed start: the gardes, the reminder, the cancellation delay, the
  night's end, the e-mails and the back office. `requestedStart` reads the family's start: the
  « non retenue » e-mail, a republished garde and the record line « Horaire adapté : début demandé
  à …, début convenu à … » use it. A conversation reads its own answer's proposal
  (`conversationStart`). The two columns come from migration 0039.
- **A change of a proposal in place (JAM-349):** while her answer waits, a professional changes
  or removes the start she proposed on the answer itself, and she can add one after she answered:
  `changeProposal` for one night, `changeSeriesProposals` for a regular request, all its nights in
  one form and one statement. Her card has the form (`answer-footer.tsx`). A change is a new
  answer for the two protections of JAM-306: it moves `answered_at`, so a fee opened on the
  proposal of before books nothing (`acceptAnswer`), and the checkout refuses a confirmation that
  is not the proposal the answer holds (`proposalsSignature`). It also moves `answer_count`, which
  is in the key of the family's e-mail of the change (`notifyProposalChanged`, « [Prénom] a
  modifié l'heure de début proposée »): one e-mail for each change, with the requested start,
  the new start and the end of each night that changed, and one e-mail for a regular request. A value equal to the saved
  one writes nothing. A booked, declined or withdrawn answer is not changed.
- **The republication of a regular request (JAM-353):** « Republier ma demande » shows on the page
  of a regular request while one answer or more waits on an open night ahead and no night is
  booked (`canRepublishSeries`, `src/lib/reservations/republish-series-rules.ts`).
  `republishSeries` (`src/lib/reservations/republish-series.ts`) marks each open night ahead as
  republished and declines each answer that waits on those nights, in one batch. No night, time
  or other value changes. Each professional gets one « non retenue » e-mail for the request. The
  next digest carries the request again, but not to a declined professional.
- **Which start an e-mail gives (JAM-351):** the two sides of a booking read the agreed start
  (`bookingNotice`: the confirmation and the reminder). Each other e-mail about a request reads
  the start the family asked for, and its end follows that start: `summary()` and
  `seriesSummary()` in `src/lib/demandes/notify.ts` hold the rule for the urgent e-mail, the
  digest, the priority e-mail and « non retenue ». The confirmation of a regular request gives
  each night its own agreed start when the starts differ. The e-mail of a changed proposal is
  before a booking, so its requested start is the family's start, and its end follows the start
  that the line shows.
- **The adapted schedule in the back office (JAM-350):** each back-office surface that shows the
  start of a booked night shows the record line: the lists « Réservations », « Demandes » and
  « Signalements », the gardes of an account's page, and the suspension dialog. The line is
  `agreedStartLine` (`src/lib/reservations/format.ts`). A back-office read of a night's start
  selects `nightColumns` (`src/lib/admin/lists.ts`), which has the family's start with it.
  `upcomingGardeLine` (`src/lib/admin/format.ts`) makes the line of a garde on the account page.
  `src/lib/admin/adapted-schedule.test.ts` holds the rule.
- **The founders' list of communes (JAM-361):** `/admin/communes` lists the 565 communes with
  their postcodes, the number of validated professionals who serve each one, and the share link
  of its public page (`/garde-de-nuit/<slug>`). The count uses the rule of the search: a
  professional of « Toute la Belgique » counts for every commune, and each other professional
  counts for the communes of her reach. `servingCounts` in `src/lib/recherche/professionals.ts`
  reads the counts in two queries. `src/lib/admin/communes.ts` has the pure rules: the search by
  name or postcode, the order (most professionals first, then the name), 50 for each page, and
  the share link, made from the host of the request (`src/lib/site-origin.ts`) and
  `communePath`: a link copied on UAT names UAT. The page shows counts only. `CommuneShare`
  (`src/components/admin/commune-share.tsx`) shows the link, « Copier le lien » and the link to
  the public page. Its `children` is the place of the QR code, which is not built.

## The garde's life

A confirmed booking, from the payment to the morning after (cycle-de-garde-et-annulation, D-17,
D-105 to D-113). `src/lib/gardes/` holds the rules (`rules.ts`, pure and tested) and the only
writes of a booking's status columns (`gardes.ts`); creating a booking and both sides' reads stay
in `src/lib/reservations/bookings.ts`.

- **The state, by the clock (D-109):** a booking stores only `confirmee` or `annulee`. « À venir »
  before the start hour, « En cours » until start + 11 h + the extra hours, « Terminée » after, all Brussels time,
  are read by `gardeState` at display time; no job changes a state. Both lists, both garde pages
  and the family's request page show it.
- **Cancelling (D-105, D-2):** either side, from its garde page, until the start hour, through
  the red confirmation dialog. One statement cancels the garde (who is responsible, who clicked,
  when) and its request (`cancelBookedRequestStatement` in `src/lib/demandes/`), which closes its
  conversations and frees the professional's night (`bookings_profile_night_key` counts
  confirmed gardes only). The same batch writes what the founders' table does with the fee
  (**The founders' table** below). No cancellation calls Stripe. The other side gets one e-mail.
- **The reason (annulations-delai-et-motif, D-20):** the cancel dialog asks one reason from the
  side's short list (`CANCELLATION_REASONS` in `rules.ts`), never free text. The dialog stays
  open without one, and `cancelGarde` refuses a reason outside the side's list. The reason sits
  in `bookings.cancellation_reason`. Both garde pages and `/admin/signalements` show it. An
  absence has none, and neither has a garde cancelled before the column existed.
- **The cancellation delay (annulations-delai-et-motif, the answers [9.2]):** `app_settings`
  holds `delai_annulation_heures`, 24 by default, a whole number of hours from 1 to 168. A
  founder changes it under « Réglages » on `/admin/dossiers`, through a confirmation, with a
  journal entry (`src/lib/settings/`). `isLateCancellation` in `rules.ts` takes it, and the
  family's cancel dialog says from it whether her fee becomes a credit or stays at Berceo.
- **Reporting an absence (D-106):** from the start hour until 24 h after the night, either side
  reports the other absent; the garde is cancelled against the absent side (kind `absence`), who
  gets one e-mail. The same batch applies the founders' table. The founders read it under
  `/admin/signalements` with every cancellation.
- **The founders' table (annulations-table, the answers [9.2, 9.3]):** `outcomeOf` in `rules.ts`
  returns the line that applies, and `rules.test.ts` holds one test per line. The family cancels
  more than the delay before the start: a credit. Within the delay: the fee stays at Berceo. The
  professional cancels, at any delay: a credit. The professional is reported absent: a credit.
  The family is reported absent: the fee stays. A cancellation by Berceo: a credit
  (`cancelGardeForBerceo`, annulations-back-office). A garde with no
  paid fee: nothing. `cancelGarde` and `reportAbsence` hold the same lines in SQL. The credit is
  one statement of their batch (`gardeCreditStatement` in `src/lib/credits/`), guarded on the end
  this batch wrote and on a `payee` fee. A garde holds one live credit at most
  (`credits_booking_live_key`).
- **The litige (annulations-table):** for 24 hours after an absence report (`CONTEST_HOURS`), the
  side reported absent may click « Contester ce signalement ». `contestAbsence` writes
  `disputed_at` and `disputed_by_user_id`, clears the founders' handled marker, and voids the
  credit the report issued (`voided_at`), in one batch. A litige issues no credit. Both garde
  pages and `/admin/signalements` show it. The founders decide, by hand.
- **The fee line:** `feeLine` in `rules.ts`, on both garde pages. The litige, a refund, the live
  credit (the family reads its amount and its expiry), or the fee kept after the family's own
  cancellation or absence. A professional's cancellation made before the table has no credit and
  shows nothing: it waits in « À rembourser ».
- **Republishing (D-107, D-112):** on a cancelled garde whose night has not started, « Republier
  ma demande » publishes a new request for the same night through `publishRequest` (the
  cancelled request's commune and address, the urgent flag by the date window), or links to
  her live request that night if she already has one.
- **The address (D-110):** `bookingAddress` returns it only on a confirmed garde whose night has
  not ended.
- **The reminder of the day before (D-108, D-113):** `.github/workflows/gardes-rappel.yml` calls
  `POST /api/cron/gardes-rappel` (bearer `CRON_SECRET`) at 08:00, 08:30, 09:00 and 09:30 UTC on
  UAT and production; the route sends only between 10:00 and 10:59 Brussels. Each of tomorrow's
  confirmed gardes is claimed, then both sides are e-mailed; a failed send releases the claim for
  the next call. A 404 (the route not yet promoted) is a skipped call.
- **The platform line (D-111):** one sentence (`cadre` in `src/content/emails.ts`) under the
  button of both confirmations and both reminders.
- **Words:** `src/content/gardes.ts` (every entry `@relecture`), the e-mails in
  `src/content/emails.ts`, the admin list in `src/content/admin.ts`.

## The ratings

After a garde each side rates the other with stars, never a word of text (avis-etoiles, D-18,
D-115 to D-122). `src/lib/avis/` holds the rules (`rules.ts`, pure and tested) and the only reads
and writes of `ratings` and `rating_invitations` (`ratings.ts`); every rule is held again in the
SQL of the statement it governs. The garde's state is `src/lib/gardes/`'s, never re-derived.

- **Who rates what (D-115):** the family rates the professional on Ponctualité, Communication,
  Soin and Confiance; the professional rates the family on Accueil, Communication, Clarté des
  consignes and Respect du cadre. 1 to 5 whole stars each, all four required, stored as
  `score_1` … `score_4` in the order `CRITERIA` fixes. The table has no text column.
- **When (D-117, D-122):** once per side, from the moment the garde is terminée until 14 days
  after the night's end, never on an annulée garde, never edited. The insert holds all of it
  (`on conflict do nothing` on the unique garde and side). An absence reported after the end
  cancels the garde: its ratings stay stored, show on `/admin/avis` as not counting, and count
  nowhere.
- **Double-blind (D-116):** a rating counts once the other side has rated too, or once the 14
  days are over, computed at read time. Nobody but the founders ever reads a single rating; each
  side sees only the stars it gave.
- **The note and the gardes count (D-119):** `notesOfUsers` returns the mean of every published
  criterion score to one decimal (« 4,6 », `NoteDisplay`), or « Pas encore de note », and the
  person's terminée, non-annulée gardes, hidden at zero. Shown on the full profile and the answer
  cards (`PublicProfile.note`, `Applicant.note`), on the professional's request cards and garde
  page as the family's (`ProfessionalRequest.family`, keyed by request so the family's id never
  leaves, D-118), and on each side's own home (D-121).
- **The form:** `/espace/famille/reservations/[id]/avis` and `/espace/professionnelle/gardes/[id]/avis`,
  reached by « Laisser un avis » on both lists and both garde pages and from the e-mail. The side
  is the route's, the user the session's; only four whole numbers are read from the form.
- **The invitation (D-120):** `.github/workflows/avis-invitations.yml` calls
  `POST /api/cron/avis-invitations` (bearer `CRON_SECRET`) every hour at :17 on UAT and
  production. Each side of each terminée garde inside its window, not yet invited and not yet
  rated, is claimed in `rating_invitations` just before its e-mail (the family's is the guide's
  « Demande d'avis post-garde », verbatim) and released if the send fails. No reminder.
- **The founders' list (G-03, D-118):** `/admin/avis`, in the back-office's navigation, every
  rating newest first, 50 a page, both full names, the four scores, the mean and whether it is
  published. Read-only.
- **Words:** `src/content/avis.ts` (every entry `@relecture` but « Laisser un avis »), the
  e-mails in `src/content/emails.ts`, the admin list in `src/content/admin.ts`.

## The search and the public pages

A family searches the professionals reaching her commune; anyone finds a professional's teaser page
or a commune's page on the open web (recherche-et-fiches-publiques, D-11, D-14, D-123 to D-129).
`src/lib/recherche/` holds the rules (`rules.ts`: what a query resolves to, the order, the zone and
the titles; `slugs.ts`: every address; `sitemap.ts`), all pure and tested, and the only reads
(`professionals.ts`, server-only). Words live in `src/content/recherche.ts`; the blocks in
`src/components/recherche/`.

- **What leaves (D-14, D-126):** `teaserColumns` (id, first name, profession, bio, « Formations
  complémentaires », her radius and « Toute la Belgique ») for a public
  page, `cardColumns` (the same plus her photo) for a signed-in card; never her surname, e-mail,
  phone, INAMI number, rate or documents. Only a `valide` profile is read, held in each query's
  SQL; any other status reads as unknown. The note and gardes count come from `src/lib/avis/`,
  the next nights from `src/lib/disponibilites/`; the module computes neither.
- **The search (D-11):** `/espace/famille/recherche`, « Trouver une professionnelle » in the
  family's navigation and on her home (D-25). The guide's field on the profile's commune
  combobox, as a GET form posting `q`: a picked locality, a four-digit postcode (every commune it
  covers) or a name that is exactly one commune's resolves to communes and redirects to
  `?commune=` (repeated), so a result list is a URL; anything else shows « Nous ne trouvons pas
  cette commune ». Opened bare, it searches her own commune. No result: the guide's message
  without its neighbouring-zones clause (D-124) and « Publier une demande ».
- **The reach (zone-rayon-lecture):** the search and the commune pages list a professional when
  her reach holds the commune, or when she chose « Toute la Belgique » (`servingQuery`). Her
  cards, her public page and her full profile show her chosen communes, then her radius in one
  line (`reachLine`): « Se déplace jusqu'à 20 km autour de ses communes », or « Se déplace dans
  toute la Belgique ». At 0 km there is no line.
- **The order (D-123):** soonest indicative night first, then those with none; ties by first
  name, then profile id. No sort control, no filter but the zone.
- **A professional's page (D-125):** `/professionnelles/[prenom]-[id8]`, her first name slugged
  and the first 8 hex of her profile id. It resolves on `id8` alone (exactly one `valide` match,
  else 404) and sends a stale first-name part to the canonical path for good. Indexable (on
  production), the guide's title and meta, no photo; the call to action is family sign-up with
  the way back to her full profile.
- **The commune pages (D-127, D-128):** `/garde-de-nuit/[commune]` for all 565 communes, served
  or not, every one indexable and in the sitemap; the reaching professionals' teaser cards, or the
  no-result message and the sign-up link. The slugs are unique (a test holds it).
- **The sitemap:** rendered on request (the build never reads the database); the vitrine, every
  commune page, and each `valide` professional's page, the list cached for an hour.
- **The way back (D-129):** sign-in and family sign-up link to each other with `retour`; a
  family's sign-up stores a checked `retour` in the one-day `berceo_retour` cookie
  (`src/lib/auth/retour.ts`), and the e-mail confirmation route sends her there, signed in, then
  clears it. Same browser only; a professional never sets or reads it.

## The service fee

The 3 % fee (D-2), through Stripe Checkout, Bancontact and cards (frais-de-service). Berceo
never touches the money for the night (D-1).

- **The amount (D-99):** 3 % of the chosen answer's frozen rate, computed on the server as
  `rate × 3` cents (from 3,00 €, with no ceiling since profil-tarifs), all-in, VAT included; Stripe Tax is off. The summary
  shows it with the Tarifs page's two sentences (`src/content/paiement.ts`).
- **Paying (D-102, D-92):** « Confirmer et régler les frais de service » runs the booking rules,
  closes the request's open Checkout if any (one per request, a partial unique index), opens a
  30-minute Checkout and records it in `payments` as `en_attente`. Nothing about the request or
  its answers changes while the family is on Stripe.
- **The credit pays first (credits-au-paiement):** before the Checkout, her Berceo credit pays
  its part (**The credits**). `payments.credit_cents` records it, and Stripe asks
  `amount_cents - credit_cents`.
  - A balance that covers the fee writes the row `payee` with no session and its takes
    `confirmee`, in one batch. `settle` then books it at once. No Stripe page opens.
  - A smaller balance holds its takes `reservee` in the batch that records the Checkout. A held
    credit leaves her balance at once, so a second tab cannot spend it.
  - The payment confirms the takes in the batch that writes `payee`. Every other way out of
    `en_attente` (expired, abandoned, failed) gives them back in the batch that writes the status.
    `startCheckout` first closes her own stale Checkouts that hold credit, for previews that get
    no webhook.
  - A Checkout that turned out paid after its credit went back books nothing. Its card part is
    refunded (`creditPartHeld`).
  - A cancellation that the founders' table turns into a credit issues the whole fee as a new
    credit, 24 new months.
  - The récapitulatif names the credit part and the rest before « Confirmer ». The garde's page,
    the confirmation e-mail and `/admin/paiements` name the credit part too.
- **The booking is made by the payment (D-102, D-103):** `confirmPayment` in
  `src/lib/paiements/payments.ts` reads the session from Stripe, takes the row
  `en_attente → payee` with one conditional update, then runs `acceptAnswer`, which books only
  against that paid row. Two paths call it: the webhook `POST /api/webhooks/stripe` and the
  return page `/espace/famille/reservations/paiement` (so previews, which Stripe cannot reach,
  still book). Whichever wins sends the e-mails. A payment whose booking can no longer be made
  is refunded in full at once and the family told (page and e-mail).
- **Abandoning:** « Retour » on Stripe goes to `/espace/famille/reservations/paiement/abandon`,
  which expires the Checkout; an unpaid one expires on its own after 30 minutes, and a row
  `en_attente` past `expires_at` reads as expired without a cron.
- **Refunds (D-101, D-94):** `refundFee(paymentId, reason, now, by?)` is the one refund: the whole
  fee, a `payee` row only (or a failed refund, to retry), one Stripe idempotency key per payment
  and attempt. Reasons: `annulation_professionnelle` (a professional's cancellation before the
  founders' table, **The garde's life**), `reservation_impossible`, `berceo` (the founders' button, one `frais_rembourses` journal
  line), `stripe` (a refund made in Stripe's dashboard, synced by the webhook). A refund Stripe
  reports failed reads `remboursement_echoue`. A fee that became a live credit is refused
  before Stripe (`feeHasLiveCredit` from `src/lib/credits/`), so no fee is credited and refunded.
  A fee a credit paid in part refunds its card part at Stripe, and its credit part goes back to
  its credits in the same batch. A fee a credit paid whole calls no Stripe. A credit is never
  refunded to a card (credits-au-paiement).
- **The founders' list (D-93):** `/admin/paiements`, every fee newest first, 50 per page, with
  « Rembourser les frais ». Families and professionals see no payment history.
- **Fees still owed (D-162, D-164):** a `payee` or `remboursement_echoue` fee whose booking the
  professional cancelled (kind `annulation`) is marked « À rembourser » on its row, listed by
  `/admin/paiements?statut=a-rembourser`, and counted on the overview when there are any. One
  condition, `awaitingRefund()` in `src/lib/paiements/payments.ts`, drives all three. It leaves
  out a fee that became a live credit, so only a cancellation made before the founders' table
  waits there. A fee turned into a credit reads « Devenus un crédit Berceo » and offers no
  refund. The founders' refund still records `berceo` (D-163).
- **Configuration (D-100):** `STRIPE_SECRET_KEY` (test key on Preview, live key on
  Production only once the company's Stripe account exists) and `STRIPE_WEBHOOK_SECRET` (per
  environment). In Stripe's dashboard, per account: enable Bancontact, and add the endpoint
  `https://uat.berceo.be/api/webhooks/stripe` (test mode) or `https://www.berceo.be/api/webhooks/stripe`
  (live) with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `checkout.session.expired`, `refund.created`,
  `refund.updated`, `refund.failed`; its signing secret is that environment's
  `STRIPE_WEBHOOK_SECRET`. The client pins the API version `2026-08-26.dahlia`.
- **Words:** `src/content/paiement.ts`; the admin page in `src/content/admin.ts`; the refund
  e-mail in `src/content/emails.ts`.

## The subscriptions

The four family plans of the devis (abonnements-familles), sold through Stripe Checkout in
subscription mode (abonnements-catalogue-stripe). The 3 % fee does not change.

- **The plans:** Découverte (every month), Parenthèse (every 3 months), Sérénité (every 6
  months), Premium (every 12 months), at the prices of **The vitrine**, VAT included, Stripe
  Tax off. No trial. Stripe holds the amounts. Each plan's price id is an environment variable,
  `STRIPE_PRICE_DECOUVERTE`, `STRIPE_PRICE_PARENTHESE`, `STRIPE_PRICE_SERENITE`,
  `STRIPE_PRICE_PREMIUM`: names in `.env.example`, values in Vercel, never in git. A missing
  one makes its plan fail with the generic error.
- **The row:** `subscriptions`, one row per Stripe subscription, kept after it ends. At most
  one live row (`en_attente`, `active`, `impayee`) per family, held by a partial unique index.
  The family's Stripe customer is `users.stripe_customer_id`, made at her first Checkout.
  `src/lib/abonnements/subscriptions.ts` holds the only reads and writes of both.
- **Choosing:** `/espace/famille/abonnement` shows the four plans, each with « Choisir ».
  The family's home links to it. A Checkout is refused while a subscription is `active` or
  `impayee`, or while its first payment is pending. An earlier open Checkout is expired first.
  The Checkout lasts 30 minutes and takes Bancontact, cards, Apple Pay and Google Pay. Stripe
  takes the renewals of a Bancontact subscription by SEPA Direct Debit.
- **At sign-up (abonnements-inscription-famille):** `/inscription-famille` opens on the four
  plans. The form is refused without one. The plan goes on `users.signup_plan`, in the batch
  that writes the row and its two consent rows. The account exists before the payment. An
  unpaid account is a normal account with no subscription. The e-mail confirmation sends a
  family with a plan to `/espace/famille/abonnement/commencer`, which opens the Checkout of
  that plan (only a redirect leads there, never a link a prefetch would open). The way back
  of D-129 stays in its cookie through the Checkout. The return page sends a paid family
  there. Until a Checkout of hers completes, her home shows one call, « Finaliser mon
  abonnement », for the plan she picked (`planToFinish`). The sign-in does not force the
  Checkout. A family who signed up before this has no plan and sees « Voir les formules ».
- **Stripe's word:** `syncSubscription` reads the subscription from Stripe and copies its
  status, plan, renewal date, cancellation date (`cancels_at`) and end onto the row, so a late
  or repeated event writes the same row. Three paths call it: the webhook, the return page
  `/espace/famille/abonnement/retour` and the portal's return `/espace/famille/abonnement/portail`
  (so previews, which Stripe cannot reach, still subscribe and still show a change). Stripe's `active` reads `active`, `incomplete` reads `en_attente`, `past_due` and
  `unpaid` read `impayee`, anything else reads `terminee`.
- **The grace period:** 7 days from the first failed renewal, on `grace_ends_at`. Stripe's
  later retries never extend it. A paid renewal clears it.
- **Managing it (abonnements-espace-echec-paiement):** a running subscription on
  `/espace/famille/abonnement` shows the plan, its price, the renewal date (or « prend fin le »
  once cancelled) and the status: actif, résiliation programmée, paiement en attente (the grace
  period) or suspendu (after it), from `subscriptionState`. « Gérer mon abonnement » opens
  Stripe's customer portal (`openPortal`) for the family's customer: the card, the plan, the
  cancellation and the invoices. The family's home shows the end date and the warning line too.
- **The failed renewal:** the call of `syncSubscription` that moves the row into `impayee`
  claims the move with a conditional update and sends the one e-mail after the response
  (`notifyGracePeriod`, `src/lib/abonnements/notify.ts`), so Stripe's retries send no second
  one. The e-mail and the page's warning link to Stripe's page for the open invoice
  (« Régler maintenant »). After the 7 days the gate closes. A paid invoice syncs the row to
  `active` and opens it again. Confirmed gardes stand throughout.
- **The one rule:** `hasActiveSubscription(row, now)` in `src/lib/abonnements/rules.ts`: an
  `active` row, or an `impayee` row before its grace period's end. `isSubscribed(userId, now)`
  reads it for a family. Every later stub of the epic reads this rule.
- **What it opens (abonnements-acces):** `familyMay(action, { subscribed, booked })` in
  `rules.ts` is the one gate. `subscribed` is `hasActiveSubscription`, so the grace period
  opens everything and a pending first payment opens nothing. The seven actions: `publier`
  (publish and republish), `modifier`, `reserver` (« Accepter et réserver », before the fee's
  Checkout), `priorite`, `profil` (the full profile), `ecrire` and `favori` (the mark « mes
  professionnelles »). `booked` opens `ecrire` in
  the booked answer's conversation, which closes when the night is over.
  `familyMayNow(userId, action, now)` reads it for a page or an action.
  - Each page shows the invitation line (`SubscriptionRequired`,
    `src/components/abonnements/`) in place of a closed action. A page that is itself the
    action (the new request, the edit, the full profile, the priority request) shows only
    the line.
  - Each server action reads the gate again before its write and goes back to its page.
    `sendMessage` holds the gate for the family side with the facts it reads.
  - Without a subscription the search stays open with the public teaser cards, which link to
    the public pages. Her requests stay published, and she can cancel them. Her confirmed
    gardes stay whole: the phone, cancelling, the absence, the conversation and the rating.
  - The professionals' side reads none of it.
- **Invoices:** Stripe sends each invoice and receipt by e-mail. The platform lists none.
- **The founders' list (abonnements-back-office):** `/admin/abonnements` lists every
  subscription Stripe created, newest first, 50 per page: the family (linked to her account
  page), the plan, the state, the start, the renewal date (or the end once cancelled or ended),
  the grace period's end, and a link to the subscription in Stripe's dashboard (test mode with a
  test key). A Checkout left unpaid is no subscription and is not listed. `?statut=actifs` keeps
  the rows `hasActiveSubscription` counts, with one SQL condition, `subscriptionListCondition`,
  which « Vue d'ensemble »'s « Abonnements actifs » counts too. A family's account page shows
  her plan and its state: her live subscription, else her latest ended one. Nothing in the
  back-office changes a subscription: Stripe does.
- **Configuration, per Stripe account (test on UAT, live on Production):**
  1. Make four products, each with one recurring price in euros: monthly, every 3 months,
     every 6 months, yearly. Put each price id in its Vercel variable.
  2. Enable Bancontact and SEPA Direct Debit.
  3. Settings, Billing, Subscriptions and emails: keep Smart Retries on. After the last failed
     retry, cancel the subscription. Turn on the e-mails of invoices and receipts. Turn off
     Stripe's e-mails about failed payments: Berceo sends the one e-mail.
  4. Add these events to the webhook endpoint of **The service fee**:
     `customer.subscription.created`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
  5. Settings, Billing, Customer portal (abonnements-espace-echec-paiement):
     - Payment methods: customers can update them.
     - Invoice history: on.
     - Cancellations: on, at the end of the billing period, no proration.
     - Subscriptions: customers can switch plans, among the four products' prices. Schedule
       downgrades at the end of the period, for both conditions (a lower price, a shorter
       interval). Stripe applies an upgrade at once: the portal cannot defer it. Proration:
       prorate charges and credits, so an upgrade credits the unused part of the old period.
     - The return link needs no setting: the code sends `/espace/famille/abonnement/portail`.
- **Testing a failed renewal:** `STRIPE_TEST_CLOCKS=1` (Preview and `uat`, never Production)
  gives each new Stripe customer its own test clock, named `abonnement-<user id>`. A live key
  ignores it. In Stripe's dashboard (test mode), Billing, Test clocks: change the customer's
  card to `4000 0000 0000 0341`, then advance the clock past the renewal date. Stripe's clock
  moves Stripe only: the grace period counts in real time, so its end is tested by waiting or
  by moving `grace_ends_at` into the past in the UAT database.
- **Words:** `src/content/abonnements.ts`, under `espace`, `retour`, `inscription`,
  `accueil` and `requis` (the invitation line); the failed renewal's e-mail in
  `src/content/emails.ts`, `abonnementImpaye`.

## The one-night plan and the promotion codes

JAM-304, the founders' feedback round 2. The client's request overrides the rule « no price
but the four subscriptions, 130 € and 3 % » for one price only: 14,75 €.

- **The plan:** « Une nuit », 14,75 €, a one-off payment through Stripe Checkout in payment
  mode. Its price id is `STRIPE_PRICE_UNE_NUIT` (a one-off price, not a recurring one): name in
  `.env.example`, value in Vercel, never in git. A missing one makes the plan fail with the
  generic error.
- **The row:** `night_passes`, one row per Checkout: `en_attente`, `payee` or `terminee`. At
  most one open Checkout per family. `src/lib/abonnements/subscriptions.ts` holds its only reads
  and writes. The webhook tells a pass's Checkout from the fee's by its metadata
  (`kind: une_nuit`).
- **What it opens:** what a subscription opens, for one booking (`nightPassOpen`). A paid pass
  stays open until the family's first booking confirmed after the payment. It then closes when
  that night ends, also when that booking is cancelled. A pass with no booking has no end date.
  `isSubscribed` reads the subscription and the pass, so every gate reads both. A pass is
  refused while a subscription runs or while another pass is open.
- **The promotion codes:** every Checkout, the four subscriptions and the pass, takes a code
  (`allow_promotion_codes`). The founders make and deactivate the codes on
  `/admin/codes-promo` (`src/lib/abonnements/promo-codes.ts`). Stripe keeps them: a coupon of
  duration `once` (the first payment only, for the five plans) and its promotion code. Each
  change writes a line in the journal. The code and its discount are read back from the
  completed Checkout onto `subscriptions` and `night_passes`, and the founders' list of
  subscriptions shows them. With a restricted key, `STRIPE_SECRET_KEY` needs write access to
  Coupons and Promotion codes.

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
- **Closing (D-89):** a conversation accepts messages until the night ends (start + 11 h + the
  extra hours, Brussels), whatever its answer's state; a cancelled request closes it at once. Closed, it stays
  readable. `isConversationOpen` in `rules.ts` is the one rule; `sendMessage` holds it again in
  SQL. A cancelled garde cancels its request (D-110), so its conversations close at once too.
  While the professional's profile is not `valide`, her conversations are closed for both sides
  as well, except the one of her booked (`retenue`) answer (D-156); still readable (D-157), and
  open again by themselves if she is validated before the night ends, since the rule reads her
  current status (D-158).
- **Words:** `src/content/messagerie.ts`; the e-mail in `src/content/emails.ts`.
- **The title (JAM-345):** `conversationTitle` gives « Conversation avec Alix, Sage-femme », with a
  capital first letter on the first name and the profession, as the founders' example shows. The
  page heading is an H1, and the DA puts each H1 in capitals by CSS, so the page shows capitals.

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

## The favourites

- **The mark (favoris-marquer):** a subscribed family marks a professional with « Ajouter à mes
  professionnelles » and removes the mark with « Retirer de mes professionnelles ». The button
  sits on the full profile, beside the priority request, and at the foot of each search card,
  where a heart alone in a square capsule carries her first name as its name. The card's link
  holds the content and the button sits outside it. `markAction` (beside
  `espace/famille/professionnelles/`) reads `familyMayNow(…, "favori")` and `publicProfile`
  again before the write.
- **The table:** `favourites`, one row per `(family_user_id, profile_id)`, both cascading.
  A lost subscription keeps the rows and hides the mark. A profile that is not `valide` keeps
  its rows, and no reader shows it. An account's deletion removes its rows and the rows on its
  profile in its own batch (`deletionForgetsFavourites`).
- **The list (favoris-liste):** « Mes professionnelles », at `/espace/famille/professionnelles`,
  in the parent's navigation after the search and linked from her home. Her marks first, the
  last marked first, then the professionals of her past gardes, the most recent night first,
  each profile once. A past garde is a `confirmee` booking whose night `gardeState` reads as
  « Terminée »; `listedIds` in `rules.ts` holds the order and the dedupe, pure, with its test.
  `listedProfiles` in `src/lib/reservations/profiles.ts` reads the cards (a subset of
  `profileColumns`, the column test holds it): a deleted account is absent (D-136), a profile
  not `valide` or an account suspended is `available: false` and its card reads unavailable,
  with no link, no button and no mark. With a subscription each card opens the full profile
  and the priority request and carries the mark, « Retirer » on a favourite and « Ajouter » on
  a past garde's professional. Without one the invitation line shows once under the title and
  the cards carry no button. Empty, the page sends her to the search.
- **Hers alone:** only `src/lib/favoris/favourites.ts` names the table. No page of the
  professional, of the founders or of the vitrine reads it. `src/lib/favoris/isolation.test.ts`
  holds both. Words in `src/content/favoris.ts`, every one `@relecture`.

## The credits

- **The credit (credits-registre):** a fee kept for a later garde, from the founders' table
  (the answers [9.2]). It lasts 24 months from its issue, `CREDIT_MONTHS` in
  `src/lib/credits/rules.ts`, a constant and not a founders' setting. The amount is the fee's,
  in cents, never a night rate. The end of a garde issues the table's lines
  (`gardeCreditStatement`, inside the batch of `src/lib/gardes/gardes.ts`, annulations-table).
  The founders' hand (annulations-back-office) is `grantCreditStatement`, inside the batch of
  `grantFeeCredit` in `src/lib/admin/lists.ts`.
- **The table:** `credits`, one row per credit: the family, `amount_cents`, `spent_cents`, the
  origin (`annulation_famille`, `annulation_professionnelle`, `absence_professionnelle`,
  `annulation_berceo`, `geste_berceo`), the payment and the booking it comes from or the founder
  who granted it, a note, `issued_at`, `expires_at` and `voided_at` (a contested absence). A
  garde holds one live credit at most (`credits_booking_live_key`). A money record like a payment: every
  link is set null on delete, never cascaded, so a deleted account never deletes a credit.
  Checks hold the amount positive, `spent_cents` within it and the expiry after the issue.
- **The rules, pure:** a credit reads `disponible` until its expiry, `expire` from it,
  `annule` from its voiding, and `utilise` once spent to the last cent, whatever the clock.
  `remainingCents` is what it can still pay, 0 once spent, voided or expired. `balanceCents` sums the remainders. `spendingPlan` picks
  the credits that pay an amount, the earliest expiry first, then the earliest issue, each to its
  remainder, and names the rest the Checkout takes (`credits-au-paiement`). `rules.test.ts`
  holds them.
- **The statements:** `familyCredits` reads every credit of a family at a moment, the earliest
  expiry first, with its state, its remainder and her balance. `issueCredit` writes one at a
  moment with its expiry. No code calls it yet. `gardeCreditStatement` and `voidGardeCreditStatement` are the end of a garde's
  statements, `gardeCredits` the garde pages' read, and `feeHasLiveCredit` the fee's condition.
- **The credit pays a fee (credits-au-paiement, Jamie 2026-10-29):** `planCreditPart` reads her
  balance and takes `creditShare` of the fee: the whole fee when the balance covers it, equal or
  above. Otherwise all it can, but Stripe never asks less than 0,50 € (`STRIPE_MIN_CENTS`), so the
  credit then pays a little less. `spendingPlan` picks the credits. A partly spent credit keeps
  its balance.
- **The takes:** `credit_spends`, one row per credit a fee takes from: the credit, the payment,
  the cents and a state, `reservee`, `confirmee` or `liberee`. A take adds to `spent_cents` in
  the same statement (`holdStatements`), guarded on the spent amount the plan read. A take
  whose credit changed writes 0 cents, and `credit_spends_cents_positive` rolls the whole batch
  back (`isHoldConflict`). `confirmHoldStatement` confirms the takes once the fee is paid.
  `releaseHoldStatement` gives them back once the fee closed unpaid or was refunded, and only
  then: it reads any status but `en_attente` and `payee`. It is safe to repeat. A credit that
  expired or was voided meanwhile gets its cents back and still pays nothing.
- **The block:** « Mes crédits », `src/components/credits/credits-block.tsx`, on the family's
  home under « Votre abonnement » and on « Mes réservations » under the intro. Her balance, then
  each usable credit with what it can still pay and « valable jusqu'au » its expiry, then the
  spent, voided and expired ones under « Crédits utilisés, annulés ou expirés », each with its origin. With no
  credit, one line. Words in `src/content/credits.ts`, every one `@relecture`.
- **The founders' hand (annulations-back-office):** on « Signalements », « Accorder un crédit »
  on a garde in litige, or whose fee the family's own cancellation or absence left at Berceo
  (`canGrantCredit` in `src/lib/admin/rules.ts`). The founder writes a note, 1 to 500
  characters (`NOTE_MAX`), which only the founders read. One batch writes the credit of the
  fee's amount, origin `geste_berceo`, with the founder and the note (`grantCreditStatement`, the
  rule again in SQL: a `payee` fee, no live credit), marks a litige handled, and writes the
  journal entry `credit_accorde`. The family gets one e-mail (`notifyCreditGranted` in
  `src/lib/credits/notify.ts`), without the note.
- **The founders' list:** `/admin/credits` (`ADMIN_CREDITS_PATH` in `src/lib/credits/paths.ts`),
  every credit, newest first, 50 a page (`adminCredits`), under a line that counts the credits
  that can still pay and what they can pay in all (`liveCreditSummary`). The overview's block
  « Crédits disponibles » reads the same function (D-133). Read-only.
- **Hers alone:** only `src/lib/credits/` and the schema name the tables `credits` and
  `credit_spends`. `src/lib/credits/isolation.test.ts` holds that.

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
  then checks the size and first bytes before recording the file (`src/lib/documents/`). The row
  is written under a lock on her profile row, with the three-files-per-document limit and the
  key's novelty read inside it (`src/lib/professionnelle/uploads.ts`), so two uploads confirmed at
  once cannot pass the limit or delete a file the other just recorded. Her photo is one file:
  the statement that records a new photo deletes every other photo row under the same lock and
  hands back their keys, whose objects the action deletes after the commit, so two photos
  confirmed at once leave one, the last recorded. A file she removes, and the documents a new
  profession no longer asks for, leave the bucket before their row, and a row goes only once its
  object is gone (`src/lib/professionnelle/removals.ts`): an object that cannot be deleted keeps
  its row, so the purge and the account deletion still find it. She confirms each removal in a
  dialog first (JAM-343, `src/components/professionnelle/remove-file.tsx`). Files are
  read only through `/api/fichiers/[id]`, streamed to their owner or an admin, 404 to anyone else.
  Environment: `DOCUMENTS_S3_ENDPOINT`, `DOCUMENTS_S3_REGION`, `DOCUMENTS_BUCKET`,
  `DOCUMENTS_S3_ACCESS_KEY_ID`, `DOCUMENTS_S3_SECRET_ACCESS_KEY` (not `AWS_*`: Vercel reserves
  those). The bucket's CORS rule allows PUT from `https://uat.berceo.be`, the project's preview
  origins and `http://localhost:3000`.
- **Her zone (D-11)** is one to fifty communes from the shared commune list (below), stored as
  REFNIS codes in `professional_communes.commune_ins`, the key `family_profiles` carries too.
  `searchCommunes` in `src/lib/communes/` groups the list's localities by commune for the picker.
- **Her radius (profil-zone-rayon-saisie)** sits under her communes on step 2 and on her file's
  page: « Uniquement mes communes », 10, 20, 30, 40 or 50 km, or « Toute la Belgique », as seven
  radio buttons. `professional_profiles.zone_radius_km` stores it, held by a `CHECK` to those
  values. `zone_whole_belgium` stores « Toute la Belgique », with the radius held at 0 by a
  second `CHECK`. A new profile starts at 0 km, and migration 0027 gave every existing profile
  0 km. Each save of her zone also writes `professional_reach`: every commune whose centre is
  within her radius of the centre of one of hers, her own included, computed on the server by
  `reachOf` (`src/lib/professionnelle/reach.ts`, over `communesWithin`). « Toute la Belgique »
  writes no row. The communes, the radius and the reach save in one batch, and an error on
  either field keeps all three as they were. The radius reopens no review. The founders' file
  page and account page show it. Nothing reads the reach yet: `zone-rayon-lecture` does.
- **The professions:** sage-femme, infirmière en néonatologie and puéricultrice upload their
  diploma. The two student years, « Étudiante sage-femme, 3e année » and « 4e année », come last
  and upload the attendance certificate. Migration 0015 renamed the old single student value to
  the third year. The INAMI field shows for midwives and nurses and is optional: an empty field
  never blocks step 3, a filled one needs eleven digits, and the founders' page reads
  « INAMI non renseigné » when it is empty.
- **Her trainings:** « Formations complémentaires » is one optional free-text field of 300
  characters at most, in her own words: hundreds of trainings exist. It shows on her public page,
  on the full profile a family reads and on the founders' file page. Step 2 asks for no
  experience: migration 0016 dropped the band and the specialisations list.
- **A step that blocks (onboarding-retour-1):** when « Continuer » refuses a step, each blocking
  field shows a red border, or a red outline for a group of radios or a checkbox, and its
  message in red under it. A line above the buttons counts the blocking fields. The page
  scrolls to the first one and gives it focus. The pieces are `FieldError`, `BlockingCount` and
  `useFocusFirstBlocking` in `src/components/auth/field.tsx`. The family's profile form uses
  them too. The red is `destructive`, which points at the dialogs' darkened red.
- **The students switch (D-7)** is `etudiantes_admises` in `app_settings`, flipped on
  `/admin/dossiers`. It offers or hides the two student years together.
- **The declarations and the charter:** step 4 shows six declarations, then « Charte des
  professionnelles Berceo » in full and its own checkbox. Sending the file needs the seven
  ticks, and stores seven rows in `professional_declarations`, each with the version and the
  moment. The version is `DECLARATIONS_VERSION` in `rules.ts`, `feedback-2026-10-23` since
  feedback round 1. A submitted file (`en_attente`, `complement_demande` or `valide`) whose last
  acceptance carries an older version accepts the new set at `/espace/professionnelle/declarations`
  before any other page of her space opens: `requireAccess` sends her there. Her status and her
  place in the queue stay. « Mon dossier » and the founders' file page read each row in the words
  of its version (`src/lib/professionnelle/wording.ts`). The charter's text is
  `src/content/charte.ts`, also public and indexed at `/charte-des-professionnelles`.

## The founders' verification

- **The queue:** `/admin/dossiers` lists "Dossiers en attente de vérification", every `en_attente`
  and `complement_demande` file of an account that is not suspended, oldest `submitted_at` first,
  then the students switch. `/admin/dossiers/[id]` shows one file whole (documents embedded through
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
  `src/lib/admin/journal.ts` (the decisions, the students switch, the purge, and the back-office's
  acts below, the founder's refund included); its column list is written once, and
  `journal-isolation.test.ts` fails on an `insert into admin_journal` anywhere else. The module
  has no update or delete, and the database refuses both.
- **The purge (D-41, D-55):** `/api/cron/purge-dossiers-refuses`, scheduled daily in
  `vercel.json`, deletes every file (documents and photo) of a profile refused more than 30 days
  ago, and any file a deleted account still holds, from the bucket and `professional_documents`,
  and journals "Documents supprimés". It answers
  404 without `Authorization: Bearer <CRON_SECRET>`. Vercel runs cron jobs on production only; on
  uat.berceo.be the route is called by hand with the environment's `CRON_SECRET`.

## The back-office

- **Navigation (D-132):** every `/admin` page goes through `AdminShell`
  (`src/components/admin/admin-shell.tsx`): « Vue d'ensemble », Dossiers, Utilisateurs, Demandes,
  Réservations, Signalements, Paiements, Crédits, Abonnements, Avis, Journal. All 404 to anyone but an
  admin (D-33).
  `/admin/absences` redirects permanently to `/admin/signalements`.
- **« Vue d'ensemble » (D-133):** `/admin`, the guide's four blocks and a fifth, each a number
  and a link: the verification queue, `/admin/reservations?etat=en-cours` (confirmed gardes not
  ended), `/admin/signalements` (cancelled gardes and absences not marked handled),
  `/admin/paiements?periode=7j` (fees paid in the last 7 days) and
  `/admin/abonnements?statut=actifs` (the active subscriptions, abonnements-back-office), and a
  sixth, `/admin/credits` (the credits that can still pay, and their total, annulations-back-office). Each
  number is counted with the same exported condition its list filters on
  (`src/lib/admin/lists.ts`, `paymentCountSince` in `src/lib/paiements/payments.ts`,
  `subscriptionListCondition` in `src/lib/abonnements/subscriptions.ts`). The payments block adds
  « {n} frais à rembourser », linking to `/admin/paiements?statut=a-rembourser`, only when a
  professional's cancellation made before the founders' table left a fee unrefunded
  (`awaitingRefundCount`, D-164).
- **Accounts:** `/admin/utilisateurs` searches first name, last name, full name and e-mail
  (case and accents folded) and the phone by its digits in any notation; a deleted account is
  never found. `/admin/utilisateurs/[id]` shows the account (a family's commune, never her
  address), its activity with links to the lists filtered on it, its gardes still standing, the
  actions and its journal. `src/lib/admin/accounts.ts` holds the reads and the acts.
- **Suspending (D-134):** one batch: the account marked suspended, her waiting answers
  `retiree`, her open requests `annulee` and the answers on them `non_retenue` (each professional
  told), the journal entry. Confirmed gardes are left for the founders to handle; the dialog lists
  them. `currentUser()` then returns `suspended`, so nothing opens; the guard sends the session to
  `/connexion/suspendu`, which ends it; sign-in refuses it. Every reader that could show her to
  someone, or put her in front of a new request, answer, booking, rating or e-mail, holds her out
  with `notSuspended()` or reads `suspended()` (`src/lib/auth/suspension.ts`), the one place the
  rule is written: `suspension-isolation.test.ts` refuses `suspended_at` or a condition on
  `suspendedAt` anywhere else but the column's writer (`src/lib/admin/accounts.ts`) and the
  schema (D-169); a Checkout completing after the suspension is
  refunded `reservation_impossible`. Her Neon Auth sessions are deleted from `neon_auth.session`.
- **Reactivating (D-135)** lifts it; nothing withdrawn is restored.
- **Deleting (D-136, D-137):** only a suspended account with no garde ahead, confirmed by typing
  her last name. One batch anonymises the row (« Compte supprimé », `supprime-<id>@invalid`, no
  phone), deletes her family profile, clears her profile's personal fields, her radius, her
  communes, her reach and her nights, deletes her Neon Auth identity (`neon_auth."user"`, whose sessions and accounts
  cascade) and journals it; then her files leave the bucket, leftovers finished by the purge.
  Requests, bookings, payments, conversations and ratings stay under « Compte supprimé ».
- **Contacting (D-138):** a subject and a message sent from `EMAIL_FROM` with Reply-To the
  founder's own e-mail (`contactEmail`), one idempotency key per message; the journal keeps the
  subject only, written once the e-mail left.
- **Lists:** `/admin/demandes` and `/admin/reservations` (filters by state and by account),
  `/admin/signalements` with « Marquer comme traité » (one statement: the marker and the journal
  entry, D-139).
- **Signalements (annulations-back-office):** three filters, « À traiter », « Litige » (every
  garde in litige, handled or not) and « Tous ». Each row shows the reason, or the founders' note
  on a cancellation by Berceo, the delay (the whole hours from the cancellation to the start,
  `hoursBeforeStart`, and « dans le délai » or « hors délai » for the family's cancellation,
  read from the credit that was written then and never from today's setting, `delayVerdict`),
  and what became of the fee (`reportOutcome`), with « Accorder un crédit » where it applies.
- **Cancelling a garde for Berceo (annulations-back-office):** « Annuler la garde » on
  `/admin/reservations` and on an account's gardes, on a confirmed garde until the end of its
  night (`canCancelForBerceo`). The founder writes a note, 1 to 500 characters, which only the
  founders read. One batch (`cancelGardeForBerceo` in `src/lib/gardes/gardes.ts`) records the
  garde against `berceo` (a value of `booking_side`; `BookingSide` stays the two sides), with
  the founder and `cancellation_note`, cancels its request, turns the paid fee into a credit of
  origin `annulation_berceo`, and writes the journal entry `garde_annulee_berceo`. Both sides
  read « Annulée par Berceo » and get one e-mail each, without the note. The family can
  republish while the night has not started.
- **Words:** `src/content/admin.ts` (the guide's « Le backoffice » lines verbatim), the suspended
  message in `src/content/comptes.ts`, the contact frame in `src/content/emails.ts`.

## The vitrine

- **The deck's screens (JAM-327).** The site follows Surya's deck `Direction artistique
  web.pdf`. The public header is its slide 19: the white logomark, « Accueil », « Histoire »,
  « Nos gardes de nuit », « Contact » in white capitals and one account icon, which opens
  `/connexion`. It lies on the home's photograph and on a sage band on every other page
  (`header-frame.tsx`). « Tarifs » and « FAQ » are in the footer. The home's hero is the
  photograph and the white logotype alone. The first block on the stripes carries the page's
  H1 and the family's button to `/inscription-famille`. The link « Se connecter » of round 2
  is under it. The professional's door is the button of « Notre histoire » and the home's last
  band. An inner page opens with the banner of slide 10 (`page-header.tsx`). The two legal
  placeholders follow slide 29. `/design-system` shows one specimen for each slide.
- **The deck's words.** A text quoted from the deck is Surya's: it carries a comment that
  names its slide and no `@relecture`. The deck's « diplômées » stays in these texts (Jamie,
  2026-11-19: D-7 is set aside for them). Its ellipsis and its two spelling errors do not.
- **Testimonials.** `testimonial-card.tsx` is the card of slide 27. It shows on
  `/design-system` only, with the deck's sample marked « Exemple ». No public page shows a
  testimonial before the founders supply a real one.
- **Reassurance is the manual verification**, never insurance (D-8), bar the fee sentence on « Tarifs » (Jamie, 2026-10-29).
- **Prices**: the four family subscriptions of the devis (Découverte, 1 mois, 24,90 € ·
  Parenthèse, 3 mois, 59,90 € · Sérénité, 6 mois, 94,90 € · Premium, 12 mois, 159,90 €) in
  `src/content/abonnements.ts`, the professional's night rate from 130 € with no ceiling and her
  rate for each extra hour (profil-tarifs), paid to her directly, and the 3 % service fee with its refund rule. The founders' feedback round 1
  supersedes D-3 and D-4.
- **The founders' story**: `/qui-sommes-nous` carries their first-person text of round 2
  (JAM-301), complete, in the layout of slide 26 under the title « Notre histoire »: taupe
  blocks on the stripes. It is indexed and in the sitemap.
- **Placeholders**: the two legal pages wait for the founders' texts. Both are `noindex` and
  out of the sitemap; lifting that is part of the change that brings the text.
- **The sleep consultation (JAM-305, JAM-352):** `/consultation-sommeil` presents the consultation
  with the two founders. The address of their calendar is the environment variable
  `SLEEP_CONSULTATION_URL` (`src/lib/consultation-sommeil/config.ts`), never in git. Where the
  variable is empty or is not an `https://` address, the page answers 404, and the footer, the
  family's home and the sitemap do not name it. The calendar shows in the page, in a plain
  `<iframe>`, only after the visitor clicks « Choisir un créneau » (`calendar-embed.tsx`): before
  the click the page sends nothing to Calendly, and a sentence under the button says that the
  calendar is a service of Calendly. The page loads no script and no stylesheet of Calendly.
  `canEmbed` (`src/lib/consultation-sommeil/embed.ts`) frames the calendar only where its origin
  is exactly `https://calendly.com`; for a different host, and with no JavaScript, the button is
  a plain link in the same tab. `embedAddress` adds `embed_domain` and `embed_type=Inline`, so
  that Calendly posts a message to the page when a booking is made. `isBookingMessage` accepts
  that message only from the origin `https://calendly.com`, reads its event name only, and never
  its payload; the page then shows « Votre rendez-vous est enregistré » above the frame. If no
  message comes, the visitor sees Calendly's own confirmation in the frame. There is no
  confirmation page and no redirect from Calendly. The page shows no price and takes no payment.
  Where the consultation page exists, `/confidentialite` names Calendly as the recipient of the
  booking data (`src/content/legal.ts`). Words in `src/content/consultation-sommeil.ts`.
  `.icm/setup/sleep-consultation-url.md` has the setup act.
- **The security headers (JAM-360):** `next.config.ts` sends three headers on each path
  (`/:path*`). The Content-Security-Policy is
  `frame-src 'self' https://calendly.com; frame-ancestors 'self'; object-src 'self'; base-uri 'self'`:
  the site frames only itself and the calendar of the sleep consultation, and a different origin
  cannot frame the site. `object-src` is `'self'` and not `'none'` because the founders' dossier
  page shows a professional's PDF in an `<object>` from `/api/fichiers/[id]`
  (`src/components/admin/document-view.tsx`). The policy has no `default-src`, `script-src`,
  `style-src`, `connect-src` and no `form-action`: a script policy needs nonces, and
  `form-action` can break the redirect to Stripe Checkout. The two other headers are
  `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.
  Vercel sets HSTS. `src/app/security-headers.test.ts` holds the values.
- **Contact is a form, and no address is published.** `/contact` has three required fields
  (name, e-mail address, message of 2,000 characters at most). `sendContact`
  (`src/lib/contact/send.ts`) sends one e-mail through Resend to the address of the
  environment variable `CONTACT_EMAIL`, with the writer's address in `Reply-To`. Nothing is
  stored. A hidden trap field keeps robots out. Where `CONTACT_EMAIL` is empty, the page
  answers 404, and the header, the footer and the sitemap do not name it. One visitor
  sends 5 messages for each hour at most (JAM-341, `src/lib/contact/rate-limit.ts`): the sixth is
  refused with one sentence, and no e-mail leaves. The counter is one row of `app_settings`,
  written by one atomic statement of `src/lib/settings/`. Its key is an HMAC-SHA-256 of the
  visitor's address (the first entry of `x-forwarded-for`), keyed with `NEON_AUTH_COOKIE_SECRET`
  and a label of its own: the address is never stored or logged. A row lives for one hour at
  most, and each read removes the rows whose hour is over. With no address or no secret, all
  visitors share one counter. If the counter cannot be read, no e-mail leaves.
  `.icm/setup/contact-email.md` has the setup act.
- **Indexed on production only.** See AGENTS.md if that needs reversing.

## Notes

- [.icm/docs/](.icm/docs/) holds the research and the client's cahier des charges.
- Brand masters live in Drive. **Do not commit archives** — `.gitignore` blocks `*.zip`
  after a 58MB pack had to be purged from history.
