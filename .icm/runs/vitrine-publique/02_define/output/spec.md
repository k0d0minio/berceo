# Spec: The public site, replacing the holding page

- slug: vitrine-publique
- personas: parent, professionnel
- touches: src/app/(public)/**, src/app/(holding)/**, src/app/layout.tsx, src/app/sitemap.ts, src/app/robots.ts, src/app/fonts.ts, src/app/theme-color.ts, src/app/globals.css, src/content/**, src/components/vitrine/**, public/og.png, public/photos/**, README.md, AGENTS.md
- complexity: standard

## Problem

A visitor who hears the name Berceo finds one dark screen saying the site is being built. Nothing
explains the service, nothing reassures a family about to let a stranger into their home at night,
and nothing sends a family and a professional to their two separate doors. The header and footer
that `socle-design-system` shipped already link to the vitrine's pages, and those links return 404.
This advances Plateforme Berceo V1 (a first usable version on uat.berceo.be before December 2026,
for a launch in January 2027): the vitrine is the first thing the founders can show and the page
every later sign-up starts from.

## Proposed change

The pages of Surya's URL map, built on the light design system `socle-design-system` shipped
(tokens, `Button`, `Card`, `StripedSection`, `TranslucentBlock`, the `(public)` layout with
`PublicHeader` and `PublicFooter`), with every word in the content catalogue (D-19).

**Where the words live (D-19).** One catalogue file per page under `src/content/`
(`accueil.ts`, `comment-ca-marche.ts`, `tarifs.ts`, `faq.ts`, `qui-sommes-nous.ts`, `legal.ts`),
each declared with `catalogue()` from `locale.ts`, French only. Each page's title and meta
description sit in its own file. Page names and URLs keep coming from `common.pages`. Any entry the
guide does not give word for word carries `@relecture Surya — <why>`, as README.md describes.
Writing rules on every line: vouvoiement, no exclamation mark, no em dash, no ellipsis, the guide's
validated lexicon, no e-commerce words.

**Wording rules that hold on every page.**

- **Who the professionals are (D-7).** The network is "professionnelles de santé vérifiées par
  Berceo", and the professions are named: sage-femme, infirmière en néonatologie, puéricultrice.
  "Diplômée" appears only next to a named profession (for example "sages-femmes et puéricultrices
  diplômées"), never as a blanket word for the whole network. Students are not mentioned while the
  founders' switch is off. Each such entry is tagged `@relecture Surya — formulation étudiantes (D-7)`.
  `common.professionnelles` is the reference sentence.
- **No insurance (D-8).** No page says "assurance", "assuré·e", "couvert·e" or "cette réservation
  est couverte". The guide's lines that pair verification with insurance (the reassurance
  hierarchy, the home page's "vérification des diplômes ou assurance", the Comment ça marche meta,
  the Tarifs fee sentence) are rewritten without the insurance half. The reassurance line is the
  manual verification: "Aucun profil n'est visible avant vérification manuelle par l'équipe Berceo."
- **No Facebook group (D-23)**, on any page. "Une communauté en ligne" is the only allowed
  reference.
- **Prices (D-3, D-4, D-2).** The only numbers are the night-rate range (100 to 300 €, set by each
  professional) and the 3 % service fee. No subscription, formula, tier name (Découverte,
  Parenthèse, Sérénité, Premium) or other price anywhere.
- **Calls to action (D-25).** The family CTA reads "Trouver votre gardienne de la nuit"
  (`common.cta.trouverGardienne`) only where the text directly above has said these are health
  professionals. Everywhere else it reads "Trouver une professionnelle"
  (`common.cta.trouverProfessionnelle`). The professional CTA is "Rejoindre le réseau" (the guide's
  recommendation, added to `common.cta`). "Gardiennes de la nuit" may appear in storytelling text
  or a heading, never as a navigation label. The family CTA links to `/inscription-famille` and the
  professional CTA to `/inscription-professionnelle` (`common.pages`).

**Pages.**

1. **Accueil `/`** (replaces the holding page).
   - H1: the guide's example with "diplômées" replaced so it stays true for students (D-7): "La
     première plateforme belge de garde de nuit par des professionnelles de santé vérifiées."
     Tagged `@relecture`. It is fully visible without scrolling at 360×640 and at 1280×720, with
     the header above it.
   - The first block answers "Est-ce fait pour moi ?": the guide's main message without the
     blanket "diplômées" ("Des professionnelles de santé veillent sur votre bébé cette nuit pour
     que vous puissiez enfin dormir.", tagged `@relecture`) and the two calls to action, visually
     distinct: family as the primary capsule, professional as the secondary.
   - One reassurance element in the first third of the page: the manual verification line.
   - 2 to 4 H2, from the guide's examples: "Comment ça marche" (the family's three steps in
     short, linking to `/comment-ca-marche`), "Qui sont les Gardiennes de la nuit ?" (the named
     professions and what they know how to do, per the guide's "Savoir" value), "Pourquoi Berceo ?"
     (verification, qualification, transparent profiles, the address shared only after
     confirmation (D-15), stars left by both sides after the garde (D-18)). A short
     professional-facing band ends on "Rejoindre le réseau".
   - Internal links from this page to `/comment-ca-marche`, `/tarifs`, `/inscription-famille`,
     `/inscription-professionnelle`.
   - At least 300 words of text (the guide's minimum for a vitrine page).
2. **Comment ça marche `/comment-ca-marche`.**
   - H1 carries the page's main keyword ("comment trouver une garde de nuit").
   - Two journeys of three steps each, one title plus one or two sentences per step. Family:
     "Publiez votre demande", "Choisissez votre professionnelle", "Dormez enfin". Professional:
     "Créez votre profil", "Faites vérifier votre dossier", "Choisissez vos gardes". The second
     professional step replaces the guide's "Validez votre diplôme" so it stays true for students
     (D-7) and is tagged `@relecture`.
   - A "Ce que garantit Berceo" block: manual verification before any profile is visible; health
     professionals, not baby-sitters; transparent profiles (photo, first name, profession, zone,
     experience, rating); the family's address shared only once the booking is confirmed (D-15);
     the professional stays independent and is paid directly by the family (D-1). No insurance
     line (D-8).
   - Links to both sign-ups.
3. **Tarifs `/tarifs`.**
   - Each professional sets her own night rate between 100 and 300 € (D-4); the family sees it on
     her profile before choosing.
   - The family pays the professional directly for the night; Berceo is an intermediary and never
     handles that money (D-1).
   - A 3 % service fee on the night rate, charged when the family confirms a booking; refunded in
     full if the professional cancels; kept if the family cancels (D-2). The guide's fee sentence
     is kept without "Ils couvrent l'assurance": the fee covers "le bon fonctionnement de la
     plateforme".
   - No subscription: creating an account is free and opens the full profiles (D-3).
   - A family CTA and a link to the FAQ.
4. **FAQ `/faq`.**
   - Questions as H3, answers of 2 to 5 sentences (the guide's format), grouped under at most four
     H2: families, professionals, verification and safety, prices. The questions cover at least:
     who the professionals are; how Berceo checks them (manual review of the diploma or
     certificate and the sworn declarations, D-5 and D-6; no promise of a delay other than the
     guide's "24 heures ouvrables" for a professional's file, D-21); what a garde is (a night at
     home, standard length 11 hours, D-20); how a family finds a professional (publish a request,
     professionals of the commune answer, the family picks, D-10); when the address is shared
     (D-15); how payment works (D-1, D-2); what happens on a cancellation (the fee rule of D-2
     only, no time window); ratings (stars, both sides, D-18); what Berceo does not do (no
     medical care for a child with a particular condition, the request's checkbox, D-20); how a
     professional joins and whether she stays independent.
   - Answers link to `/tarifs`, `/comment-ca-marche` and the sign-ups where relevant.
   - Every question and answer is ours, written in the guide's rules, and tagged `@relecture`.
     No answer states a term the sources do not give (AGENTS.md: never invent a commercial term).
     A dispute is "contactez l'équipe Berceo" with no address (D-17; Berceo has no published
     address yet).
5. **Qui sommes-nous `/qui-sommes-nous`** (placeholder, operator decision in Define).
   - The page exists with its H1, title and meta, and one short block saying the founders'
     story arrives soon, plus the guide's soft closing CTA "Vous aussi, faites confiance à
     Berceo." leading to `/inscription-famille`.
   - No narrative is written until Alix and Jordane deliver their first-person text (D-23).
   - `robots: { index: false }` and absent from the sitemap until the text arrives.
6. **Conditions générales `/conditions-generales`** and **Confidentialité `/confidentialite`**
   (placeholders).
   - Each has an H1, a title and meta, and one sentence saying the text will be published before
     the platform opens.
   - `robots: { index: false }`, absent from the sitemap.
   - No legal text is drafted.

**Photographs.** The four images of the DA's bank (`.icm/raw/Banque d_image/` 1, 4, 5, 8) are
committed as compressed WebP under `public/photos/` (each under 300 KB, sized for the largest
rendered width) and rendered with `next/image`. The raw PNGs stay out of `public/`. Each image
has an alt text written to the guide's rule (it describes what is seen and its context, one
natural keyword, not a copy of nearby text), tagged `@relecture`. These are generated
close-ups (a sleeping baby's face, hands and feet, a baby's hand holding an adult finger, a teddy
bear on a cot) with no identifiable child. D-20's "no photos of children" governs photos users
upload to the platform, not the brand's own image bank; the operator chose to use them.

**SEO.**

- `metadataBase` is `https://www.berceo.be`.
- Each page has a unique `title` (50 to 60 characters, main keyword first) and a unique meta
  description (140 to 160 characters, main keyword plus one reassurance element or value
  statement), both from its catalogue file. The home page uses the guide's verbatim title
  ("Garde de nuit nourrisson en Belgique | Berceo") and meta. Comment ça marche keeps the
  guide's title, and its meta is rewritten without "assurées" (D-8). Tarifs drops "Abonnements"
  from the guide's title and rewrites its meta without subscriptions (D-3). The others are
  written to the rules and tagged `@relecture`.
- Exactly one H1 per page and 2 to 4 H2.
- Open Graph and Twitter tags on every page: page title and description, `siteName` Berceo,
  `locale` fr_BE, the one shared card.
- **OG card.** `public/og.png` is replaced by a 1200×630 card in the DA: white or sage
  background, the wordmark, the guide's main message. No dark palette.
- **`src/app/sitemap.ts`** lists the indexable pages (`/`, `/comment-ca-marche`, `/tarifs`,
  `/faq`) with absolute URLs on `https://www.berceo.be`. The stubs that add public pages later
  (sign-ups, professional and commune pages) add theirs.
- **`src/app/robots.ts`** allows everything and points at the sitemap when `VERCEL_ENV` is
  `production`. Everywhere else (uat.berceo.be, previews, local) it disallows everything, so the
  UAT copy is never indexed next to production.
- The `/design-system` reference pages stay `noindex` and unlinked.

**The holding page goes.** Delete `src/app/(holding)/` and `src/content/holding.ts`. Delete the
`.nuit` palette and the `souffle`, `halo` and `lever` animations from `globals.css`, `karla` from
`fonts.ts`, and `themeColorNuit` from `theme-color.ts`. Update the comments in
`src/app/layout.tsx` that still name the holding page. The words "Site en construction" are no
longer rendered anywhere.

**Shared page components.** Any block used by more than one page (a CTA pair, a
three-step list, a reassurance band, a FAQ item) lives in `src/components/vitrine/` and takes its
words as props. It holds no literal text and no colour value (socle's token rule).

**README.md and AGENTS.md (at this run's Release, per D-9 and the stub).** The routing tables
change from "one screen" and "holding page" to the vitrine's pages and catalogue files. The
standing rule "The page is committed to dark" is replaced by the light DA rule (D-9, D-24, the
DA's "Ce que l'on veut éviter": no gendered pink or blue, no naïve illustration, no shadow, no
gadget animation). The identity paragraph drops "holding page".

## Acceptance criteria

- [ ] `/`, `/qui-sommes-nous`, `/comment-ca-marche`, `/faq`, `/tarifs`, `/conditions-generales` and `/confidentialite` render inside the public header and footer, in the DA's light look, with no horizontal scroll at 360 px or at 1280 px wide.
- [ ] Every link in the public header and footer resolves to one of these pages, except `/inscription-famille` and `/inscription-professionnelle`, which belong to `comptes-neon-auth`.
- [ ] The H1 on `/` is fully visible without scrolling at a 360×640 viewport and at 1280×720.
- [ ] `/` shows the manual-verification reassurance line in the first third of the page and two visually distinct calls to action: the family one links to `/inscription-famille`, and "Rejoindre le réseau" links to `/inscription-professionnelle`.
- [ ] Each page has exactly one H1 and at most four H2.
- [ ] Every page's `<title>` and meta description are unique across the site. Titles are 50 to 60 characters and descriptions 140 to 160 characters (a unit test over the catalogue checks both).
- [ ] `/comment-ca-marche` shows three family steps, three professional steps and a "Ce que garantit Berceo" block.
- [ ] `/tarifs` states the 100 to 300 € range set by the professional, the 3 % fee charged at confirmation with its refund rule, direct payment to the professional, and a free account with no subscription.
- [ ] `/faq` has question-and-answer pairs with each question as an H3, covering at least the topics listed under Proposed change.
- [ ] `/qui-sommes-nous`, `/conditions-generales` and `/confidentialite` render their placeholder block, carry `noindex`, and are absent from the sitemap.
- [ ] A unit test over the vitrine's catalogue strings (values, not comments) fails if any contains "!", "…" or "—"; the whole words "assurance", "assuré·e·s" or "couvert·e·s" (so "rassurant" passes); "Facebook"; a tier name ("Découverte", "Parenthèse", "Sérénité", "Premium"); or a euro amount other than 100 and 300. "Abonnement" is allowed only in a sentence saying there is none.
- [ ] "Trouver votre gardienne de la nuit" appears only in a block whose heading or text directly above names health professionals. Every other family CTA reads "Trouver une professionnelle" (D-25; checked on review).
- [ ] `grep -rn "Site en construction\|holding" src` returns nothing. `src/app/(holding)/`, `src/content/holding.ts`, the `.nuit` palette, Karla and `themeColorNuit` are gone.
- [ ] The four photographs are WebP under `public/photos/`, each under 300 KB. Each renders through `next/image` with a non-empty alt text from the catalogue. No PNG from `.icm/raw/` is under `public/`.
- [ ] `public/og.png` is a 1200×630 light card. Every page's Open Graph tags carry that page's title and description and the card.
- [ ] `/sitemap.xml` lists exactly `/`, `/comment-ca-marche`, `/tarifs` and `/faq` on `https://www.berceo.be`. `/robots.txt` allows crawling and names the sitemap on production, and disallows everything on UAT and preview deployments.
- [ ] Every catalogue entry not quoted verbatim from the guide carries `@relecture`.
- [ ] Lint, typecheck, tests and the Vercel build are green.

## Out of scope

- The sign-up, sign-in and account pages at `/inscription-famille` and `/inscription-professionnelle`: `comptes-neon-auth` serves them. Until it merges, the two CTAs and the header's account buttons lead to a 404 on UAT, as the header already does today.
- The founders' first-person story on `/qui-sommes-nous` (D-23): a tweak once Alix and Jordane deliver it, which also lifts the `noindex` and adds the page to the sitemap.
- The legal texts (CGU, privacy policy, cookie policy): the founders supply them; a later tweak replaces the placeholders and lifts their `noindex`.
- The per-commune and per-professional public pages (`recherche-et-fiches-publiques`, D-14).
- A blog, a testimonials page, a partners page, a CMS for the vitrine.
- A contact address or form: Berceo has no published address yet (AGENTS.md).
- Swapping Fraunces for Comodo (`socle-design-system` left that to one file once Surya delivers it).
- Raising the DA's text contrast (taupe on white): socle's note for Surya, not changed here.
- Analytics, a cookie banner (no tracker is added, so none is needed).
- Promoting the vitrine to www.berceo.be: that is the UAT promotion, the operator's act after the founders' sign-off.

## Open questions

- none blocking. Two things to settle before promotion to production, not before Build: Surya's review of every `@relecture` entry (the students wording in particular, D-7), and the founders' choice among the four photographs, which only swaps files.
- Context budget: read `origin/uat`'s shipped socle build notes and shell components beyond the Inputs table, to write `touches:` against the tree `socle-design-system` left rather than the stub's guess.
