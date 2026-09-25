# Build notes: cycle-de-garde-et-annulation

- commits: 0b7e001 (schema + migration 0010), 515e7f0 (the garde's life: rules, writes, words, e-mails, pages, admin list, reminder route and workflow), then the run files
- ci: see status.md (settled by `ci-status.sh` after the ready flip)

## What changed

- `src/db/schema.ts`, `drizzle/0010_cycle_de_garde.sql`: enums `booking_status`, `booking_side`, `cancellation_kind`; `bookings` gains `status` (default `confirmee`), `cancelled_at`, `cancelled_by`, `cancelled_by_user_id`, `cancellation_kind`, `reminder_sent_at`, two checks, two partial indexes; `bookings_profile_night_key` is now partial on `status = 'confirmee'` (same name). Applied on the run's Neon branch (a UAT copy).
- `src/lib/gardes/rules.ts` (+ test): the state by the clock (D-109), `canCancel` (D-105), `canReportAbsence` (D-106), `canRepublish` (D-107), `isAddressVisible` (D-110), `feeLine` (D-2), the reminder hour and night (D-108). Tests cover each boundary in summer and winter time.
- `src/lib/gardes/gardes.ts`: `cancelGarde`, `reportAbsence` (one batch each: the booking, then the request through `cancelBookedRequestStatement` in `src/lib/demandes/requests.ts`), the refund of a professional's cancellation after commit (`refundFee`, `annulation_professionnelle`), `republishGarde` (through `publishRequest`), `claimReminders`, `gardeNotice`, `reportedAbsences`, `absenceCount`. Every rule is held again in the SQL of its write.
- `src/lib/gardes/notify.ts`: cancellation, absence and reminder e-mails with idempotency keys `garde-annulee-<id>`, `garde-absence-<id>`, `garde-rappel-<id>-famille|professionnelle`.
- Same-night checks now count confirmed gardes only (`src/lib/demandes/requests.ts` ×2, `src/lib/reservations/answers.ts` ×2), so a cancelled garde frees the professional's night.
- `src/lib/famille/profile.ts`: `bookingAddress` returns the address only on a confirmed garde whose night has not ended.
- `src/lib/reservations/bookings.ts`: both sides' reads carry the garde's status columns; `bookingOfRequest` returns id and status.
- `src/lib/paiements/payments.ts`: `bookingFees(bookingIds)`, the read of a booking's fee.
- Words: `src/content/gardes.ts` (all `@relecture`), `emails.ts` (the platform line `cadre` and five e-mails), `admin.ts` (`absences`, `lienAbsences`), `reservations.ts` (« Mes gardes » intro now says the address shows until the night ends). E-mail templates in `src/lib/email/templates.ts`; the platform line sits under the button (`note`) of both confirmations and both reminders.
- Pages: state marks on both lists, both garde pages and the family's request page; « Annuler la garde », « Signaler une absence », « Republier ma demande » (or the link to her open request that night) through `src/components/gardes/garde-dialogs.tsx`; actions in `espace/famille/reservations/actions.ts` and `espace/professionnelle/gardes/actions.ts`.
- `/admin/absences` (read-only, `src/components/gardes/absences-table.tsx`) and the link with its count on `/admin`.
- `/api/cron/gardes-rappel` (the digest route's guard; sends only 10:00–10:59 Brussels) and `.github/workflows/gardes-rappel.yml` (08:00 and 09:00 UTC, UAT and production; a 404 is a skip, D-113).

## Acceptance criteria status

- [x] State by the clock on both lists and pages; annulée at any hour — `gardeState`, tested at each boundary, summer and winter; rendered with `GardeStateMark` on both lists, both garde pages and the request page.
- [x] Either side cancels until the start hour through the red dialog; refused after — button shown on `canCancel`; the SQL holds `(night_date + start_time) > now` in Brussels. Proved on the fixture: a started garde refused, a stranger refused.
- [x] Professional's cancellation: booking and request annulées, `professionnelle`, user, moment, `refundFee` — proved on the fixture (without a Stripe key the refund threw, was logged, and the cancellation stood with the fee `payee`, which the family's page reads « Remboursement en cours »). The Stripe refund itself is proved on the preview only.
- [x] Family's cancellation: `famille`, no refund, « restent acquis » line — `feeLine` tested; the write is the same statement.
- [x] One e-mail to the other side; one cancellation on a double click — the second write returns ok:false (proved), so only the first call sends; the idempotency key covers a retried send.
- [x] Conversations close and stay readable; address hidden after cancellation and after the night — the request becomes `annulee` (existing D-89 rule); `bookingAddress` returned null on the cancelled and on the ended garde of the fixture, the address on the confirmed one.
- [x] Absence: window, absent side as `cancelled_by`, kind `absence`, one e-mail, no refund, `/admin/absences` with the fee — proved on the fixture (a not-started garde refused, a second report refused); non-admins get not-found through `accessFor` on `/admin/*`.
- [x] Republish: a new open request for the same night; a second call returns the existing one, which the page links — proved on the fixture; an urgent one is e-mailed at once, a normal one waits for the digest (`digest_sent_at` null).
- [x] A cancelled garde frees her night — the partial unique index, and the four same-night checks filtered on `confirmee`.
- [x] Reminder route: window, secret, once — `isReminderTime` tested; `claimReminders` proved (first call claimed tomorrow's garde, the second none).
- [x] The platform line in both confirmations and both reminders only, no insurance wording — templates test.
- [x] Bookings made before the migration read `confirmee` — the column's default.
- [x] Every new word in `src/content/`, `@relecture` — `gardes.test.ts` (rules, the 3 % only, a tag per entry).

## Notes for Release

- Tests and typecheck were written, not run (AGENTS.md: CI is the source of truth); the advisory job on the ready head is their first run.
- The spec's `touches:` named `src/lib/reservations/format.ts`, `src/lib/demandes/rules.ts` and `src/lib/paiements/rules.ts`: none needed a change. It did not name `src/lib/reservations/answers.ts` (same-night check) nor `src/app/(portail)/espace/famille/reservations/actions.ts` / `espace/professionnelle/gardes/actions.ts` (new, under the named globs) — the first is the one file outside `touches:`, needed so a cancelled garde frees the night (criterion 9).
- D-112 is a spec gap: the republished request takes the profile's commune (D-63), as every publication does.
- `address-guard.test.ts` holds columns, not rows, so the new gate is covered by `isAddressVisible` in `src/lib/gardes/rules.test.ts` and held in `bookingAddress`'s SQL, not by that test (the spec said the guard test gains both cases).
- README (« The answer and the booking », « The service fee », a new « The garde's life ») and the AGENTS.md routing row for `src/lib/gardes/` are Release's.
- `CRON_SECRET` is already set for the digest; the new workflow reuses it. No new env key.
- The run's Neon branch carries a throwaway fixture (three gardes, one fee, one republished request) on top of the UAT copy; it expires with the branch.
- Decision-id collision with avis-etoiles (see decisions.md).

Context budget: read `src/lib/demandes/requests.ts`, `src/lib/reservations/{bookings,answers,notices,notify}.ts`, `src/lib/email/templates.ts`, the admin pages and the digest workflow beyond the spec's `touches:` files, to reuse their patterns.
