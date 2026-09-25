# Stub: Two edges of the rating invitation's claim

- lane: bug
- found-by: avis-etoiles release review · 2026-09-25
- complexity: low

## Problem

`sendInvitations` in `src/lib/avis/notify.ts` claims a side in `rating_invitations`, then sends.
Two edges:

- **A failed release loses the invitation.** When the send fails and `releaseInvitation` also
  fails (a database error), the claim row stays, so that side is never invited. Only a log line
  records it.
- **A vanished booking counts as sent.** When `gardeNotice` returns null between the claim and the
  send (the booking was deleted), `invite` returns quietly, the pass counts it in `sent`, and the
  claim stays.

Neither sends a wrong e-mail. The first can drop one invitation; the second skews the route's
count.

## Proposed change

Make `invite` return whether it sent anything, count only real sends, and release the claim when
nothing went out. For a release that fails, either retry it once or let the next pass re-owe a claim
that has no matching send (decide in the lane). Keep the
claim-before-send, release-on-failure shape (the learned rule from cycle-de-garde).

## Prompt

In the berceo repo, read `.icm/intake/triage/avis-invitation-claim-edges.md` and `src/lib/avis/notify.ts`. Make a vanished booking count as not sent and release its claim; make a failed release recoverable (one retry, or a rule that re-owes a stale claim). Extend `src/lib/avis/notify.test.ts`. Run it through `/pipeline bug avis-invitation-claim-edges`.
