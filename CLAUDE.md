# Berceo — app

The platform for Berceo, a Belgian two-sided marketplace connecting parents of newborns with
professionals who take overnight post-partum care shifts (*gardes de nuit*). In French: the
public site (the vitrine), accounts and the signed-in spaces, built increment by increment on
`main`, tested on UAT (`uat.berceo.be`) and promoted to production as a batch. The work pipeline
is the BAXTER blueprint (`.icm/_system/`, version in `.icm/_system/VERSION`, answers in
`.icm/.copier-answers.yml`). This file is identity and routing only.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Drizzle on Neon Postgres,
deployed on Vercel. The package is still named `berceo-shell`.

The vitrine is public. Production is indexable, carries an OG card, and is the first thing
anyone who hears the brand name will find. Only production: [`src/app/robots.ts`](src/app/robots.ts)
allows crawling when `VERCEL_ENV` is `production` and refuses every crawler on UAT and the
previews. If Berceo wants the brand kept quiet until launch, make `isIndexable` in
[`src/app/site.ts`](src/app/site.ts) false; it is a one-line change.

## Routing

@.icm/_system/ROUTER.md

The router has the commands, the stages and the lanes. A ticket is a Linear key of the team
`JAM`. The files below belong to this repo.

| You are asked to | Go to |
|---|---|
| answer a question about the build, or review | read and answer. No ticket, no branch, no pull request |
| read a decision, the epics or the backlog of before 2026-11-18 | `.icm/intake/README.md`, and `.icm/local/ROUTES.md` for the markdown stubs |
| read where the build runs | `.icm/environments.md`, the one home of the addresses |
| read the UAT batch, record the client's sign-off, promote, roll back | `.icm/_system/features/uat.md`, then `.icm/_system/scripts/promote.sh` |
| change the database, read which database a deployment reads, or migrate production | `.icm/local/database.md`, then `.icm/local/vercel-build.sh` and `.github/workflows/migrate-production.yml` |
| do a setup act in Vercel, GitHub or Neon | `.icm/setup/`: one file for each act. A person ticks its boxes |
| change what CI checks or how a release is cut | the blueprint. `ci.yml`, `promote.yml` and `icm.yml` come from it |
| change a file below `.icm/_system/` | the blueprint, then an update of this repo. Never edit the folder here |

