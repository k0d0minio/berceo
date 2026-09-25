# Build notes: verification-back-office

- commits: `5474bc7` schema, trigger, rules, words, e-mails · `c0c2556` queue, file view, decisions, journal, purge, her side · docs (README, AGENTS)
- ci: see the stop report — the draft head owes nothing; the verdict is read on the post-flip head

## What changed

- `src/db/schema.ts`, `drizzle/0004_verification_back_office.sql`: `review_reason`, `reviewed_at` on `professional_profiles`; the `admin_action` enum and `admin_journal` (ids and name snapshots, no foreign keys, two indexes). The trigger function and two triggers (row-level `BEFORE UPDATE OR DELETE`, statement-level `BEFORE TRUNCATE`) are appended by hand to the drizzle-generated file, which drizzle-kit never regenerates.
- `src/lib/admin/rules.ts`: pure rules — reviewable states, the four statuts, the students hold, allowed decisions, the reason check, the purge cutoff, journal paging. `src/lib/professionnelle/rules.ts` gains `canResend`.
- `src/lib/admin/journal.ts`: the one insert helper (usable inside `db.batch`), the reads; no update or delete. `src/lib/settings/`: the switch and its journal entry in one batch.
- `src/lib/admin/review.ts`: the queue read; `decide()` — one CTE statement updates the file only if its status and `reviewed_at` are still what the founder's page showed (and, for a student validation, only while the switch is on), and inserts the journal row from the updated row; then the e-mail, idempotency key `decision-<journal id>`.
- `src/lib/admin/purge.ts` + `src/app/api/cron/purge-dossiers-refuses/route.ts` + `vercel.json`: the daily purge (objects first, then rows and the journal entry in one batch), `CRON_SECRET` bearer or 404; 500 with the counts when a profile failed, so Vercel's cron log shows it.
- `src/app/(portail)/admin/`: `/admin` (queue, settings, journal link), `/admin/dossiers/[id]`, `/admin/journal`, `actions.ts` (`decideFile`, runtime role check, argument checks). `src/components/admin/`: queue table, document view, decision panel with the reason dialogs, journal table.
- `src/components/ui/confirm-dialog.tsx`: an optional `children` slot and an `onSelect(event)` that can `preventDefault()` to keep the dialog open — the reason field lives in the one component allowed the confirmation colours (D-24).
- `src/app/(portail)/espace/professionnelle/`: the line per state, the reason, the held-student line; `resendFile` and the "Renvoyer mon dossier" form on `/profil`.
- `src/content/admin.ts`, `professionnelle.ts`, `emails.ts`, `comptes.ts` (the stale "outils arriveront ici" line removed); `src/lib/email/templates.ts`: three e-mails.
- `.env.example`: `CRON_SECRET` [production,preview]. Vercel: `CRON_SECRET` set on Preview + `uat` (encrypted, readable in the dashboard so the operator can call the purge on UAT by hand).

## Proven on the run's own Neon branch (`run/verification-back-office`)

- Migration applied, `db:verify` 5/5. The trigger refused UPDATE, DELETE and TRUNCATE; the probe row stayed (it cannot be removed — the branch expires in 7 days).
- `decide()` run for real through tsx: a student validation with the switch off → `etudiantes`, nothing written; a blank reason → `motifRequis`; a complément → `complement_demande`, reason stored, one journal row; the stale page and the second founder → `traite`, nothing written; a refusal from `complement_demande` → `refuse`; a validation → `valide`, reason cleared, one `profil_valide` row, gone from the queue; the queue read lists a waiting file. No `RESEND_API_KEY` in the session, so every send failed and returned `email: "echec"` with the decision standing — the e-mail-failure path, proven.

## Acceptance criteria status

