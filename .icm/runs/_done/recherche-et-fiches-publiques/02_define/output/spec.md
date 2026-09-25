# Spec: Search by commune, and the public teaser pages

- slug: recherche-et-fiches-publiques
- personas: parent, professionnel
- touches: src/lib/recherche/**, src/components/recherche/**, src/content/recherche.ts, src/content/recherche.test.ts, src/app/(portail)/espace/famille/recherche/**, src/app/(portail)/espace/famille/page.tsx, src/components/shell/space-shell.tsx, src/content/portal.ts, src/app/(public)/professionnelles/**, src/app/(public)/garde-de-nuit/**, src/app/sitemap.ts, src/app/(auth)/actions.ts, src/app/(auth)/inscription-famille/**, src/app/(auth)/connexion/**, src/app/(auth)/verification-email/confirmer/**, src/components/auth/**, src/lib/auth/routing.ts, src/lib/auth/routing.test.ts, src/lib/communes/index.ts, src/lib/reservations/profiles.ts, src/app/(portail)/design-system/portail/page.tsx, README.md, AGENTS.md
- complexity: standard

## Problem

A family on Berceo can only publish a request and wait for answers; she cannot look at who serves
her commune before she does. And nobody who searches a professional's name or « garde de nuit
Ixelles » finds Berceo: every profile sits behind a signed-in family account, so the site has
nothing indexable beyond the vitrine. The scope settled both (D-11: search by commune or postcode,
cards, the zone as the only filter; D-14: public, indexable teaser pages per professional and per
commune whose call to action is a free account; D-3: a free account opens the full profile), and
Surya's guide makes the professional pages SEO objective 3 (« Positionner les fiches
professionnelles pour les recherches nominatives »). It is the last stub of the Plateforme Berceo
V1 objective: a first usable version on uat.berceo.be before December 2026, for a launch in
January 2027.

Every dependency has merged: onboarding-professionnelle (the communes a professional serves, by
INS code), disponibilites-indicatives (`nextAvailableNights`), avis-etoiles (`notesOfProfiles`:
the note and the gardes count) and, through it, cycle-de-garde-et-annulation.

## Proposed change

**One reader.** A new server-only module `src/lib/recherche/` holds the only queries this run adds:
the validated professionals serving a set of communes, and the teaser of one validated
professional. Its column list is an explicit whitelist (first name, profession, bio, communes,
profile id, photo id for the signed-in cards only). Never her surname, e-mail, phone, INAMI
number, rate, documents or declarations; a test holds the list. Note and gardes come from
`src/lib/avis/` (`notesOfProfiles`), the next nights from `src/lib/disponibilites/`
(`nextAvailableNights`); the module computes neither. Only profiles whose status is `valide`
exist for it: any other status reads exactly like an unknown one (D-75).

**The order (D-123).** Search results and commune pages list the professionals with at least one
indicative night in the availability window first, the soonest night first; then the others;
ties by first name, then by profile id so the order is stable. No sort control, no filter but the
zone (the guide: « Ne pas proposer de filtres par note, par prix ou par type de profil »).

**The search, signed in (D-11).** `/espace/famille/recherche`, reachable from the family space's
navigation (« Trouver une professionnelle », D-25) and from the family home. The guide's field,
verbatim: label « Votre commune ou code postal », placeholder « Ex : Ixelles, Waterloo, 1000... »
rendered with the guide's three dots (the only ellipsis the guide itself writes; `recherche.test.ts`
allows it on that one entry), button « Rechercher ». The field suggests localities as the family
types, from the same list and combobox as her profile (`src/components/famille/commune-combobox.tsx`,
`searchLocalities`). A search resolves to communes, by INS code:

- a locality picked from the suggestions → its commune;
- a typed four-digit postcode → every commune that postcode covers;
- a typed name that matches exactly one commune (accents and case ignored) → that commune;
- anything else → no search, the line « Nous ne trouvons pas cette commune. Choisissez-la dans
  la liste. » (`@relecture Surya`).

The resolved communes go in the URL (`?commune=<ins>`, repeated when a postcode covers several),
so a result list can be reloaded and shared. Opened without a query, the page pre-fills the
family's own commune from her profile when she has one and shows its results; otherwise the empty
field. The page is noindex.

**The card (the DA's profile card).** Photo (signed-in cards only, the existing
`ProfessionalPhoto`), prénom, profession (`professionLabel`), « Profil vérifié par Berceo », the
zone (the names of the communes she serves, the searched commune first), the note and gardes
count (`NoteDisplay`, its no-note state when there is none), and « Prochaines disponibilités »
(the existing block, with the guide's line « Ces disponibilités sont indicatives. La
professionnelle confirmera lors de l'acceptation de votre demande. » where the block already
carries it). The whole card links to her full profile, `/espace/famille/professionnelles/[id]`,
which already offers « Lui envoyer ma demande en priorité » (D-71). All results show on one page;
there is no pagination.

**No result (D-124).** When no validated professional serves the resolved communes, the guide's
message without its clause on neighbouring zones, which the platform does not do (a request
reaches only the professionals who declared its commune): « Aucune professionnelle n'est
disponible dans cette zone pour le moment. Publiez quand même votre demande, elle sera visible dès
qu'une professionnelle couvrira votre commune. » (`@relecture Surya`), with a button to publish a
request (the existing new-request path). The guide's rule « Ne jamais laisser la famille face à
une impasse sans solution alternative » holds.

**The public professional page (D-14, D-125, D-126).** `/professionnelles/[prenom]-[id8]`, where
`prenom` is her first name lower-cased, accents stripped, non-letters as single hyphens, and `id8`
the first 8 hexadecimal characters of her profile id (the guide's URL is `[prenom-nom]`; D-14
forbids the surname, so the short id makes it unique, D-125). It resolves on `id8` alone: exactly
one validated profile must match; none, several, or a status other than `valide` → 404. A path
whose `prenom` part differs from the canonical one (she changed her first name, a typo) answers
a permanent redirect to the canonical path. The page is in the public vitrine layout
(`src/app/(public)/`), indexable on production like the rest of the vitrine, with its canonical
URL set. It shows exactly: prénom, profession, « Profil vérifié par Berceo », the zone (her
communes' names, each linked to its commune page), the note and gardes count (no-note state when
none), and « Quelques mots sur moi » with her bio (the section is left out when she wrote none).
**No photo (D-126)**, no surname, no phone, no e-mail, no address, no rate, no specialisations,
no experience, no availability, no documents, and none of these in the HTML, the RSC payload or
the structured data either. Its call to action, per the guide (« Chaque fiche professionnelle doit
pointer vers la page d'inscription famille »): « Créer mon compte gratuit pour voir son profil
complet » (`@relecture Surya`), a link to `/inscription-famille?retour=/espace/famille/professionnelles/<id>`.
Title and meta, the guide's patterns verbatim: « [Prénom], [Profession] disponible pour gardes de
nuit | Berceo » and « [Prénom] est [profession], disponible pour des gardes de nuit à domicile
dans la zone [commune/région]. Profil vérifié par Berceo. », where the zone is her first commune
by name, followed by « et environs » when she serves more than one (`@relecture Surya` on that
suffix). The page is rendered on each request, so a professional who stops being `valide` is a
404 at once.

**The commune pages (D-14, D-127, D-128).** `/garde-de-nuit/[commune]`, one per commune of the
official list (565 today), where `[commune]` is the commune's name slugged like `prenom` above
(« Saint-Josse-ten-Noode » → `saint-josse-ten-noode`); a test holds every slug unique and every
commune reachable. An unknown slug → 404. Every commune has a page, served or not (D-127, the
operator's answer), and **every one is indexable and in the sitemap** (D-128, the operator's
answer). The page shows an H1 « Garde de nuit à domicile à [Commune] », a short introduction
written for the commune (`@relecture Surya`), then either the teaser cards of the validated
professionals serving it, in the order above (the public page's fields, no photo, no
availability, each linking to her public page), or the no-result message above with, in place of
the request button, a link to create a family account. It ends with the call to create a family
account and links to « Comment ça marche » and « Tarifs ». Title « Garde de nuit à domicile à
[Commune] | Berceo » and a meta built on the guide's long-tail keyword (« sage-femme disponible
garde de nuit [commune] »), both `@relecture Surya`; each is unique per commune. There is no
index page of communes, no « et environs » grouping, no page per locality or postcode.

**The sitemap.** `src/app/sitemap.ts` keeps the vitrine paths and adds every commune page and the
public page of every validated professional. It reads the database, so it is regenerated at most
hourly (a one-hour revalidation) rather than per request. `robots.ts` is unchanged: only
production is crawled.

**Back after signing up (D-129).** A signed-out visitor who opens a full profile is already sent to
`/connexion?retour=<path>` (`requireAccess`). This run carries that way back through sign-up:

- `safeReturnPath` is unchanged (only paths inside a space are accepted);
- the sign-in page's link to create a family account carries `retour` to
  `/inscription-famille?retour=…`, and the sign-up page's link to sign in carries it back;
- `/inscription-famille` passes `retour` to `redirectIfSignedIn` (a signed-in family lands on the
  profile at once) and to the sign-up action;
- on a successful sign-up the action sets a first-party, `HttpOnly`, `SameSite=Lax`, one-day
  cookie holding the checked `retour`; the e-mail confirmation route, once she is verified and
  signed in, sends a family to that path (if still safe) instead of her space, then clears the
  cookie. The welcome e-mail is unchanged.

Opening the confirmation link in another browser lands in her space, as today; the cookie is the
only carrier (no schema change). A professional sign-up never reads or sets it.

**Docs and the design system.** A README section « The search and the public pages » (the module,
the order, the slugs, the sitemap, the way back) and an `AGENTS.md` routing row.
`/design-system/portail` shows a signed-in card, a public teaser card and the no-result block.

## Acceptance criteria

- [ ] A search for a commune picked from the suggestions returns every `valide` professional who declared that commune and no one else: a `brouillon`, `en_attente`, `complement_demande` or `refuse` profile serving it never appears (a test on the query, one case per status).
- [ ] A search for a postcode that covers several communes returns the professionals of each, once each; a typed name matching one commune works like picking it; anything else shows the not-found line and no results.
- [ ] Opened with no query by a family whose profile has a commune, `/espace/famille/recherche` shows that commune's results; without one, the empty field.
- [ ] Results are ordered by soonest indicative night, then the professionals with none, ties by first name then profile id (a unit test on the ordering function, including equal nights and equal first names).
- [ ] Each signed-in card shows photo, prénom, profession, « Profil vérifié par Berceo », the zone with the searched commune first, the note and gardes count or the no-note state, and « Prochaines disponibilités », and links to `/espace/famille/professionnelles/[id]`.
- [ ] With no professional in the zone, the no-result message and a button to publish a request show; no empty list is ever rendered alone.
- [ ] `/professionnelles/[prenom]-[id8]` of a `valide` professional shows exactly prénom, profession, « Profil vérifié par Berceo », the zone with each commune linked to its page, the note and gardes count (or the no-note state), and « Quelques mots sur moi » when she has a bio, and the sign-up call to action whose link carries `retour` to her full profile.
- [ ] The public professional page contains no surname, phone, e-mail, address, rate, photo URL or document reference anywhere in its HTML or its RSC payload (a test renders it for a fixture whose surname, phone and e-mail are unique strings and asserts none occurs), and `src/lib/recherche/`'s column list holds none of them (a test on the list).
- [ ] A wrong `prenom` part with a right `id8` answers a permanent redirect to the canonical path; an `id8` matching no `valide` profile, or matching a profile no longer `valide`, answers 404.
- [ ] `/garde-de-nuit/[commune]` exists for every commune of the official list (a test: 565 unique slugs, each resolving back to its INS code), lists the serving `valide` professionals' teaser cards in the search order, and shows the no-result message and the sign-up link when none serves it; an unknown slug answers 404.
- [ ] The sitemap lists the vitrine paths, every commune page and the public page of every `valide` professional, and no other professional page.
- [ ] Every public page has a unique title and meta built from the guide's patterns; the professional page's title and meta match the guide's wording with the name, profession and zone filled in (a test on the builders).
- [ ] A signed-out visitor who opens a full profile, follows sign-in's link to create an account, signs up and clicks the verification link in the same browser lands on that full profile, signed in (a test on the confirmation route with and without the cookie, and on the forms' links carrying `retour`).
- [ ] A `retour` outside a space (`//evil`, `https://…`, `/professionnelles/…`) is dropped at every step and she lands in her space; a professional's sign-up never sets or reads the cookie.
- [ ] The search page, the professional page and the commune page have no horizontal scroll on a 360 px wide phone, the field and button are operable by keyboard alone, and each card is a single link with an accessible name holding her first name.
- [ ] Every visible word lives in `src/content/recherche.ts`; entries not quoted from the guide carry `@relecture Surya`; `src/content/recherche.test.ts` passes (no `!`, `—`, no price, no insurance wording, no « diplômée », the guide's lines verbatim, the placeholder's three dots the one allowed ellipsis).
- [ ] `routing.test.ts` covers `/espace/famille/recherche` (family only; others sent to their space; signed-out sent to sign-in with `retour`), and `/professionnelles/…` and `/garde-de-nuit/…` are reachable signed out.
- [ ] `/design-system/portail` shows the signed-in card, the public teaser card and the no-result block; README has « The search and the public pages » and `AGENTS.md` a routing row.

## Out of scope

- A map, radius or distance search, geocoding, neighbouring communes (D-11).
- Sorting or filtering by note, price, profession or availability; pagination of results.
- A photo on any public page (D-126).
- Localised names, aliases (« Elsene ») or postcodes as public URLs; an index page of all communes; pages per locality or region.
- Structured data (JSON-LD) on the public pages.
- Carrying `retour` across browsers or devices, or through a password reset.
- Hiding suspended accounts: back-office-admin (stub 14) owns suspension and must make the reader in `src/lib/recherche/` exclude them.
- The vitrine linking to commune pages from its own pages or footer.
- Launch-commune narrowing (operator, 2026-09-25: none).
- Scope decisions this run neither builds nor changes: D-1 to D-10, D-12, D-13, D-15 to D-27 except where cited above.

## Open questions

- none. Non-blocking notes:
  - The operator's answers in Define, 2026-09-25: every commune gets a page, empty or not (D-127), and all 565 are indexable and in the sitemap (D-128); no launch-commune narrowing; no photo on the public page (D-126); the no-result text drops the guide's clause on neighbouring zones (D-124); results by soonest availability (D-123). The slug with a short id (D-125) and the cookie that carries `retour` through sign-up (D-129) are Define's choices. `revise` changes any of them.
  - 565 near-identical commune pages are what the guide calls thin and duplicated content (« Les pages trop courtes », « Le contenu dupliqué »). The operator chose it; Surya's review of the commune introduction is the one lever left.
  - If a later run merges first with D-123 to D-129, Build renumbers them, as avis-etoiles did.

Context budget: read Surya's editorial guide (« La recherche », the SEO chapter: title and meta patterns, the URL map, internal linking), the avis-etoiles spec, and `src/lib/auth/` (routing, guard), `src/app/(auth)/actions.ts`, the confirmation route and `src/lib/communes/index.ts` beyond the Inputs table: to quote the guide exactly, to reuse the note and availability readers, and to trace the way back through sign-up.
