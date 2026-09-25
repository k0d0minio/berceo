# Plan: cycle-de-garde-et-annulation

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `src/db/schema.ts` (the three enums, the `bookings` columns and
   checks, `bookings_profile_night_key` made partial on `status = 'confirmee'`, the two partial
   indexes), `npm run db:generate -- --name cycle-de-garde`, commit `drizzle/` — done when: the
   migration applies on a fresh branch database and every existing booking reads `confirmee`.
2. **The garde's rules** — new `src/lib/gardes/rules.ts` (+ test): the derived state (à venir, en
   cours, terminée, annulée) from `(status, nightDate, startTime, now)`, `canCancel` (before the
   start hour), `canReportAbsence` (start hour to start + 35 h), `canRepublish` (annulée, night not
   started), the reminder window (10:00 to 10:59 Brussels) and the night the reminder targets —
   reusing `hasNightStarted` / `hasNightEnded` / `brusselsNow` — done when: the tests cover each
   hour boundary in summer and winter time.
3. **The writes** — `src/lib/gardes/` server functions: `cancelGarde` and `reportAbsence` (one
   statement: booking `annulee` + request `annulee` through `src/lib/demandes/`, first write wins),
   then `refundFee(…, "annulation_professionnelle")` after commit on a professional's
   cancellation; `republishFromGarde` through `publishRequest`; the reads the garde pages need
   (state, who cancelled, the fee's status via `src/lib/paiements/`); `bookingAddress` limited to
   a confirmed garde whose night has not ended (+ address-guard cases) — done when: the rules'
   refusals hold server-side and a double cancel writes once.
4. **The words and the e-mails** — new `src/content/gardes.ts` (+ `gardes.test.ts`), the e-mail
   entries in `src/content/emails.ts` (cancellation both ways, absence, reminder both sides, the
   platform line added to both confirmations), templates in `src/lib/email/templates.ts`, the
   notify calls with their idempotency keys — done when: the catalogue tests pass and each e-mail
   is rendered from the catalogue only.
5. **The pages** — the state badge on the family's « Mes réservations » list and page, her
   request page, the professional's « Mes gardes » list and page; the cancel and absence buttons in
   `src/components/gardes/` over `confirm-dialog.tsx`; the cancelled lines and the fee line; the
   republish button — done when: each acceptance criterion on the pages is observable on the
   preview.
6. **The founders' list** — `/admin/absences` (admins only, noindex) and the link with its count on
   the admin home — done when: a reported absence shows there with its fee status; a non-admin
   gets not-found.
7. **The reminder** — `/api/cron/gardes-rappel` (the digest route's guard and shape: claim the
   bookings by setting `reminder_sent_at`, then send) and `.github/workflows/gardes-rappel.yml`
   (08:00 and 09:00 UTC, UAT and production, skipped with a warning without `CRON_SECRET`) — done
   when: a second call sends nothing and a call outside the window sends nothing.
8. **Docs** — README (the garde's life, the routing of `src/lib/gardes/`), AGENTS.md routing row
   — at Release.

## Risks

- The partial unique index: a migration that drops and recreates `bookings_profile_night_key`
  must keep the name the code's unique-violation handling matches on (`acceptAnswer`); signal: a
  same-night double booking no longer maps to its refusal message.
- Refund after commit: a Stripe error must leave the cancellation standing and the payment `payee`
  (« Remboursement en cours »); signal: a cancellation rolled back by a thrown refund.
- Time zones: the derived state and the reminder window must use Brussels time at the DST change;
  signal: a rules test at the last Sunday of October or March failing.
- The request becoming `annulee` also triggers anything that reacts to a cancelled request
  (declined answers, `isChangeable`): the family must not see the request-level « Annuler » or
  « Republier » of `src/lib/demandes/` on it, only the garde's republish.
