# Build notes: back-office-admin

- commits: b3b8a63 (schema + migration 0012), 0a521e7 (suspension gate and readers), cab5b49 (admin domain, contact e-mail, purge), 0aacd65 (pages and components), then the tests and this pack
- ci: see status.md — the draft owed nothing; the full verdict is read after the ready flip

## What changed

- `src/db/schema.ts`, `drizzle/0012_back_office_admin.sql`: `users.suspended_at`, `suspended_by`, `deleted_at` (a check keeps a deleted row suspended); `bookings.report_handled_at`, `report_handled_by` (only on a cancelled garde) with a partial index for the pending reports; five `admin_action` values. Additive only; the journal and its trigger are untouched. Applied to the run's Neon branch.
- `src/lib/auth/`: `currentUser()` returns `suspended` for a suspended row, so no page, action or file route opens for it; the guard sends such a session to `/connexion/suspendu` (a route handler that signs out and lands on `/connexion?erreur=suspendu`); the sign-in action refuses a suspended row after Neon Auth accepted the password and ends the new session. `suspension.ts` holds the one predicate every reader uses (`notSuspended`, on its own `users` alias) and the guards the suspension and deletion batches use.
- Readers that hide a suspended account: the search, the teaser and commune pages and the sitemap (`src/lib/recherche/professionals.ts`), the family's view of a professional (`reservations/profiles.ts`), the priority request and its notice, the urgent and digest recipients (`demandes/requests.ts`, `reservations/notices.ts`), answering and booking (`reservations/answers.ts`, `bookings.ts`: a Checkout that completes after her suspension fails `acceptAnswer` and is refunded `reservation_impossible` by the existing path), the rating invitation (`avis/ratings.ts`) and the new-message e-mail (`messagerie/conversations.ts`). The reminder of the day before still goes to both sides of a standing garde.
- `src/lib/admin/accounts.ts`: search (folded names, e-mail, phone by digits in any notation; deleted accounts never found), the profile view, and the four acts. Suspension is one `db.batch` (the row, her waiting answers `retiree`, her open requests `annulee` and the answers on them `non_retenue`, the journal entry), each statement guarded on the suspension having taken; the declined professionals are told after the response. Reactivation is one statement. Deletion is one batch (anonymised row, family profile, profile fields, communes, nights, Neon Auth identity, journal entry under her old name), then her files leave the bucket object-first; leftovers are finished by the daily purge, which now also lists deleted accounts. Contact sends from `EMAIL_FROM` with Reply-To the founder's own e-mail and journals the subject only once sent.
- The statements a suspension or deletion carries live in the modules that own the tables: `suspensionWithdrawsAnswers` (reservations), `suspensionCancelsRequests`, `suspensionDeclinesAnswers` (demandes), `deletionForgetsFamilyProfile` (famille, so the address guard test still holds), `deletionForgetsAvailability` (disponibilites).
- `src/lib/admin/lists.ts`: requests, bookings and reports, each list and its overview count built from one exported condition; « Marquer comme traité » is one statement (marker + journal entry naming the side responsible).
- `src/lib/paiements/payments.ts`: `readPayments(page, since)` and `paymentCountSince(since)` share one condition (`paid_at >= since`).
- `src/lib/email/`: `sendEmail(…, { replyTo })`; the layout's button is optional; `contactEmail` keeps the founder's line breaks inside a paragraph.
- Pages under `src/app/(portail)/admin/`: `/admin` is the overview; `/admin/dossiers` takes the queue and the students switch; `/admin/utilisateurs` and `/[id]`; `/admin/demandes`; `/admin/reservations`; `/admin/signalements`; `/admin/absences` redirects permanently; `/admin/paiements?periode=7j`. Every page goes through `AdminShell` (the nine-entry navigation). The old « Absences signalées » reader and table are removed (D-143).
- `src/content/admin.ts`, `comptes.ts`, `emails.ts`: every new word, the guide's lines verbatim, the rest `@relecture`.

## Acceptance criteria status

Proven against the run's Neon branch (a UAT copy) with throwaway probes, never committed:

- [x] Overview blocks and lists — each block counts with the condition its list filters on (one exported function per block); the probe read every list and count, and marking a report moved the count from 1 to 0.
- [ ] Queue and switch at `/admin/dossiers`, the redirect, the navigation, 404s — code in place and `routing.test.ts` covers the 404s; the pages themselves are for the preview smoke.
- [x] Search — `0470`, `0470 88 28 48`, `+32470882848`, `470882848`, first name, `SOPHIE LAB`, last name and full name all found the right accounts; a deleted account was not found by « supprimé ».
- [ ] Profile view — built (commune only for a family, no action on an admin); for the preview smoke.
- [x] Suspension — a family's open request became `annulee` and its waiting answer `non_retenue` (id returned for the e-mail); a professional's waiting answer became `retiree`; a confirmed garde was untouched and listed; `compte_suspendu` journaled; a second suspension refused.
- [x] Hidden while suspended — search cards, teaser by short id, sitemap list, the family's view, the digest/urgent recipients: all present, all gone once suspended, all back on reactivation.
- [ ] Sign-in refused and an open session ended — code in place (`currentUser`, guard, sign-in action, `/connexion/suspendu`); needs a real Neon Auth session, so it is for the preview smoke.
- [x] Reactivation — suspension lifted, `compte_reactive` journaled, a validated professional visible again.
- [x] Deletion — refused on an active account (`nonSuspendu`), with a garde ahead (`gardesAVenir`) and with the wrong name (`nomDifferent`); then the row became « Compte supprimé » with `supprime-<id>@invalid`, no phone, deleted and suspended; bio cleared, communes gone; `compte_supprime` journaled under the old name. The bucket and the Neon Auth identity deletes ran without error but the probe's accounts had neither; for the preview smoke with a real account.
- [ ] Contact — template tested (subject, escaping, line breaks, no button, the answer line); the Reply-To is set by `sendEmail`; the send itself needs Resend, for the preview smoke.
- [x] Requests, bookings and reports lists with their filters; « Marquer comme traité » once, a second click refused, `signalement_traite` journaled.
- [x] Journal — every new action written with the administrator's name; UPDATE and DELETE on `admin_journal` still refused on the branch after the migration.
- [ ] Words and DA — catalogue tests extended (verbatim lines, every key); no `text-sauge`/`text-taupe`, red and green only through `ConfirmDialog`; the look is for the preview smoke.

## Notes for Release

- Neon Auth's admin API needs a Neon Auth admin session, which the founders do not have, so the suspension deletes `neon_auth.session` rows and the deletion deletes the `neon_auth."user"` row with SQL (D-141). Worth a look in review: it depends on Neon's own schema (`"userId"` on `session`; `session` and `account` cascade from `user`, checked on the branch).
- The spec's « reason given if any » on a report has nothing to show: no reason is stored on a cancelled booking (D-142).
- Deviations from the plan: the `/design-system/portail` showcase was not extended (no new primitive: the admin pages reuse Table, Button, Input and ConfirmDialog); README and AGENTS.md are Release's.
- A deleted account's messages stay in its conversations, readable to the other side under « Compte supprimé » (spec, Out of scope).
- The admin catalogue's `absences` section and the old home's `lien*` keys are gone with the pages that used them.
- Context budget: over the Inputs table — the modules each reader lives in were read to hold the suspension there, and the `neon_auth` schema was read on the branch.
