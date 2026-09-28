# Build notes: reservations-reponse-suspendue

- commits: bfed69d feat — the helper, `reopenFile`'s batch, the test, the dialog sentence, migration 0013, README
- ci: see status.md (the draft head owes nothing; the full gate settles after the ready flip)

## What changed

- `src/lib/reservations/answers.ts`: `reopeningWithdrawsAnswers(profileId, at)` beside `suspensionWithdrawsAnswers` — her `en_attente` answers → `retiree`, guarded by a private `reopenedAtExactly` (her profile is not `valide` and its `updated_at` is exactly `at`), the same "only if this batch did it" shape as `suspendedAtExactly`.
- `src/app/(portail)/espace/professionnelle/actions.ts`: `reopenFile` runs the status update (still guarded on the status it read) and the withdrawal in one `db.batch` with one `now`.
- `src/lib/reservations/reopening.test.ts`: the statement built, never run — her answers only, `en_attente` only, the moved-at guard.
- `src/content/professionnelle.ts`: `reouverture.description` ends with « Vos disponibilités en attente de réponse seront retirées. » (`@relecture`, D-147).
- `drizzle/0013_retrait_reponses_profils_non_valides.sql` (+ journal, snapshot): data-only, idempotent backfill (D-148), generated with `drizzle-kit generate --custom`.
- `README.md` → The answer and the booking: one bullet on a profile leaving `valide`.

## Acceptance criteria status

- [x] Reopen from `valide` → `brouillon` + her waiting answers `retiree`, one transaction — proved on the run's Neon branch (probe: moved 1, withdrew 1).
- [x] Her `non_retenue` and `retiree` answers unchanged — proved by the probe; `retenue` and bookings are outside the WHERE (`status = 'en_attente'`), not probed separately.
- [x] A stale second reopen (status no longer `valide`) withdraws nothing, even with a fresh waiting answer present; another professional's waiting answer on the same request untouched — proved by the probe.
- [x] The family's list, count and lock count only validated professionals' `en_attente` answers (D-85); a `retiree` answer is none of them — by reading, not probed through the family's pages.
- [x] After revalidation her old answer stays `retiree` — proved by the probe; answering again reuses the existing upsert (`status = 'en_attente'`, rate from her profile, `where status = 'retiree'`) — by reading.
- [x] The dialog sentence, `@relecture`; `vitrine.test.ts` is read by the advisory job after the flip.
- [x] Migration 0013 applied to the run's Neon branch (`db:migrate`, `db:verify` 14/14); the probe ran its SQL twice: first 1 row (the non-`valide` profile's), second 0; the `valide` professional's waiting answer untouched.
- [x] `reopening.test.ts` — its assertions checked against the helper's real `toSQL()` output; the suite itself runs in the advisory job.

## Notes for Release

- Migration 0013 is data-only and forward-only: on UAT it runs at the merge's build, on production at the promotion. Nothing to roll back — a withdrawn answer is re-answered by the professional.
- The stub also named `src/lib/admin/review.ts`; it is untouched on purpose (D-146: the founders' review never moves a `valide` file).
- The Vercel previews failed on 2026-09-26 with « Resource provisioning failed » before any build step (see `../../error.log`); if they still do after the flip, that is the blocker, not this diff.

Context budget: loaded `src/lib/auth/suspension.ts` (+ its test, for the built-not-run test pattern), `src/db/index.ts`, `vitest.config.ts`, `scripts/verify-migrations.ts` and the database-migration skill beyond `touches:`.