- [x] The queue — `loadQueue` + `QueueTable`; rules tested; read proven on the run branch.
- [x] The file view — `/admin/dossiers/[id]`, documents through `/api/fichiers/[id]` (`<object>` for PDFs, `<img>` for images, a new-tab link each), declarations, history.
- [x] Valider — the guide's sentence with her name; `valide`, reason cleared, `reviewed_at`, journal, e-mail (template test holds the guide's words and no insurance); her space shows the guide's line.
- [x] Complément / Refus — reason checked in the dialog and in `decide()` (tests); stored, journaled, e-mailed; shown in her space. E-mail tests assert no placeholder and no contact address.
- [x] Renvoyer — `resendFile` moves only `complement_demande` → `en_attente`, `submitted_at` untouched; `canResend` tested; the queue reads "Complément reçu" (tested).
- [x] Refusal final — `isEditable("refuse")` is false as before; the space shows the reason; `resendFile` refuses it.
- [x] Stale or second action — status + `reviewed_at` guard in the statement; proven live; transitions unit-tested.
- [x] E-mail refused — decision stands, "l'e-mail n'a pas pu partir"; proven live.
- [x] Students switch — the hold is derived; UI disables Valider, the server refuses it twice (JS and SQL); her space says why; unit tests.
- [x] Journal rows — decisions (in the statement), the switch (batch), the purge (batch); `/admin/journal` 50 per page, Brussels time.
- [x] Immutable journal — no update/delete in `journal.ts`; trigger in the migration; `src/db/verification-migration.test.ts` + live proof.
- [x] 404 and role checks — `routing.test.ts` covers the three paths for each role; `actions.test.ts` covers both actions for signed-out, parent and professional.
- [x] Purge — `purge.test.ts` (selection, photo included, the recent and non-refused files kept, one journal entry, second call deletes nothing, a failed object delete keeps the rows) and the secret check; `vercel.json` daily at 03:17 UTC.
- [x] Migration — generated by drizzle-kit; journal test unchanged; the preview proves `vercel-build` at the flip, UAT at the merge.
- [x] Words — all in `src/content/`, `@relecture` on every non-guide entry; `admin.test.ts` for the guide's lines, `professionnelle.test.ts` runs the writing rules over the admin catalogue, template tests over the three e-mails.

## Notes for Release

- Tests were written, not run (the local sweep is CI's): the advisory quality job is their first run.
- `vitest` loads `src/app/(portail)/admin/actions.test.ts` with its modules mocked (`vi.mock` + top-level `await import`) — the first test of a server action in this repo.
- The trigger SQL is hand-appended to a generated migration: review that `db:verify`'s hash on the preview matches (it hashes the file as committed).
- On UAT after the merge: a founder account (admin) can run the whole round trip; the purge can be called by hand — `curl -H "Authorization: Bearer $CRON_SECRET" https://uat.berceo.be/api/cron/purge-dossiers-refuses` → `{"profiles":0,"files":0,"failed":0}` until a refusal is 30 days old.
- Production before promotion: `CRON_SECRET` in Vercel Production (the operator's; `env.sh audit --changed` reports it on purpose).

Context budget: over the Inputs table — the onboarding run's actions and pages were read to follow its patterns (the CTE statement, the batch, the action checks), and the Vercel env API was read to place `CRON_SECRET` on the `uat` custom environment.

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on 32e971c (ci-status.sh, full gate); re-read after the last push below
- reviews: code medium (2 findings, both in onboarding code already on main — parked) · security security-check.sh --branch --audit: OK (gitleaks absent, built-in patterns) + /security-review — no findings at confidence ≥ 8 · readiness env.sh audit --changed: OK (`CRON_SECRET` now on Production, Preview and `uat`) · /production-readiness n/a — the skill is not shipped in this repo
- parked: onboarding-orphaned-objects.md, onboarding-double-photo-race.md (the three-files half of the second finding was already parked as onboarding-upload-limit-race.md)
- migrations: skip — check-migrations.sh reads Drizzle's own journal order; 0004 follows main's 0003
- learned: skip — no error.log (3 rules from FAILURE.md reach _shared/project-rules.md through close-out)
- docs: README and AGENTS updated in Build; no docs-tree impact · announce: deferred to promotion
