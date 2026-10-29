# Breakdown: A second factor at sign-in for professionals and founders

- epic-slug: comptes-2fa
- source: the devis of 27 August 2026 (house, `clients/berceo/quote/quote.md`, « Les comptes »: « double authentification pour les professionnelles et pour vous ») and the answers [10.9] (`.icm/docs/berceo-answers.pdf`), taken into V1 by Jamie on 2026-10-29 after the UAT review

## What I understood

The devis sells a second factor at sign-in for the professionals and for the founders. The
founders want it mandatory for both, because the professionals' files and the back-office hold
personal data, as long as it does not weigh too much on the sign-up (the answers [10.9]).
Families are not named. The accounts are Neon Auth, Managed Better Auth, through
`@neondatabase/auth` 0.5.0-beta. Nothing in the repo reads a second factor today. Whether the
managed service offers one (a TOTP app, a code by e-mail), where the secret and the recovery
codes live, and how its pages reach the site's own design are not known. The cut starts with a
research stub.

The research answered it on 2026-10-29. Neon Auth has no managed second factor ("MFA support:
Coming soon"). The site sends and checks its own six-digit code by e-mail. The decision is in
`_done/comptes-2fa-recherche.md` § Notes.

### Questions for Jamie

1. Mandatory for every professional at her next sign-in, or only for new sign-ups? Default: every professional, at her first sign-in after the merge, before her space opens.
   Answer (Jamie, 2026-10-29): the default.
2. The factor: a TOTP app, or a six-digit code by e-mail? Default: what Neon Auth offers. A TOTP app first. A code by e-mail when that is the only managed option.
   Answer (Jamie, 2026-10-29): a six-digit code by e-mail, made and checked by the site. Neon Auth offers no factor. A correct code trusts the device for 30 days.
3. Families: nothing? Default: nothing in this epic.
   Answer (Jamie, 2026-10-29): the default.

## Build order

1. comptes-2fa-recherche — what Neon Auth offers, how the site enrols and checks a factor, the re-cut of stub 2 — depends-on: none
2. comptes-2fa-professionnelles-fondatrices — a professional and a founder give a code sent by e-mail at sign-in, once per device for 30 days — depends-on: comptes-2fa-recherche

## Out of scope

- A second factor for families.
- A TOTP app. Neon Auth lists MFA as coming soon. A later round can add it when Neon ships it.
- Identity checks (D-5), references, the criminal-record extract (the agreement, section 9).
- A phone verification by SMS (the devis, « téléphone vérifié »). Jamie left it for a later round on 2026-10-29.
