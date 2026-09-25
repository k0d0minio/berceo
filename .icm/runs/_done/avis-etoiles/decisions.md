# Decisions: avis-etoiles

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

*Build, 2026-09-25 — renumbered: cycle-de-garde-et-annulation merged first with D-105 to D-114, so Define's D-105 → D-115 … D-111 → D-121.*

- D-115 — Criteria: the family rates the professional on Ponctualité, Communication, Soin and Confiance; the professional rates the family on Accueil, Communication, Clarté des consignes and Respect du cadre. Each criterion is 1 to 5 whole stars, and all four are required. Operator, Define, 2026-09-25.
- D-116 — Double-blind: a rating counts in the note only once both sides have rated the garde, or once 14 days have passed since its end. Publication is computed at read time. This overrides the stub's « update on the first rating ». Operator, Define, 2026-09-25.
- D-117 — The rating window runs from the garde becoming terminée to 14 days after its end. There is one invitation e-mail per side and no reminder. A rating cannot be edited or withdrawn by its author. Operator, Define, 2026-09-25.
- D-118 — The family's note and gardes count show on every request card in the professional's list, before she answers, and on her garde page, never with an identity. The founders get a read-only `/admin/avis` in this run. Operator, Define, 2026-09-25.
- D-119 — The note is the mean of every criterion score in the published ratings received, to one decimal with a comma, with a no-note line when there are none. The gardes count is the terminée, non-annulée bookings, rated or not, hidden at zero. Define, 2026-09-25.
- D-120 — Invitations go out from an hourly pass, `/api/cron/avis-invitations`, called on uat and production by a GitHub Actions workflow with `CRON_SECRET`. Each side is sent at most once, recorded in `rating_invitations`. Nothing is sent for a garde whose window already closed, nor for an annulée garde. Define, 2026-09-25.
- D-121 — Each side's home shows their own note and gardes count. Only the aggregate is shown, never a single rating. Define, 2026-09-25.
- D-122 — A garde can still become annulée after it is terminée: cycle-de-garde lets either side report an absence until 24 hours after the night ends (D-106). The spec says an annulée garde is never rated, so a rating given before the absence stays stored and shows on `/admin/avis` with the garde's state. It counts in no note, and the garde counts in no gardes count. The form and the invitation are refused from the moment the garde is annulée. Build, 2026-09-25, a spec gap flagged for Release.