| The task | Go to |
|---|---|
| Change any word on the site | [`src/content/`](src/content/) — one file per surface, keyed by locale; README → The content catalogue |
| The vitrine's pages | [`src/app/(public)/`](src/app/(public)/) — `/`, `/comment-ca-marche` and `/comment-ca-marche/professionnelles` (one page per side), `/tarifs`, `/faq`, `/qui-sommes-nous` (the founders' story), `/charte-des-professionnelles` (the charter, `src/content/charte.ts`), and the placeholders `/conditions-generales`, `/confidentialite` (noindex until their texts arrive); blocks in [`src/components/vitrine/`](src/components/vitrine/) |
| Page titles, descriptions, OG tags | each page's `meta` in its catalogue file, built by [`src/app/(public)/page-metadata.ts`](src/app/(public)/page-metadata.ts); `vitrine.test.ts` holds them to 50–60 and 140–160 characters |
| Sitemap, robots, the production URL | [`src/app/sitemap.ts`](src/app/sitemap.ts), [`src/app/robots.ts`](src/app/robots.ts), [`src/app/site.ts`](src/app/site.ts) |
| Photographs, the OG card | [`public/photos/`](public/photos/) (WebP, alt texts in `src/content/photos.ts`), [`public/og.png`](public/og.png) |
| Colour, type scale, radii, stripes | [`src/app/globals.css`](src/app/globals.css) — the DA's tokens, the only file holding a colour |
| Fonts | [`src/app/fonts.ts`](src/app/fonts.ts) — the one file that names a typeface (Fraunces stands in for Comodo) |
| Root metadata, the light root layout | [`src/app/layout.tsx`](src/app/layout.tsx) — `metadataBase` is production |
| See every token and component | `/design-system` ([`src/app/(public)/design-system/`](src/app/(public)/design-system/)) and `/design-system/portail` — noindex |
| Header, footer, portal shell | [`src/components/shell/`](src/components/shell/) |
| The health endpoint | [`src/app/api/health/route.ts`](src/app/api/health/route.ts) |
| The logo marks | [`src/components/berceo-logo.tsx`](src/components/berceo-logo.tsx) — inlined, `currentColor` |
| Brand artwork | [`public/logos/`](public/logos/) — SVG is what the site uses; PNG for raster; `.ai` is the source |
| The data model | [`src/db/schema.ts`](src/db/schema.ts) — Drizzle: `users` (persona, joined to Neon Auth by `auth_user_id`), the `user_consents` ledger, `family_profiles` (commune, private address), the professional's file (`professional_*`, her availability included), `care_requests`, `care_request_applications`, `bookings` (with the garde's status and cancellation), `payments`, `subscriptions`, `conversations` and `messages`, `ratings` and `rating_invitations`, `favourites`, `credits` (a family's Berceo credits), `app_settings` and the append-only `admin_journal`; an account's suspension and deletion on `users`; `db` client in `src/db/index.ts` |
| Accounts, sign-in, roles, e-mail | [`src/lib/auth/`](src/lib/auth/) and [`src/lib/email/`](src/lib/email/); pages in `src/app/(auth)/`, spaces in `src/app/(portail)/`; README → Accounts and e-mail |
| The family's profile, the commune list | [`src/lib/famille/`](src/lib/famille/) (the only reader of the address), [`src/lib/communes/`](src/lib/communes/) (generated by `scripts/communes/generate.py`); page in `src/app/(portail)/espace/famille/profil/`; README → The family's profile |
| The founders' verification queue, the admin journal, the purge of refused files | [`src/lib/admin/`](src/lib/admin/) (rules, `journal.ts`, `review.ts`, `purge.ts`), [`src/components/admin/`](src/components/admin/); pages in `src/app/(portail)/admin/`, the purge at `src/app/api/cron/` (scheduled in `vercel.json`); README → The founders' verification |
| The back-office: « Vue d'ensemble », the account search, suspending, reactivating, deleting and contacting an account, the lists of requests, bookings and reports, granting a credit of the fee and cancelling a garde for Berceo | [`src/lib/admin/`](src/lib/admin/) (`accounts.ts`, `lists.ts`, `paths.ts`, rules), [`src/lib/auth/suspension.ts`](src/lib/auth/suspension.ts) (the predicate every reader holds a suspended account out with, the only place the rule is written; `suspension-isolation.test.ts`), [`src/components/admin/`](src/components/admin/) (`admin-shell.tsx`, the navigation); pages in `src/app/(portail)/admin/` (`utilisateurs/`, `demandes/`, `reservations/`, `signalements/`); README → The back-office |
| Care requests: publish, edit, cancel, the professional's list, the urgent e-mail and the daily digest | [`src/lib/demandes/`](src/lib/demandes/) (rules, the only reads and writes of `care_requests`), [`src/app/api/cron/demandes-digest/`](src/app/api/cron/demandes-digest/) scheduled by `.github/workflows/demandes-digest.yml`; pages in `src/app/(portail)/espace/famille/demandes/` and `espace/professionnelle/demandes/`; README → The care request |
| Answering a request, the booking, the family's view of a professional's profile, the priority request, republishing | [`src/lib/reservations/`](src/lib/reservations/) (rules, `answers.ts`, `bookings.ts`: answers and bookings; cancelling a request in `src/lib/demandes/` declines its waiting answers), [`src/components/reservations/`](src/components/reservations/); pages in `src/app/(portail)/espace/famille/demandes/[id]`, `espace/famille/professionnelles/`, `espace/famille/reservations/`, `espace/professionnelle/demandes/` and `espace/professionnelle/gardes/`; README → The answer and the booking |
| The garde's life: its state by the clock, cancelling by either side and reporting an absence with the founders' table (a credit, the fee kept, or a litige), contesting an absence, republishing, the reminder of the day before, the founders' list of absences | [`src/lib/gardes/`](src/lib/gardes/) (rules, `gardes.ts`: the only writes of a booking's status columns; the request side through `src/lib/demandes/`), [`src/components/gardes/`](src/components/gardes/), [`src/app/api/cron/gardes-rappel/`](src/app/api/cron/gardes-rappel/) scheduled by `.github/workflows/gardes-rappel.yml`; actions beside `espace/famille/reservations/` and `espace/professionnelle/gardes/`, the list in `src/app/(portail)/admin/absences/`; README → The garde's life |
| The ratings after a garde: the two rating forms, the note and gardes count on profiles, answer cards, request cards and homes, the invitation e-mail, the founders' list | [`src/lib/avis/`](src/lib/avis/) (rules, `ratings.ts`: the only reads and writes of `ratings` and `rating_invitations`; the garde's state read from `src/lib/gardes/`), [`src/components/avis/`](src/components/avis/), [`src/app/api/cron/avis-invitations/`](src/app/api/cron/avis-invitations/) scheduled by `.github/workflows/avis-invitations.yml`; pages in `espace/famille/reservations/[id]/avis/`, `espace/professionnelle/gardes/[id]/avis/` and `src/app/(portail)/admin/avis/`; README → The ratings |
| The search by commune, the public professional and commune pages, the sitemap's dynamic part, the way back through sign-up | [`src/lib/recherche/`](src/lib/recherche/) (rules, slugs, `professionals.ts`: the only reads, a column whitelist, `valide` only), [`src/components/recherche/`](src/components/recherche/), `src/lib/auth/retour.ts`; pages in `src/app/(portail)/espace/famille/recherche/`, `src/app/(public)/professionnelles/[slug]/`, `src/app/(public)/garde-de-nuit/[commune]/`, `src/app/sitemap.ts`; README → The search and the public pages |
| The conversation per answer: « Messages », Berceo's two messages, read state and the unread count, the new-message e-mail, closing after the night | [`src/lib/messagerie/`](src/lib/messagerie/) (rules, `conversations.ts`: the only reads and writes of `conversations` and `messages`; the answer and the booking call it inside their own statements), [`src/components/messagerie/`](src/components/messagerie/); pages in `src/app/(portail)/espace/famille/messages/` and `espace/professionnelle/messages/`; README → The conversation |
| The professional's indicative availability: « Mes disponibilités » and the « Prochaines disponibilités » block | [`src/lib/disponibilites/`](src/lib/disponibilites/) (rules, the only reads and writes of `professional_availability`; nothing about a care request reads it), [`src/components/disponibilites/`](src/components/disponibilites/); page in `src/app/(portail)/espace/professionnelle/disponibilites/`; README → The professional's availability |
| The 3 % service fee: the Checkout, the booking made by the payment, refunds, the founders' list of fees | [`src/lib/paiements/`](src/lib/paiements/) (rules, `payments.ts`: the reads and writes of `payments`, bar the booking link `acceptAnswer` writes in its own transaction, and the fee's calls to Stripe; `stripe.ts`: the one Stripe client), [`src/app/api/webhooks/stripe/`](src/app/api/webhooks/stripe/); the return and abandon routes in `src/app/(portail)/espace/famille/reservations/paiement/`, the list in `src/app/(portail)/admin/paiements/`; README → The service fee |
| The four family subscriptions: the plans, the Checkout in subscription mode, the row the webhook keeps true, `hasActiveSubscription`, and `familyMay`, the one gate of what a subscription opens; Stripe's customer portal, the failed renewal's e-mail and its warning; the founders' list of subscriptions; the one-night plan at 14,75 € (`night_passes`) and the promotion codes of « Codes promo » (`promo-codes.ts`, JAM-304) | [`src/lib/abonnements/`](src/lib/abonnements/) (rules, `subscriptions.ts`: the only reads and writes of `subscriptions` and `users.stripe_customer_id`, and the subscriptions' calls to Stripe; `notify.ts`: the failed renewal's e-mail), the webhook route it shares with the fee, [`src/components/abonnements/`](src/components/abonnements/) (the invitation line); pages in `src/app/(portail)/espace/famille/abonnement/` (and `retour/`, `portail/`), the list in `src/app/(portail)/admin/abonnements/`; README → The subscriptions |
| A family's favourite professionals: the mark « mes professionnelles » on the full profile and the search card, and the list « Mes professionnelles », her favourites then the professionals of her past gardes | [`src/lib/favoris/`](src/lib/favoris/) (`favourites.ts`: the only reads and writes of `favourites`; `rules.ts`: the list's order and dedupe; `isolation.test.ts`), [`src/components/favoris/`](src/components/favoris/); the page and the action in `src/app/(portail)/espace/famille/professionnelles/`; README → The favourites |
| A family's Berceo credits: the ledger, a credit's state and remainder by the clock, her balance, and the block « Mes crédits » on her home and on « Mes réservations »; the founders' list « Crédits » and the credit they grant by hand | [`src/lib/credits/`](src/lib/credits/) (`credits.ts`: the only reads and writes of `credits`; `rules.ts`: the expiry, the state, the balance and the spending plan; `isolation.test.ts`), [`src/components/credits/`](src/components/credits/); words in `src/content/credits.ts`; README → The credits |
| The professional's onboarding and documents | [`src/lib/professionnelle/`](src/lib/professionnelle/) (rules, `uploads.ts`: the only insert of a file, under the profile's lock; `removals.ts`: her removals, object before row), [`src/lib/documents/`](src/lib/documents/) (private bucket, `/api/fichiers/[id]`); pages in `src/app/(portail)/espace/professionnelle/`; README → The professional's onboarding |
| A schema change | edit the schema, `npm run db:generate -- --name <what>`, commit `drizzle/` |
| shadcn components | [`src/components/ui/`](src/components/ui/) — retuned to the DA; red and green for confirm, cancel and refuse (JAM-300), and red for form errors through `destructive` (`src/components/auth/field.tsx`: `FieldError`, `BlockingCount`, `useFocusFirstBlocking`) |
| The research behind the engagement | [`.icm/docs/`](.icm/docs/) — `REPORT.md`, `cahier-des-charges.md`, `QUESTIONS.md` |


