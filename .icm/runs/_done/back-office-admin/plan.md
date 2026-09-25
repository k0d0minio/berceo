# Plan: back-office-admin

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `src/db/schema.ts` (`users.suspended_at`, `suspended_by`, `deleted_at` with the check that a deleted row is suspended; `bookings.report_handled_at`, `report_handled_by`; five `admin_action` values), `drizzle/0012_back_office_admin.sql` via `npm run db:generate -- --name back_office_admin` — done when: the migration is generated, additive only, and the journal trigger is untouched.
2. **The suspension gate** — `src/lib/auth/current-user.ts` (a `suspended` status), `src/lib/auth/guard.ts` (sign out, land on `/connexion?erreur=suspendu`), `src/app/(auth)/actions.ts` (sign-in refused for a suspended row), `src/content/comptes.ts` (the message) — done when: routing/guard tests cover a suspended user on every space and on sign-in.
3. **Hiding a suspended account in every reader** — `src/lib/recherche/**` and `src/app/sitemap.ts`, `src/lib/reservations/{answers,bookings,profiles}.ts` (no new answer, booking or priority; the Checkout path then refunds `reservation_impossible`), `src/lib/demandes/{requests,notify}.ts` (digest and urgent recipients, priority candidates), `src/lib/avis/ratings.ts` (no invitation), `src/lib/messagerie/conversations.ts` (no new-message e-mail); one shared `notSuspended` predicate — done when: each reader has a test with a suspended fixture.
4. **Admin domain** — `src/lib/admin/`: `accounts.ts` (search with digit-normalised phone and accent-insensitive names, profile view data, suspend, reactivate, anonymise-delete, contact), `overview.ts` (the four block queries, each shared with its list), `lists.ts` (requests, bookings, reports with filters and paging), `rules.ts` (pure rules: who can be acted on, deletion preconditions, phone normalisation, period filter) — suspend/delete call `src/lib/demandes/` and `src/lib/reservations/` for their own writes, `src/lib/documents/` for the bucket, `src/lib/famille/` and `src/lib/disponibilites/` for their rows, and delete the Neon Auth identity (its SDK's admin call if exposed, else the `neon_auth` rows in the same transaction); every action journaled in its own transaction — done when: `rules.test.ts` and new unit tests cover every precondition and the anonymised shape.
5. **Contact e-mail** — `src/lib/email/templates.ts` + `src/content/emails.ts` (the frame, message as plain text, Reply-To the founder's e-mail) — done when: template test proves the Reply-To and escaping.
6. **Pages and components** — `src/app/(portail)/admin/`: `page.tsx` becomes the overview, `dossiers/page.tsx` takes the queue and the students switch, `utilisateurs/` (search + `[id]` view with actions), `demandes/`, `reservations/`, `signalements/` (with « Marquer comme traité »), `absences/` → permanent redirect, `paiements/` gains `?periode=7j`; a shared admin navigation in `src/components/admin/`; confirmation dialogs through `src/components/ui/confirm-dialog.tsx` (D-24); `src/lib/auth/routing.test.ts` for the new paths — done when: every page is a 404 to non-admins and the navigation reaches all nine entries.
7. **Words, design system, docs** — `src/content/admin.ts` (+ tests), the `/design-system/portail` showcase for the new components, README → The founders' verification (extended to the back-office) and AGENTS.md routing row — done when: catalogue tests pass and `@relecture` marks every non-guide string.

## Risks

- Neon Auth may expose no server-side delete-user call; the fallback is deleting the `neon_auth` rows directly. Signal: the SDK types have no admin/remove method. Record the choice in `notes.md`.
- The dashboard counts drifting from their lists if a list re-implements its filter. Signal: two queries for one block; keep one function per block and test the count against the list.
- Missing a reader that can surface a suspended professional (a new path since recherche). Signal: grep for `professionalProfiles.status, "valide"` and `'valide'` across `src/lib/` and add the predicate at each hit.
- Anonymisation colliding with unique constraints (`users.email`, `auth_user_id`). Signal: migration or test failure on a second deletion; the e-mail and auth id placeholders derive from the row id.
- Session revocation: a suspended user's cached session cookie still passes the proxy; the guard's per-request row read is the gate. Signal: an action (server action) that does not call `requireAccess`.
