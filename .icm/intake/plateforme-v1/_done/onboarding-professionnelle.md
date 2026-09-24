# Stub: The professional's four-step onboarding and profile

- feature-slug: onboarding-professionnelle
- scope: plateforme-v1
- personas: professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: comptes-neon-auth
- sequence: 4 of 15
- complexity: high
- recommended-model: opus

## Problem

A professional has an account but no profile, no documents and no way to be verified. Nothing can be matched until she has declared who she is, where she works and what she charges, and the founders can see her file.

## Proposed change

After the quick account, the only thing a professional can do is the four numbered steps with a progress bar, saved between sessions: 1 "Créez votre compte" (already done, shown as such), 2 "Complétez votre profil" (ma profession from the list including étudiante sage-femme 3e ou 4e année, mes spécialisations, ma zone d'intervention as one or more communes, mon tarif de nuit between 100 and 300 €, mon expérience, quelques mots sur moi up to 500 characters, a photo), 3 "Déposez vos justificatifs" (the documents required for her profession, private storage), 4 "Validez vos déclarations" (the four sworn declarations of the cahier des charges and the checkbox that her criminal-record extract for work with minors is clean, each stored with a timestamp). On submission she reads the guide's message with the 24-working-hour promise. Her profile is in state en attente and invisible. Once validated she can edit her profile; a change of profession or documents returns it to review.

## Acceptance criteria (rough)

- [ ] A professional can leave at step 2 and find her answers at the next sign-in.
- [ ] The night rate cannot be set outside 100 to 300 €.
- [ ] Uploaded documents are not reachable by URL without an admin session.
- [ ] The declarations are stored with their wording version and timestamp.
- [ ] A submitted file is in state en attente and the professional's space says so.
- [ ] The migration adds the profile, documents and declarations tables.

## Out of scope (this feature)

- The founders' review (stub 5), availability (stub 13), identity checks [D-5].

## Notes for Define

- D-4 (rate range, no automatic tariff), D-5 (qualification only), D-6 (criminal record as a checkbox), D-7 (students in the list, admitted by a switch), D-11 (communes served, not a radius), D-19, D-21.
- Open: the list of professions and the documents required per profession; the document store and EU region; the retention rule for a refused or deleted file.
- The commune list is the Belgian commune register (NIS codes); keep it as data, not free text.
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/professionnelle/onboarding/**, src/app/(portail)/professionnelle/profil/**, src/lib/documents/**, src/lib/communes/**, src/content/professionnelle.ts