## Rules

- Client-facing text in `fr-BE`; code, commits and notes in English.
- Technical text (pull request bodies, commits, questions) in Simplified Technical
  English: short active sentences, one instruction each, no semicolons. A question for Jamie
  is numbered and carries a default answer.
- CI is truth: never run build, lint, typecheck, test, format or dev locally. Push, then read
  the `ci` run and the Vercel preview.
- Secrets never in git: names only, values in GitHub or Vercel settings. Flag any plaintext
  credential found.
- One ticket is one run, one branch and one pull request.
- `main` changes by pull request. Gates are human checkboxes: read them, never tick them.
  Jamie ticks Ready to merge. The Release stage merges.
- A ticket's merge reaches the UAT environment, where the client tests the batch. The merge of
  the release pull request makes the release tag and moves nothing. Production moves only on
  Jamie's word, after the client's sign-off (`.icm/_system/features/uat.md`).
- The workflow `promote` does not migrate production. A release with a migration needs
  `migrate-production.yml` before `promote.sh run` (`.icm/local/database.md`).
- Linear: a ticket is a key of the team `JAM`. A session in this repo does not write to Linear
  (`linear_writes: false`), and no workflow moves a ticket (`linear_states: false`). A person
  or BAXTER moves the states.
- Never invent a commercial term. Rates, scope, launch dates and contact addresses come from
  Jamie or from `.icm/docs/`. Berceo has no published email or domain yet; a blank is the
  correct state until it does. The vitrine deliberately shows no contact for exactly this reason.
