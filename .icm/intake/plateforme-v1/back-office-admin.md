# Stub: The founders' back-office

- feature-slug: back-office-admin
- scope: plateforme-v1
- personas: admin
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: verification-back-office, frais-de-service, avis-etoiles
- sequence: 14 of 15
- complexity: medium
- recommended-model: sonnet

## Problem

The founders can verify a file but cannot see the platform: who is on it, what is open, what was paid, whom to suspend.

## Proposed change

"Vue d'ensemble" with the guide's blocks, each a number and a link: dossiers en attente, réservations en cours, signalements à traiter (disputes arrive by e-mail; this block counts cancellations awaiting a look), paiements récents. Users: search by name, e-mail or phone; a profile view; "Suspendre le compte", "Réactiver le compte", "Supprimer le compte" with the guide's confirmations and the name shown, each journaled. Lists of requests, bookings and payments with their states; the ratings collected. The journal from stub 5, readable.

## Acceptance criteria (rough)

- [ ] A founder finds any user in one search and suspends her; a suspended professional disappears from results and cannot sign in with an explanation; reactivation restores her.
- [ ] Every number on the dashboard matches its list.
- [ ] Every admin action is in the journal with the administrator's name.

## Out of scope (this feature)

- Content editing, internal notes, a quality board, exports.

## Notes for Define

- D-17 (disputes by e-mail), D-19 (the guide, "Le backoffice"), D-24.
- Deletion of an account must respect retention decided in stub 4; propose anonymisation over hard delete.
- touches: src/app/(admin)/**, src/lib/admin/**, src/content/admin.ts
