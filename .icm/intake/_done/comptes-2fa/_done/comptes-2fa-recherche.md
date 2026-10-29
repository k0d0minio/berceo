# Stub: The build knows how a second factor works with Neon Auth

- feature-slug: comptes-2fa-recherche
- epic: comptes-2fa
- sequence: 1 of 2
- depends-on: none
- complexity: research
- priority: P1

## Problem

The devis sells a second factor for professionals and founders. The accounts are Neon Auth
(Managed Better Auth). The repo does not know what the managed service offers, which pages the
SDK brings, where the secret and the recovery codes live, and how many steps a sign-in with a
factor takes.

## Proposed change

Investigate, then cut. Read Neon Auth's documentation and `@neondatabase/auth` 0.5.0-beta for a
second factor: TOTP, a code by e-mail, recovery codes, the switch per Neon branch, the SDK
calls and the UI. Try it on the Neon Auth of a preview branch. Write the decision under Notes.
Re-cut `comptes-2fa-professionnelles-fondatrices` when the decision changes it. Build nothing
in this stub.

## Acceptance criteria

- [ ] A written decision under Notes, approved by Jamie: the factor, the enrolment moment, the recovery path, the config to set on each Neon branch.
- [ ] `comptes-2fa-professionnelles-fondatrices` names the files, the SDK calls and the config the build needs.
- [ ] The breakdown's questions carry Jamie's answers.

## Out of scope

- The build.

## Notes

### Findings (2026-10-29)

1. Neon Auth has no managed second factor. The page "Managed Better Auth roadmap" (https://neon.com/docs/auth/roadmap) lists "MFA support" as "Coming soon".
2. `@neondatabase/auth` 0.5.0-beta agrees. Its client plugins are `adminClient`, `emailOTPClient`, `jwtClient`, `magicLinkClient`, `organizationClient` and `phoneNumberClient`. It has no `twoFactorClient`. Its UI package exports `TwoFactorCard` and `TwoFactorForm` from Better Auth UI, but no server plugin answers them.
3. The Neon Auth config of the UAT base (`uat-berceo`, branch `main`) has no setting for a second factor. It holds `email_password` only, with `email_verification_method: link`.
4. The Email OTP plugin is a sign-in method of its own. It opens a new session. It does not add a step after the password. The site does not need it.
5. This pull request has no migration. So it has no `preview/<branch>` Neon branch, and the research changed no Neon config.
6. `getAuth().getSession()` returns `data.session` and `data.user`. The site's sign-in is its own server action, `signIn` in `src/app/(auth)/actions.ts`. So the site controls the step after the password.

### Decision (Jamie's answers, 2026-10-29)

- **The factor:** a six-digit code by e-mail. The site makes it, sends it through Resend and checks it. Neon Auth does not see it.
- **Who:** the roles `professionnel` and `admin`. A `parent` is never asked.
- **The moment:** after a correct password, when the device is not trusted. An existing session of a professional or a founder asks the code on its next page after the merge.
- **No enrolment step.** The mailbox is already verified at sign-up. So the first sign-in after the merge is the first code.
- **A trusted device:** a correct code trusts the device for 30 days. The verification link of a new sign-up also trusts the device, because the link proves the mailbox. A trusted device skips the code, never the password.
- **The code:** six digits from `crypto.randomInt`. The site stores its SHA-256 hash, never the code. It lives 10 minutes. Five wrong tries end it. A new code replaces the old one. The site sends at most one code per 60 seconds per account.
- **Recovery:** the existing password reset. The mailbox is the factor, so no recovery code exists. A founder who loses access to the mailbox asks Legible for help.
- **Config on each Neon branch:** none. No new environment variable.
- **Out of the decision:** a TOTP app. A later round can add it when Neon ships MFA.
