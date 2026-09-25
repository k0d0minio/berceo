# Stub: A failed digest e-mail is never re-sent

- lane: bug
- found-by: demande-de-garde release review · 2026-09-25
- complexity: medium

## Problem

`sendRequestDigest` (`src/lib/demandes/notify.ts`) claims the day's normal requests
(`digest_sent_at`) before sending, so two calls never send the same request twice (D-66). When the
send to one professional fails, the failure is logged and counted, but her requests are already
marked: no later digest carries them, and she only sees them if she opens her list.

## Proposed change

Record a failed send per professional (a small `digest_failures` row, or a per-recipient ledger)
and retry it on the next digest call, or send per professional first and mark only what was
delivered to every recipient. Keep the one-digest-a-day rule (D-61) and the claim's protection
against two calls racing.

## Acceptance criteria (rough)

- [ ] A digest whose send to one professional fails reaches her on a later call, without a
      second e-mail to the professionals who already got it.
- [ ] Two calls racing still never send one request twice.

## Out of scope (this feature)

- Retrying the urgent e-mail (sent once, in `after()`).

## Notes for Define

D-61 (urgent at once, the rest in a daily digest), D-66 (claim before send, idempotency key per
professional, day and set of requests). touches: src/lib/demandes/notify.ts,
src/lib/demandes/requests.ts, possibly src/db/schema.ts + drizzle/.

## Prompt

In the berceo repo, read `.icm/intake/triage/demandes-digest-failed-send-no-retry.md`. The daily
digest of care requests marks its requests before sending, so a failed send to one professional is
never retried. Make a failed recipient's digest reach her on a later call without re-sending to the
others, keeping one digest a day. Run it through `/pipeline bug demandes-digest-failed-send-no-retry`.
