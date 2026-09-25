# Build notes: demande-de-garde

- commits: c4ac24f (schema + migration), e83cd9c (rules, wording, validation), 4fce3c7 (data module, urgent e-mail, digest), 06230d4 (family pages, professional list), a8d5e45 (digest route, schedule, env, docs)
- ci: GREEN on 1d28ea4 (full gate: Vercel preview pass, Quality (advisory) pass); draft 5f5cff6 GREEN; format.sh and lint.sh not wired (SKIP)

## What changed

- `src/db/schema.ts`, `drizzle/0005_care_requests.sql` (was 0004 before the merge of main): `care_requests` with `care_request_status`, `care_request_children`, `baby_age_unit`; checks on the start-time slots, the age ranges and `cancelled_at`; a partial unique index for one open request per family and night; the digest's partial index.
- `src/lib/demandes/rules.ts`: the pure rules in Brussels time (date windows, start times, age ranges, a night started, end = start + 11 h, the digest's 18:00 gate, the family's derived « passée »).
- `src/lib/demandes/validation.ts`, `format.ts`: the form's checks; the card's wording (age in words, « d' » before un/une).
- `src/lib/demandes/requests.ts`: every read and write of `care_requests`; the family's functions scoped to her own rows; `cardColumns` is all a professional's query selects; the commune is copied through `familyCommune()` so `src/lib/famille/` stays the only reader of `family_profiles`.
- `src/lib/demandes/notify.ts`: the urgent e-mail (in `after()` from the publish action) and the daily digest.
- `src/app/api/cron/demandes-digest/route.ts`: POST, bearer `CRON_SECRET` compared in constant time, 401 when unset.
- `.github/workflows/demandes-digest.yml`: 16:00 and 17:00 UTC + `workflow_dispatch`, UAT and production, skips an environment whose secret is missing.
- Pages: `espace/famille/demandes/` (list, `nouvelle`, `[id]`, `[id]/modifier`, actions), `espace/professionnelle/demandes/`; both publish buttons on the family's home; a « Voir les demandes disponibles » button on a validated professional's home; `SpaceShell` gains « Mes demandes » and « Demandes »; the profile page shows « Complétez votre profil » on `?completer=1`.
- Words: `src/content/demandes.ts` (new), `emails.ts` (two e-mails), `comptes.ts` (two nav labels; the unused « vide » line of the family's home removed).
- Tests: rules, validation, format, requests' columns, notify (mocked db and Resend), the route, the templates, the catalogue, routing.
- Docs: README « The care request » and the schema line; AGENTS routing row and data-model row; `.env.example` → `CRON_SECRET`.

## Acceptance criteria status

- [x] Phone path to a published normal request — the form asks date, start, children, age and the checkbox only; single-column layout, capsule fields, no fixed widths over 360 px. Smoke on the preview.
- [x] The guide's title, subtitle, labels and notes verbatim; commune read-only with the address note and a profile link — `demandes.test.ts` holds the words.
- [x] Checkbox required; the tick is stored as `no_medical_condition_at` — `validation.test.ts`.
- [x] Normal window: today, tomorrow and day 57 refused, day 2 and day 56 accepted, Brussels time — `rules.test.ts`, `validation.test.ts`.
- [x] « Publier une demande urgente » on the home and on « Mes demandes »; tonight or tomorrow only; a passed start refused; the guide's urgent message after publication — tests + `[id]/page.tsx` (`?publiee=urgente`).
- [x] Start time, age and children refused by the action and by the database checks / enum.
- [x] A second open request for the same night → field error on the date (partial unique index, `23505` → `doublon`).
- [x] No commune → `/espace/famille/profil?completer=1` with « Complétez votre profil ».
- [x] « Mes demandes » lists night, commune, children, urgency, status; edit of date, start, children, age; commune and urgency not editable.
- [x] Cancel through the confirmation dialog (red/green, D-24); « Annulée »; not editable; out of every professional's list (status filter).
- [x] A started night reads « Passée », cannot change, and is on no professional's list (`nightAhead` in SQL, `isChangeable` in code).
- [x] Another family's request: not found; the user id is the session's (`ownRequest` / `changeable` scope every write).
- [x] Validated professional serving the commune sees the card, urgent first then newest; other communes do not; a non-validated profile sees the line.
- [x] No family identity on the card or in the query — `requests.test.ts` holds `cardColumns`.
- [x] Urgent e-mail at once to every validated professional of the commune; a failure is logged and the request stays — `notify.test.ts`.
- [x] Digest route: 401 without the secret, nothing before 18:00, one e-mail per professional after, marked so a second call sends nothing — `route.test.ts`, `notify.test.ts`.
- [x] Cancelled, urgent and started requests never in a digest (the claim's WHERE); no request → no e-mail.
- [x] The workflow runs at 16:00 and 17:00 UTC and on demand, calls both environments, skips a missing secret with a warning.
- [x] The migration is drizzle-kit's (`0004_care_requests`), journal stamps in order; the preview applies it through `vercel-build` with `db:verify`.
- [x] Deleting a family's user deletes her requests (`on delete cascade`).
- [x] Rules tests: both windows at their edges in Brussels time, slots, ages, end time, children wording, the 18:00 gate in summer and winter.
- [x] Every word in `src/content/`, `@relecture Surya` on everything not quoted from the guide; catalogue tests on the new file.
- [x] `routing.test.ts` covers the new family and professional paths.
- [x] README « The care request », AGENTS routing row, `.env.example` → `CRON_SECRET`.

## Notes for Release

- **Merged main after #39 (verification-back-office):** its migration took `0004`, so this run's migration was regenerated on the merged tree as `drizzle/0005_care_requests.sql` (same SQL). Its decisions D-50 to D-59 collided with this run's, now D-60 to D-68. Main already declares `CRON_SECRET` for its purge cron; both routes read the one value (D-68), and `.env.example` declares it once.

- **D-66 is a spec gap:** the digest's idempotency key adds a hash of the request ids to the spec's `digest-<professional>-<day>`, and requests are claimed before sending (a failed send is not retried). Reviewers should check the claim-then-send trade-off.
- Editing a normal request re-applies its window from the day of the edit, as the spec says: a request made for the day after tomorrow cannot be edited the next day without moving its date later. Flag it to the founders if they find it odd.
- `CRON_SECRET` is missing on Vercel (`env.sh audit --changed` → GAPS 1): the route answers 401 until the operator sets it on each environment, and the workflow skips both calls until the repository secret `CRON_SECRET` exists in GitHub, one value for all (D-68). Nothing else depends on it.
- **D-68 is a change after approval:** the spec's Proposed change and its workflow criterion still name `CRON_SECRET_UAT` / `CRON_SECRET_PRODUCTION`; the operator chose one shared `CRON_SECRET` after Build. The code, workflow, README and `.env.example` follow D-68.
- The professional's list can only be smoke-tested with a profile set to `valide` by hand on the preview's Neon branch, until verification-back-office merges.
- `format.sh` and `lint.sh` are not wired in this repo (SKIP): the post-flip advisory quality job is the first lint/typecheck/test read of this code.
- Context budget: read the family-profile and onboarding code (forms, shell, guard, templates, tests) as patterns, beyond `touches:`.
