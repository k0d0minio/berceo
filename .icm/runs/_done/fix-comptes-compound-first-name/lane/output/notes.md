# Bug: fix-comptes-compound-first-name

- observed: the first verification e-mail for "Marie Claire Dupont" opens "Bonjour Marie," ·
  expected: it opens "Bonjour Marie Claire,"
- cause: `src/lib/auth/webhook.ts`'s `prenomFor()` falls back to the name given to Neon Auth
  only when the `users` row is not written yet (true for every sign-up's first e-mail, since the
  row lands after Neon Auth answers). The fallback split that name on whitespace, so a compound
  first name lost everything after its first word.
- fix: `src/app/(auth)/actions.ts`: `signUp.email({ name })` now sends `"${firstName}|${lastName}"`
  instead of a space-joined string; `src/lib/auth/webhook.ts`'s `prenomFor()` now splits on `|`
  (the part before it is always the first name whole) instead of whitespace.
- changelog: announce: none (this repo declares no changelog page)
- learned: none
