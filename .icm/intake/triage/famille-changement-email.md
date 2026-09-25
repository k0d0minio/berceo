# Stub: A family cannot change her account's e-mail

- lane: chore
- found-by: profil-famille define · 2026-09-24
- complexity: standard
- priority: P2
- blocked: Neon Auth does not support changing an account's e-mail (its user-management guide says so, and its webhook has no change-email event); check neon.com/docs/auth/guides/user-management before picking this up

## Problem

The family's profile (`/espace/famille/profil`) shows the e-mail read-only. Neon Auth (Managed
Better Auth, `@neondatabase/auth` 0.5.0-beta) does not support changing an account's e-mail
address: its user-management guide says "Email address changes are not currently supported", and
its webhook has no change-email event. A family whose address changes has no way to move her
account. comptes-neon-auth had already deferred e-mail change with the rest of RGPD self-service.

## Proposed change

Once Neon Auth supports it: a confirmation link sent to the new address (through the existing
Neon Auth webhook and Resend templates, D-30: links, not codes), the Neon Auth identity and the
`users.email` row changing only after that link is followed, a notice to the old address, and the
read-only line on the profile page replaced by the edit. Same flow for professionals. Check Neon's
changelog before starting; until it ships, this stub stays parked.

## Prompt

In the berceo repo, read `.icm/intake/triage/famille-changement-email.md`. First check whether Neon Auth now supports changing a user's e-mail (neon.com/docs/auth/guides/user-management). If it does, build the change-email flow: a confirmation link to the new address through the existing Neon Auth webhook and Resend templates, `users.email` updated only after confirmation, a notice to the old address, and the edit on `/espace/famille/profil` (and the professional's equivalent). If it does not, stop and say so. Run it through `/pipeline chore famille-changement-email`.
