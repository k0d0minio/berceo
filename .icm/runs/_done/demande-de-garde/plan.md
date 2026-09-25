# Plan: demande-de-garde

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `src/db/schema.ts` gains the enums `care_request_status`
   (`ouverte`, `annulee`), `care_request_children` (`un_bebe`, `jumeaux`), `baby_age_unit`
   (`semaines`, `mois`) and the table `care_requests` (columns, checks and the three indexes as the
   spec lists them, `family_user_id` → `users.id` cascade); `npm run db:generate -- --name
   care_requests`; commit `drizzle/`. Load `.icm/skills/database-migration/` — done when: drizzle-kit
   emitted the one migration, the journal test passes, and no other open run has a migration
   pending on `main` (verification-back-office).
2. **The rules module** — `src/lib/demandes/rules.ts` (pure, shared by client and server): the two
   date windows in Europe/Brussels (normal: today+2 to today+56; urgent: today or tomorrow, a
   start already past refused), the start-time slots (18:00 to 23:00 by half hour), the end time
   (start + 11 h), the age ranges, the children line wording, the digest's « 18:00 or later in
   Brussels » gate; and its unit tests around every edge, summer and winter time — done when: the
   tests pass.
3. **The data module** — `src/lib/demandes/` (server-only): validation of the form (reusing the
   rules), publish (commune copied through `familyCommune()` from `src/lib/famille/profile.ts`,
   user id from the session, one open request per night), the family's list and single read (own
   rows only, not found otherwise), edit, cancel, the professional's list (only `valide`, her
   `professional_communes`, open, night not started, urgent first then newest; selects no family
   identity), the matching professionals for a commune — done when: unit tests cover validation,
   the ownership rule and the list's selected columns; the address column guard test still passes.
4. **Words** — `src/content/demandes.ts` (form, lists, card, statuses, confirmations, errors, the
   cancel dialog, the not-yet-validated line; guide quotes marked, the rest `@relecture Surya`),
   the two e-mails in `src/content/emails.ts`, the « Mes demandes » and « Demandes » navigation
   labels in `src/content/comptes.ts`; catalogue tests extended to the new file — done when: the
   catalogue tests pass.
5. **The family's pages** — `src/app/(portail)/espace/famille/demandes/` (list, `nouvelle` in
   normal and urgent mode, `[id]` with edit and cancel; server actions; `noindex`;
   `requireAccess(SPACES.parent)`; the redirect to the profile without a commune), the form and the
   DA request card under `src/components/demandes/`, the two buttons on `/espace/famille`, the nav
   entry in `SpaceShell`, `routing.test.ts` — done when: publish, edit and cancel work on the
   preview at 360 px and on desktop.
6. **The professional's list** — `src/app/(portail)/espace/professionnelle/demandes/` with the card,
   the not-yet-validated line, the link on `/espace/professionnelle`, the nav entry — done when: a
   `valide` professional serving the commune sees the request on the preview and another does not.
7. **E-mails** — the urgent and digest templates in `src/lib/email/templates.ts` (with tests like
   the existing ones), the urgent send in `after()` from the publish action (idempotency
   `demande-<id>-<professional id>`, failures logged), the route
   `src/app/api/cron/demandes-digest/route.ts` (POST, bearer `CRON_SECRET`, the 18:00 gate,
   `digest_sent_at`, idempotency `digest-<professional id>-<YYYY-MM-DD>`), links from the request's
   own origin — done when: the route's tests prove 401 without the secret, nothing before 18:00,
   one e-mail per professional after, nothing on a second call.
8. **The schedule** — `.github/workflows/demandes-digest.yml` (`0 16,17 * * *` +
   `workflow_dispatch`, POST to UAT and production with the one repository secret `CRON_SECRET` (D-68),
   skip with a warning when it is missing), `CRON_SECRET` in
   `.env.example` — done when: the workflow file is valid (CI's lint of workflows, if any) and a
   manual dispatch after merge is listed as an operator step.
9. **Docs** — README « The care request » section and the `AGENTS.md` routing row — done when:
   every acceptance criterion in `tasks.md` is checked.

## Risks

- verification-back-office also adds a migration. If both runs are open, the `drizzle/meta`
  journals conflict. Signal: another open run touching `src/db/schema.ts`; generate on the merged
  tree, one after the other.
- Until verification-back-office merges, no profile on UAT or on a preview is `valide`. Signal:
  the professional's list is always empty in the smoke. Set one test profile's status by hand on
  the preview's Neon branch; never add a shortcut in code.
- Brussels dates computed in UTC give an off-by-one around midnight and at the DST changes.
  Signal: a rules test at 23:30 or 00:30 Brussels fails; compute with `Intl` / an explicit
  Europe/Brussels conversion, never `new Date().toISOString().slice(0, 10)`.
- `after()` work can be cut short on a serverless function. Signal: urgent e-mails missing in
  Resend's log for a published urgent request; keep the send inside `after()` (which Vercel
  waits for), not a fire-and-forget promise.
- GitHub Actions schedules can run late or be skipped on an inactive repository. Signal: no
  digest on a day with new requests; the 16:00 and 17:00 UTC calls and `workflow_dispatch` are
  the mitigation, the 18:00 gate keeps a late call correct.
