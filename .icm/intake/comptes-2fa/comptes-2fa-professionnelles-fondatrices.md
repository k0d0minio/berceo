# Stub: A professional and a founder give a code sent by e-mail at sign-in

- feature-slug: comptes-2fa-professionnelles-fondatrices
- epic: comptes-2fa
- sequence: 2 of 2
- depends-on: comptes-2fa-recherche
- complexity: high
- priority: P1

## Problem

A password alone opens a professional's file and the founders' back-office.

## Proposed change

After the password, a professional and a founder type a six-digit code. Berceo sends the code
to the account's e-mail address. A correct code trusts the device for 30 days. A trusted device
asks the password only. A family is never asked.

## Acceptance criteria

- [ ] A professional who signs in on a new device gets an e-mail with a six-digit code, and her space opens only after she types it.
- [ ] A founder who signs in on a new device cannot open `/admin` before she types the code.
- [ ] A wrong code is refused. After five wrong codes, the code is dead and the page offers a new one.
- [ ] A code older than 10 minutes is refused.
- [ ] « Renvoyer le code » sends a new code, at most once per 60 seconds.
- [ ] After a correct code, the next sign-in on the same device within 30 days asks the password only.
- [ ] A professional or a founder with an open session at the merge is asked the code on her next page.
- [ ] A new professional who clicks the verification link of her sign-up is not asked a code on that device.
- [ ] A family signs in with her password only.
- [ ] A professional's file state does not change at any step.
- [ ] The words follow the guide and are tagged `@relecture`.

## Out of scope

- Families.
- A TOTP app. Neon Auth lists MFA as coming soon.
- A list of trusted devices, or « Oublier cet appareil ». A later stub can add them.
- The purge of old code rows and expired devices. The rows are small. A later chore can add them to the existing cron.

## Notes

- The decision is in `_done/comptes-2fa-recherche.md` § Notes. Read it first.
- **No Neon config.** No Neon branch needs a change. No new environment variable.
- **No new SDK call.** The build uses `getAuth().signIn.email`, `getAuth().getSession()` and `getAuth().signOut()`, as today. The site makes, sends and checks the code itself.
- **The schema** (`src/db/schema.ts`, then `npm run db:generate -- --name second-factor`). The migration makes `preview-db.yml` cut `preview/<branch>` for the pull request.
  - `sign_in_codes`: `id`, `user_id` (FK `users`, on delete cascade), `code_hash` (SHA-256, hex), `attempts`, `expires_at`, `created_at`. One live row per user: a new code deletes the older rows.
  - `trusted_devices`: `id`, `user_id` (FK `users`, on delete cascade), `token_hash` (SHA-256 of a random 32-byte token), `expires_at` (30 days), `created_at`.
- **The cookie** `berceo-appareil` holds the raw device token. It is `httpOnly`, `secure`, `sameSite=lax`, `path=/`, with a 30-day `maxAge`. The database holds only its hash. A device that serves two accounts keeps the last one only.
- **The rule is written once.** `src/lib/auth/second-factor.ts` holds the pure rules, with a test: who needs a code (`professionnel`, `admin`), the code's life, the tries and the resend gap. `src/lib/auth/second-factor-store.ts` holds the only reads and writes of the two tables.
- **The gate is `currentUser()`** (`src/lib/auth/current-user.ts`). It returns a new status, `needs-code`, for a professional or a founder with no valid trusted device for her own user. Every page, action and route that asks `currentUser()` then refuses her. One read of `trusted_devices` per request, for these two roles only.
- **The redirect** sits in `requireAccess` (`src/lib/auth/guard.ts`), beside the declarations one. `needs-code` goes to `/connexion/code`, with the way back (`signInWithReturn`'s `retour`). The row says the role, so a founder sent there from `/admin` learns nothing new.
- **The sign-in** (`signIn` in `src/app/(auth)/actions.ts`). After a correct password, a professional or a founder with no trusted device gets a code. The action sends it, then redirects to `/connexion/code`. When the e-mail fails, the page still opens and offers « Renvoyer le code ».
- **The code page** is `src/app/(auth)/connexion/code/` (page and form). Its actions `verifySignInCode` and `resendSignInCode` go in `src/app/(auth)/actions.ts`. A correct code writes the trusted device and sets the cookie, then lands on `landingFor(role, retour)`. A visitor who is not `needs-code` goes to her space or to `/connexion`. The page offers « Se déconnecter ».
- **The verification link** (`src/app/(auth)/verification-email/confirmer/route.ts`) writes a trusted device and sets the cookie on its response, for a professional. The link proves the mailbox, as a code does.
- **The e-mail** is `signInCodeEmail` in `src/lib/email/templates.ts`, words in `src/content/emails.ts`. It is sent with `sendEmail` (`src/lib/email/send.ts`). The page's words go in `src/content/comptes.ts`. All new words carry `@relecture`.
- **A password reset does not end the trust.** A trusted device skips the code, never the password.
- **README → Accounts and e-mail** gets the code, the trusted device and the two tables.
