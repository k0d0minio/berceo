# Stub: The founders' verification queue and the admin journal

- feature-slug: verification-back-office
- scope: plateforme-v1
- personas: admin, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: onboarding-professionnelle
- sequence: 5 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

Files arrive and nobody can read them. The reassurance the whole brand rests on, "chaque profil est vérifié manuellement", needs a screen where Alix and Jordane do it, and a trace of what they did.

## Proposed change

The admin space's first screen: "Dossiers en attente de vérification" as a table (prénom, nom, profession, date d'inscription, documents déposés, statut), a file view showing the profile, each document inline and the declarations, and three actions with the guide's confirmation dialogs: "Valider le profil", "Demander un complément" (with a reason), "Refuser le profil" (with a reason). Each sends the guide's e-mail to the professional and moves her state (validé, complément demandé, refusé). An immutable admin journal records date, action, account and administrator for every admin action, this stub's and every later one's. The switch that admits or holds the student profession lives here.

## Acceptance criteria (rough)

- [ ] A founder sees pending files oldest first, opens one, reads the documents, and validates it; the professional receives the validation e-mail and her profile becomes visible to signed-in families.
- [ ] A refusal or a request for more carries a reason the professional reads in her e-mail and in her space.
- [ ] Every action appears in the journal and the journal has no edit or delete path.
- [ ] A parent or a professional cannot open any admin route.
- [ ] The student switch, when off, holds student files in a distinct state and says why.

## Out of scope (this feature)

- The dashboard, user search, suspension (stub 14).

## Notes for Define

- D-5, D-7 (the switch), D-8 (validation is the reassurance; no insurance claim in the validation e-mail), D-19 (the guide, "L'outil de vérification"), D-24 (confirmation colours).
- Open: the documents required per profession decide what "complete" means in the queue.
- touches: src/db/schema.ts, drizzle/**, src/app/(admin)/**, src/lib/admin/journal.ts, src/content/admin.ts, src/content/emails.ts