- The platform is light, per Surya's web DA (`Direction artistique web.pdf`). Only the charter
  palette: white, sage, taupe, pearl, butter yellow, the stripes; text in the charter's sage and
  taupe, below AA by the client's decision until after launch (JAM-300, which replaces
  finition-accueil D-1 and skips `src/app/contrast.test.ts`; `.icm/intake/README.md`). Comodo
  in capitals for H1, H2 and the navigation (Fraunces until delivered, JAM-308), Nunito for the
  rest; capsule buttons, 32 px cards, filled rounded icons, no numbered badges. No shadow, no
  gendered pink or blue, no naïve illustration, no gadget animation; the DA's red #ED5957 and
  green #B6D3C6 only for confirm, cancel and refuse, and red for a field that blocks a form
  (JAM-300 replaces D-24). No DA change without Surya's written approval. There is no dark
  theme and no toggle.
- Every word follows Surya's guide (D-19). Vouvoiement; no `!`, `…` or `—`; no insurance
  wording (D-8; the one exception is the fee sentence on « Tarifs », Jamie, 2026-10-29), no Facebook group (D-23), no price but the four subscriptions, the one-night plan at 14,75 € (feedback round 2, JAM-304), 130 € and 3 % (feedback round 1), no blanket
  « diplômées » (D-7); `@relecture` on anything not quoted from the guide.
  `src/content/vitrine.test.ts` enforces the mechanical part.
- Never commit archives or binaries over a few MB. `.gitignore` blocks `*.zip` and friends.
  Brand masters live in Drive.
