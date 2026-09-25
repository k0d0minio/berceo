# Tasks: recherche-et-fiches-publiques

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

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

## Queue

- [ ] <task — small enough for one commit; name the file or area>
