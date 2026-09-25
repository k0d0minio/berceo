# Decisions: candidature-et-reservation

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- D-1 — Berceo never handles the money for the night. The family pays the professional directly after the garde.
- D-2 — Berceo charges a service fee of 3 % of the night rate at the moment the family confirms a booking, through Stripe. If the professional cancels, the fee is refunded in full. If the family cancels, the fee is kept.
- D-3 — Family subscriptions, the professional's annual subscription and gift cards are out of this batch. They become a later scope once the founders give prices. In V1 a free account opens the full profiles.
- D-4 — The professional sets her own night rate between 100 and 300 €. No automatic tariff. No lower range for students.
- D-5 — V1 verifies qualifications, not identity. A professional uploads her diploma or certificate, accepts the four sworn declarations, and the founders review the file by hand before the profile is visible. No itsme, no ID card check.
- D-6 — The criminal-record extract (bonne vie et mœurs, minors) is a checkbox the professional ticks, not a document she uploads.
- D-7 — The profession list carries "étudiante sage-femme (3e ou 4e année)". Whether students are admitted at launch is a switch the founders flip, off until their insurer confirms a solution. Copy about "diplômées" is worded so it stays true either way.
- D-8 — Berceo carries no insurance for the garde. The professional's own RC professionnelle covers her. The platform never says "assurance Berceo" or "cette réservation est couverte". The reassurance line is the manual verification.
- D-9 — The platform follows Surya's web art direction: white base, sage `#8BAF9F`, taupe, pearl, butter yellow, the striped pattern, Comodo for titles, Nunito for text, capsule buttons, 32 px cards, no shadows. The dark holding page stays only until the vitrine replaces it.
- D-10 — One matching flow. The family publishes a request; professionals serving that commune answer "Je suis disponible pour cette garde"; the family compares and accepts one. From a professional's profile, a family can send its request "en priorité" to her, and the request stays visible to the others until confirmed. Responses are not capped. A family can find the professionals she already booked and send them a request in priority.
- D-11 — Families search by commune or postcode. Results are cards. The zone is the only filter. Professionals declare the communes they serve. No map, no geocoding.
- D-12 — Professionals keep an indicative availability calendar: nights marked available or not, never binding. Families see "Prochaines disponibilités" on a profile.
- D-13 — Accounts run on Neon Auth. The users table gains the auth identity column the schema left open.
- D-14 — Public, indexable teaser pages exist for professionals (`/professionnelles/[prenom]`: first name, profession, zone, rating, number of gardes; no surname, no phone) and per commune. Their call to action is to create an account. They are the last stub of the batch.
- D-15 — The exact address of the family is revealed to the professional only once the booking is confirmed. Before that, only the commune.
- D-16 — A conversation opens when a professional answers a request. Berceo posts the opening message the cahier des charges gives. Messages carry a read state and trigger an e-mail. The conversation closes when the garde ends and stays readable.
- D-17 — No start or end confirmation of a garde. Its state moves by time and by cancellation: ouverte, attribuée, à venir, en cours, terminée, annulée. A dispute goes to the founders' e-mail; nothing in-app.
- D-18 — After the garde both sides rate with stars on three or four criteria. No free text.
- D-19 — Every word the platform shows lives in the content catalogue under `src/content/`, in French, written to Surya's guide: vouvoiement, no exclamation mark, no em dash, no ellipsis, the validated lexicon, no e-commerce words. Surya reviews the catalogue.
- D-20 — A request holds: date, start time (a standard night is 11 hours), number of children (un bébé, jumeaux), the baby's age, the commune, an urgent flag, and the mandatory checkbox "Mon enfant n'a pas de condition médicale particulière nécessitant des soins spécialisés". No free-text medical field. No photos of children anywhere.
- D-21 — A professional creates her account in under three minutes, then completes four numbered steps with a progress bar: compte, profil, justificatifs, déclarations. Progress is saved between sessions. Her profile is invisible until the founders validate it. The promise is "dans les 24 heures ouvrables".
- D-22 — Every run merges into the `uat` branch. `uat.berceo.be` is the founders' test address and the pace is weekly feedback from Alix and Jordane. The first usable version is due there before December 2026.
- D-23 — The Facebook group is never named. The "Notre histoire" page speaks of "une communauté en ligne" and is written in the first person by the founders.
- D-24 — Confirmation colours: red `#ED5957` for cancel, refuse or leave; green `#B6D3C6` for confirm. Only in confirmation dialogs, never as page-wide buttons.
- D-25 — "Trouver votre gardienne de la nuit" is a button only where the text above has said these are health professionals. Elsewhere it is "Trouver une professionnelle". "Gardiennes de la nuit" is storytelling, never an interface label.
- D-26 — This scope is pushed on `claude/focused-babbage-5i09zk` and opened as a PR for the operator to merge, instead of straight to `main`.
- D-27 — Family accounts are not verified. A family gives first name, surname, e-mail, phone, commune. Phone is stored, not verified by SMS.

