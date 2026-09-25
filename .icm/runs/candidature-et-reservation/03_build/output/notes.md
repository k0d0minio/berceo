# Build notes: candidature-et-reservation

- commits: 3e5632e schema + migration (0007 after the merge of main) · 121c24a rules · faa5fc5 data, e-mails, words · 696d87c professional pages · f5b1a08 family pages · 9b55de9 docs
- ci: pending — the draft owes nothing; the full gate settles on the post-flip head (status.md carries the verdict)

## What changed

- `src/db/schema.ts`, `drizzle/0007_candidature_reservation.sql` (0006 until main brought disponibilites-indicatives' 0006; regenerated on the merged tree): `attribuee` on `care_request_status`; `priority_profile_id` / `priority_sent_at` / `republished_at` / `republish_count` on `care_requests`; `application_status`; `care_request_applications` (one row per professional and request, frozen rate, `answer_count`; partial unique « one `retenue` per request »); `bookings` (unique per request, per answer, and per professional and night). Applied and verified (`db:verify`) on `run/candidature-et-reservation`.
- `src/lib/reservations/`: `rules.ts` (pure: who may answer, her list, withdraw, accept, republish, priority, the address gate), `answers.ts` (answer, withdraw, the family's answers and counts, republish), `bookings.ts` (the accept transaction as one `db.batch`, both sides' bookings), `profiles.ts` (the family's view of a validated profile), `notices.ts` + `notify.ts` (the five e-mails), `format.ts`, `paths.ts`.
- `src/lib/demandes/`: the professional's list (priority first, her answer, declined and same-night-booked requests hidden), `publishRequest` with a priority professional, `setPriority`, `priorityCandidates`, `cancelRequest` declining waiting answers, `isEditable` (the D-76 lock), `attribuee` in the display statuses; the urgent e-mail skips declined professionals and is re-keyed per republication; the digest claims a request republished since its last digest and skips declined professionals.
- `src/lib/famille/profile.ts`: `familyHasAddress` and `bookingAddress` (the only new readers of `family_profiles`), with the column-guard case.
- `src/lib/professionnelle/rules.ts` `canReadFile`, `src/lib/documents/serve.ts`, `src/app/api/fichiers/[id]/route.ts`: a parent reads a validated professional's photo, nothing else.
- Pages: the professional's list with the price line and answer / withdraw; « Mes gardes » and a garde (the family's names, address, phone); the family's request page (answers, accept dialog, address gate, republish, edit lock, « Attribuée »); « Mes demandes » counts; the new-request form in priority mode (`?pour=`); the full profile (`?demande=` accept); the priority page; « Mes réservations » and the récapitulatif. Navigation entries in `SpaceShell`, a « Voir mes gardes » link on the professional's home.
- `src/lib/site-origin.ts`: the deployment's origin for e-mail links, moved out of the family's actions so both spaces' actions share it.
- Words: `src/content/reservations.ts` (new), `demandes.ts` (« Attribuée », both list intros), `emails.ts` (five e-mails), `comptes.ts` (two nav labels). README « The answer and the booking », AGENTS.md routing row.

## Acceptance criteria status

- [x] The professional's card: price line and « Je suis disponible pour cette garde »; the guide's confirmation after; « Vous avez répondu » and « Retirer ma disponibilité » — `demandes/page.tsx` (professional), `request-card.tsx`.
- [x] Every refusal of an answer — `answerRefusal` (tests per case), held again in the INSERT; proved on the run database (other commune, twice, booked night, declined).
- [x] The family's e-mail per answer with the button to the profile opened from the request; a failed send logged — `notifyNewAnswer` + test.
- [x] Two answers listed with photo, prénom, profession, answered rate, both buttons; « 2 réponses » on « Mes demandes » — proved on the run database (`familyAnswers`, `pendingCounts`).
- [x] Rate frozen at the answer — proved (rate changed to 250 after answering at 150; the family saw 150, the booking carried 150).
- [x] Withdraw: gone at once, no e-mail, can answer again (count 2, current rate) — proved.
- [x] « Accepter et réserver » → « Récapitulatif de votre garde » (date, hours, « 11 heures », prénom, profession, rate, pay-directly line, no insurance); one booking, « Attribuée », `retenue` / `non_retenue` — proved.
- [x] Both confirmations and the « not retained » e-mail — `notifyBooking` + tests; wording in `templates.test.ts`.
- [x] Two acceptances racing: one booking, the second « conflit » — proved with two concurrent `acceptAnswer` calls on the run database.
- [x] Same night: her other waiting answers `retiree`, no answer to another request that night, the database refuses a second booking (unique `(profile_id, night_date)`) — proved (first two), index in 0007.
- [x] No address → no dialog, sent to complete it — proved (`adresse` refusal), page shows the link.
- [x] Before confirmation nothing about the family reaches a professional; after, her own booking shows full name, address, phone; another professional's id is not found — `cardColumns` test, `bookingAddressColumns` test, proved (`professionalBooking` for another professional is null).
- [x] The family's booking shows the professional's phone, never her surname; another family's id not found — proved.
- [x] The full profile shows a validated profile and nothing hidden; not validated or unknown → not found — `profileColumns` test, proved.
- [x] `/api/fichiers/[id]`: a validated professional's photo to a parent; 404 for documents, an unvalidated profile's photo, a signed-out visitor — `serve.test.ts`, `rules.test.ts`.
- [x] « Lui envoyer ma demande en priorité »: the guide's message; choose an open request, or publish a normal or urgent one carrying her — priority page, `?pour=` on the form.
- [x] Priority reaches her by e-mail at once, first on her list, outside her communes, answerable; others unchanged — proved (list order, answer outside zone), `notifyPriority` + test.
- [x] Priority set once, never changed — proved (`setPriority` twice → refused).
- [x] Republish declines each waiting answer (told, cannot answer again) and re-announces (urgent at once, normal in the next digest) — proved (declines, re-answer refused, claimable by the digest), `notify.test.ts` for the urgent re-send and the digest skip.
- [x] Edit locked while an answer waits, open again after republishing; cancelling e-mails « not retained » — `isEditable` tests, proved (`cancelRequest` declined count).
- [x] An `attribuee` request: no edit, cancel or republish; « Attribuée » with a link to its booking; gone from every list — rules tests, proved.
- [x] « Mes réservations » with the récapitulatif, the profile link and « Lui envoyer une nouvelle demande en priorité ».
- [x] « Mes gardes » lists her bookings and links to each.
- [ ] The migration generated by drizzle-kit, the journal test, a preview applying it with `db:verify` — generated and applied on the run branch with `db:verify` passing; the preview build is read after the flip.
- [x] Cascades: family deleted → requests, answers, bookings; profile deleted → answers, bookings, priority cleared — foreign keys in 0007 (the probes' cleanup deleted everything through `users`).
- [x] Unit tests of the rules module — `src/lib/reservations/rules.test.ts`, `src/lib/demandes/rules.test.ts`, `src/lib/reservations/format.test.ts`.
- [x] Every word in `src/content/`, `@relecture` on ours; catalogue tests on the new and changed files — `reservations.test.ts`, the existing `demandes`, `comptes` (e-mails) tests.
- [x] `routing.test.ts` covers the new paths.
- [x] README section and AGENTS.md row.

## Notes for Release

- **Spec gaps decided here (decisions.md → D-82 to D-85; D-86 below):** a `republished_at` column so a republished normal request re-enters the digest without disturbing « one digest a day »; the priority check reads « no id, or a moment » rather than « both or neither », because deleting the professional sets the id null and keeps the moment; the price line lives in `src/content/reservations.ts`, since `demandes.test.ts` forbids `€` in the request catalogue; the professional's card shows her current rate, while the family sees and books the frozen one.
- **Outside the approved spec, by the operator's word (D-86):** the full profile mounts « Prochaines disponibilités », which disponibilites-indicatives (merged into this branch, #41) assigned to this run in its D-69; the spec's Out of scope still names the block as another run's.
- **The merge of main renumbered the migration to 0007.** The run's Neon branch was reset and 0000–0007 applied again; the PR's preview branch in `uat-berceo` held the old 0006 and was deleted (operator's go-ahead) so the next preview build recreates it.
- **Look closely at** `acceptAnswer` in `src/lib/reservations/bookings.ts` (five statements in one `db.batch`, each after the first conditioned on the booking existing) and the answer INSERT in `answers.ts` (raw SQL, `on conflict … where status = 'retiree'`).
- The existing urgent e-mail says « Une famille de Ixelles » (no elision); the priority e-mail copies that construction. Surya's review of `@relecture` lines covers both.
- Tests and the typecheck were written, not run, per the repo rule; the data layer was proved against `run/candidature-et-reservation` with throwaway probes (deleted).

Context budget: read `src/lib/documents/serve.ts`, `src/components/ui/confirm-dialog.tsx` and Drizzle's neon-http batch source beyond the touches, to wire the photo rule, the two dialogs and a transaction the HTTP driver can run.
