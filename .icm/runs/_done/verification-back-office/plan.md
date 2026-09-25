# Plan: verification-back-office

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — load `.icm/skills/database-migration/` first. `src/db/schema.ts`:
   `review_reason` and `reviewed_at` on `professional_profiles`; the `admin_action` enum and the
   `admin_journal` table (ids and name snapshots, no foreign keys; indexes on `occurred_at` and
   `subject_user_id`). `npm run db:generate -- --name verification_back_office`, then append the
   trigger (a function raising on `UPDATE` and `DELETE`, attached `BEFORE UPDATE OR DELETE`) to the
   same generated SQL file — done when: one new migration (`0004_…`) is committed, the journal
   test passes, and a test reads the migration and finds the trigger on both statements.
2. **Pure rules** — `src/lib/professionnelle/rules.ts` or `src/lib/admin/review.ts`: which
   actions a state allows, the students hold (profession + switch → held), the queue's Statut
   (four values), "Renvoyer" allowed only from `complement_demande` on a complete file, the reason
   check (trimmed, 1 to 1,000), the purge selection (refused, `reviewed_at` older than 30 days,
   has files) — done when: unit tests cover every criterion that names a rule, no database.
3. **The journal and the decisions** — `src/lib/admin/journal.ts` (the one insert helper, taking
   a transaction; no update or delete export), `src/lib/admin/review.ts` server side (the
   conditional `UPDATE … WHERE status IN (…)` + journal row in one transaction, then the e-mail
   with an idempotency key per decision); the students switch writes its journal row in the same
   transaction as `app_settings` — done when: the action tests (role refused, stale state
   refused with no journal row, e-mail failure reported) pass with the database and Resend
   stubbed.
4. **Words and e-mails** — `src/content/admin.ts` (queue, statuts, file view, dialogs, journal,
   errors), `src/content/professionnelle.ts` (validated line verbatim, complément, refusal, held
   student, "Renvoyer mon dossier"), `src/content/emails.ts` + three templates in
   `src/lib/email/templates.ts` — done when: the content and template tests pass (no `!`, `…`,
   `—`, no insurance wording, no `[email]` or other placeholder left, the reason escaped).
5. **The admin UI** — `src/app/(portail)/admin/page.tsx` (the queue, then Réglages, then the
   journal link), `admin/dossiers/[id]/page.tsx` (the file view, documents inline via
   `/api/fichiers/[id]`, declarations, history, the three actions), `admin/journal/page.tsx`
   (50 per page), `admin/actions.ts` (runtime role check in every action);
   `src/components/admin/` (queue table, document viewer, reason dialog on `confirm-dialog.tsx`)
   — done when: on a preview an admin validates, asks a complément and refuses three test files
   and sees each in the journal; a parent gets 404 on all three routes.
6. **The professional's side** — `src/app/(portail)/espace/professionnelle/page.tsx` (the line per
   state, the reason, the held-student line), `profil/` (the reason at the top and "Renvoyer mon
   dossier" while `complement_demande`), its server action — done when: a complément round-trip
   works on a preview and the file returns to its original place in the queue.
7. **The purge** — `src/app/api/cron/purge-dossiers-refuses/route.ts` (bearer `CRON_SECRET` or
   404; delete objects then rows; one journal row per profile), `vercel.json` (daily),
   `.env.example`; set `CRON_SECRET` on Vercel Preview and `uat` — done when: the selection and
   idempotence tests pass and a call with the secret on the uat deployment answers with a count.
8. **Docs** — `README.md` (the admin space, the journal, the purge) and `AGENTS.md` routing (the
   journal, the cron) — done when: both name every new path.

## Risks

- drizzle-kit does not generate triggers: the SQL is appended by hand to the generated file; if a
  later `db:generate` drops it, the migration test fails. Signal: the trigger test goes red.
- Vercel cron runs on production only: the purge is proven on uat by a direct call. Signal: the
  uat call fails or deletes a file refused less than 30 days ago.
- Inline PDF on a phone: iOS Safari renders only the first page in an `<object>`/`<iframe>`; the
  "open in a new tab" link is the fallback. Signal: the founders report they cannot read a
  document on their phone.
- A merge of main renumbering the migration (Learned rules): reset the preview Neon branch before
  trusting the next preview build.
