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
