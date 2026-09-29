# Decisions: suspension-one-predicate

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- none — no scope run; the epic was cut from the back-office-admin release review (2026-09-25). D-134 (a suspended account opens nothing and is shown to no one) and D-136 (a deleted account stays suspended) are inherited from back-office-admin.

## Made in this run

D-164 was the highest id on `main` and every remote branch on 2026-09-29.

- D-165 — the one enforcement point is the helper in `src/lib/auth/suspension.ts` (`notSuspended`, plus its positive form `suspended`), called by every reader, with a source test refusing the rule written anywhere else; no database view. The operator's choice in Define, 2026-09-29.
- D-166 — readers only: `messageNotice` moves its recipient check into SQL; `currentUser`, the sign-in action, `admin/rules.ts`, `admin/lists.ts` and `admin/accounts.ts` read or write the account's own state and stay as they are, with no `isSuspended()` JavaScript twin. The operator's choice in Define, 2026-09-29.
