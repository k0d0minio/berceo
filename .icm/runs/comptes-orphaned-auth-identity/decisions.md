# Decisions: comptes-orphaned-auth-identity

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — no scope run; the epic was cut from the comptes-neon-auth release review (2026-09-24). D-34 (an address that already has an account reads exactly like a new one, as `actions.ts` cites it) stands.

## Made in this run

Renumbered at Build (2026-09-29): D-161, provisional at Define, collided with `claude/adoring-dijkstra-o6099q` (D-161–D-164) and was D-165 at Build; renumbered again at Release (2026-09-29) to D-171, when `comptes-welcome-email-no-retry` landed D-165 on `main` first. D-159 and D-160 were free on every remote branch.

- D-159 — when the `users` + consents batch fails after Neon Auth created the identity, `signUp` deletes that identity at once (guarded, logged if it fails) rather than leaving it for a retry. The operator's choice in Define, 2026-09-29.
- D-160 — a sign-up retry that meets an orphan identity deletes it and signs up again from the submitted form, rather than writing a row onto the existing identity: nobody can attach a role, name or phone to an identity whose password they do not hold. The operator's choice in Define, 2026-09-29.
- D-171 — a sign-in or verification link that meets an orphan shows a new line asking the person to sign up again with the same address, rather than rebuilding the row from role and phone stored on the Neon identity. The operator's choice in Define, 2026-09-29.
- D-172 — an identity with no `users` row is replaced on a retry only once it is older than five minutes (`neon_auth."user"."createdAt"`; no `maxDuration` is set, so a sign-up may run that long): a younger one may be a sign-up still writing its row (a second tab, a resubmitted form), and deleting it would join that row to nothing and lock the address out. Inside the grace the form answers a new line, `inscriptionEnCours` (« Réessayez dans quelques minutes »), never the verification redirect, which would be a false success. Found by Release's code review and its re-review, 2026-09-29; in-ticket. Numbered D-169 when written; renumbered D-172 at Release after the merge of `main`, D-170 being the highest on every remote branch.
