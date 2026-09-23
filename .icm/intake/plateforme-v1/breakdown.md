# Breakdown: Plateforme Berceo V1

- scope-slug: plateforme-v1 · story: runs/plateforme-v1/01_scope/\_source/story.md
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- personas: parent, professionnel, admin

## What I understood

Berceo is a two-sided platform: families of newborns publish a request for a night of care at home, verified health professionals in their commune answer, the family picks one, and the two talk in a private conversation until the garde. Berceo never touches the money for the night; it charges a 3 % service fee when the family confirms. The founders check every professional's diploma by hand before her profile is visible; there is no identity check in this version. After the garde both sides leave stars. Surya's editorial guide is every word the platform says and Surya's web art direction is every pixel; the founders test each increment on uat.berceo.be and the first usable version is due there before December.

Subscriptions, gift cards, itsme, a map, written reviews and a blog are deliberately out of this round. Public teaser pages for professionals and communes are in, last.

## Where it sits

The whole of the cahier des charges (`.icm/docs/cahier-des-charges.md`) as annotated: A vitrine, B comptes, C profils, D demandes et mise en relation, E messagerie, F validation de mission (reduced to statuses), G avis, H administration, I paiement (reduced to the fee). Entities: user, professional profile and documents, family profile, care request, application, booking, conversation, message, rating, payment, admin action. Journeys: the family's (s'inscrire, publier, choisir, échanger, la nuit, noter) and the professional's (s'inscrire, compléter, être vérifiée, répondre, la nuit, noter).

**Splitting signal, flagged as the contract asks:** fifteen stubs is more than one scope usually cuts. It is the whole product, and the sources arrived together, so it is one scope with one settled addendum. The build order below is phased so the first eight stubs make a usable loop (account, profile, verification, request, answer, booking) and the operator can stop or re-scope after any of them. If the operator prefers, the folder splits cleanly at stub 9 into two epics.

## Build order

1. socle-design-system — the DA as Tailwind tokens, fonts, shadcn retune, light root layout, app shell, content catalogue structure, `/api/health` — depends-on: none
2. comptes-neon-auth — Neon Auth, family sign-up, sign-in, reset, role redirect, timestamped consent, transactional e-mail foundation, users migration — depends-on: socle-design-system
3. vitrine-publique — accueil, qui-sommes-nous, comment-ca-marche, faq, tarifs, legal placeholders, SEO metadata; replaces the holding page — depends-on: socle-design-system, comptes-neon-auth
4. onboarding-professionnelle — quick account then four steps with a progress bar: profile, documents, declarations; invisible until validated — depends-on: comptes-neon-auth
5. verification-back-office — the founders' queue: validate, ask for more, refuse; automatic e-mails; immutable admin journal — depends-on: onboarding-professionnelle
6. profil-famille — the family's details and commune, editable — depends-on: comptes-neon-auth
7. demande-de-garde — publish, edit, cancel a request; urgent flag; the list professionals see for their communes — depends-on: onboarding-professionnelle, profil-famille
8. candidature-et-reservation — "Je suis disponible", the family compares and accepts, the request closes, the address is revealed, priority request to a known professional — depends-on: demande-de-garde
9. frais-de-service — Stripe: 3 % at confirmation, Bancontact and cards, refund on the professional's cancellation, payments record — depends-on: candidature-et-reservation
10. messagerie — one conversation per answered request, Berceo's opening message, read state, e-mail on new message, closes after the garde — depends-on: candidature-et-reservation
11. cycle-de-garde-et-annulation — à venir, en cours, terminée by time; cancellation by either side with the fee rule; notifications — depends-on: frais-de-service, messagerie
12. avis-etoiles — post-garde star ratings both sides, aggregate on the profile — depends-on: cycle-de-garde-et-annulation
13. disponibilites-indicatives — the professional's non-binding calendar, "Prochaines disponibilités" on her profile — depends-on: onboarding-professionnelle
14. back-office-admin — vue d'ensemble, user search, suspend and reactivate, requests, bookings, payments, ratings — depends-on: verification-back-office, frais-de-service, avis-etoiles
15. recherche-et-fiches-publiques — search by commune or postcode with cards; public teaser pages per professional and per commune — depends-on: onboarding-professionnelle, avis-etoiles, disponibilites-indicatives

## Parallelizable

Derived from the `touches:` guesses. Every stub that adds a migration touches `src/db/schema.ts` and `drizzle/meta/_journal.json`, so those are sequenced. The sets whose guesses do not overlap:

- {comptes-neon-auth, vitrine-publique} once socle-design-system is merged: the first touches the schema, auth and e-mail; the second touches the public routes and the catalogue only.
- {verification-back-office, profil-famille} once onboarding-professionnelle is merged, if profil-famille adds no migration (its fields may already sit on `users`; Define decides).
- {messagerie, disponibilites-indicatives}: different tables, different routes; only if their migrations are generated on the merged tree, one after the other.

Everything else is a chain.

## Out of scope (whole scope)

- Subscriptions, gift cards, promo codes: a later scope once prices exist.
- Identity verification (itsme, ID card, KYC vendor).
- A map and radius search.
- Written reviews and a public testimonials page; a blog.
- A native app; Dutch and English; a CMS for the vitrine.
- Partners page, receipts, internal admin notes, quality board, AI diploma triage.
- In-app disputes, SMS or WhatsApp, two-factor authentication.
- DSA and P2B features and an accessibility statement, pending the lawyer.
- Legal texts, the 3 a.m. protocol, daytime care, other countries.
