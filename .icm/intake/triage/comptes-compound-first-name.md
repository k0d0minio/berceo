# Stub: The first verification e-mail truncates compound first names

- lane: bug
- found-by: comptes-neon-auth release review · 2026-09-24
- complexity: low

## Problem

`src/lib/auth/webhook.ts` greets with the first word of the full name when the users row is not
written yet (the webhook fires during sign-up), so "Marie Claire Dupont" gets "Bonjour Marie,".

## Proposed change

Keep the first name recoverable from Neon's user (e.g. store `name` as "Prénom|Nom" or pass the
first name another way), or greet without a name when the row is missing.
