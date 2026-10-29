# Stub: A professional and a founder give a second factor at each sign-in

- feature-slug: comptes-2fa-professionnelles-fondatrices
- epic: comptes-2fa
- sequence: 2 of 2
- depends-on: comptes-2fa-recherche
- complexity: high
- priority: P1

## Problem

A password alone opens a professional's file and the founders' back-office.

## Proposed change

After `comptes-2fa-recherche`: a professional enrols a second factor before her space opens,
at her first sign-in after the merge or right after step 1 of a new sign-up. A founder does the
same before `/admin` opens. Each later sign-in asks the factor after the password. Recovery
codes are shown once, at enrolment. A family is not asked.

## Acceptance criteria

- [ ] A professional without a factor is sent to the enrolment page before any page of her space, and her file's state does not change.
- [ ] A founder without a factor cannot open `/admin`.
- [ ] A sign-in of an enrolled account asks the factor after the password and refuses a wrong one.
- [ ] A lost factor is recovered with a recovery code.
- [ ] A family signs in with her password only.
- [ ] The words follow the guide and are tagged `@relecture`.

## Out of scope

- Families.
- A founder's reset of a professional's factor from the back-office. Cut it when the research says how.

## Notes

- The research stub's Notes hold the decision. Read them first.
- The redirect sits beside the declarations one in `src/lib/auth/guard.ts`.