## Made in this run

*Numbered from D-70: verification-back-office holds D-50 to D-59, demande-de-garde D-60 to D-68.*

- D-70 — « Republier » on an open request with pending answers declines every one of them (each professional e-mailed « not retained », none may answer it again) and re-announces the request: the urgent e-mail again at once for an urgent one, the next digest for a normal one. Reads cahier des charges « Réouverture annonce ». Operator, Define, 2026-09-25.
- D-71 — A priority request has no head start: the chosen professional is e-mailed at once and sees it first on her list marked « Demande prioritaire », even outside her communes; everyone else sees and is notified of it as for any request. One priority professional per request, set once. Operator (no head start), Define (outside her communes, one per request), 2026-09-25.
- D-72 — Once a booking is confirmed, each side sees the other's phone: the family the professional's, the professional the family's full name, address and phone. Operator, Define, 2026-09-25.
- D-73 — A professional may withdraw her answer while the request is open, silently, and answer again. When she is booked for a night, her other pending answers for that night are withdrawn silently and she cannot answer another request for it; the database refuses a second booking for her that night. Operator, Define, 2026-09-25.
- D-74 — The rate is frozen on the answer: the family compares the rates the professionals answered at, and the booking carries the rate of the answer it was made from. Define, 2026-09-25.
- D-75 — Families read a professional's full profile at `/espace/famille/professionnelles/[id]`: any signed-in family, any `valide` profile (D-3). Her photo becomes readable by parents for a `valide` profile; documents stay owner and admins only. Never her surname, e-mail, phone, INAMI or documents before a booking. Define, 2026-09-25.
- D-76 — A request with a pending answer cannot be edited (what the professionals agreed to would move under them); republishing clears the answers and editing opens again. Cancelling stays possible and e-mails the pending professionals « not retained ». Define, 2026-09-25.
- D-77 — Accepting an answer requires the family's street and house number in her profile. The professional reads the address live from the profile through `src/lib/famille/`, never a copy in the booking. Define, 2026-09-25.
- D-78 — The guide's booking e-mails are quoted verbatim except the family's insurance sentence (D-8) and the professional's « Bonne nuit ! », which becomes « Bonne nuit. » (the catalogue allows no `!`; `@relecture Surya`). Define, 2026-09-25.
- D-82 — `care_requests.republished_at` added beside `republish_count`: the digest claims a normal request whose `republished_at` is later than its `digest_sent_at`, so republishing never clears `digest_sent_at` and « one digest a day » (`digestSentOn`) keeps reading the day's sends. A spec gap (the spec said « `digest_sent_at` back to null »); Build, 2026-09-25.
- D-83 — The priority check is « no professional, or a moment » (`priority_profile_id IS NULL OR priority_sent_at IS NOT NULL`), not « both or neither »: deleting the professional sets her id null and keeps the moment, and `setPriority` refuses once a moment exists, so the priority stays set once. A spec gap; Build, 2026-09-25.
- D-84 — The card's price line lives in `src/content/reservations.ts`, not `demandes.ts`: the request catalogue's test forbids `€`, and the reservations catalogue allows it in that one line only. The professional's card shows her current rate; the family sees and books the rate frozen at the answer (D-74). Build, 2026-09-25.
- D-85 — A family's pending-answer count, the edit lock and the answers list count only validated professionals' waiting answers, the ones she can see and accept; republishing and cancelling decline every waiting answer. Build, 2026-09-25.
- Renumbered at the merge of main, 2026-09-25: disponibilites-indicatives (#41) holds D-79 to D-81, so this run's Build decisions, first numbered D-79 to D-82, are D-82 to D-85. No decision changed.
- D-86 — The full profile mounts « Prochaines disponibilités » (`nextAvailableNights`, the block disponibilites-indicatives built), as that run's D-69 on `main` asks, though this run's spec had listed the block as out of scope. Operator, Build, 2026-09-25, at the merge of main.
