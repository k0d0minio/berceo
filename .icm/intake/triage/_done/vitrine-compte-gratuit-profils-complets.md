# Stub: The public pages say a subscription opens the full profiles, not a free account

- lane: tweak
- found-by: the UAT review of 2026-10-29 · 2026-10-29
- complexity: low
- priority: P1

## Problem

Four lines still promise the full profiles to a free family account. `abonnements-acces` put
the full profile, the contact and the requests behind an active subscription.

1. `src/content/faq.ts:72`, « Faut-il créer un compte ? »: « La création d'un compte famille est gratuite et vous donne accès aux profils complets des professionnelles. »
2. `src/content/recherche.ts:104`, the public teaser: « Avec un compte famille gratuit, vous voyez son profil complet… »
3. `src/content/recherche.ts:106`, its button: « Créer mon compte gratuit pour voir son profil complet ».
4. `src/content/recherche.ts:124`, the commune page: « Créez votre compte famille gratuit pour voir les profils complets et publier votre demande. »

## Proposed change

Rewrite the four lines to the guide: the account is created with a subscription, and the
subscription opens the full profiles, the contact and the requests. Tag each line `@relecture`.

## Acceptance criteria

- [ ] No line in `src/content/` says that a free account opens a full profile or a request.
- [ ] The FAQ, the public professional page and the commune page name the subscription as what opens the full profile.
- [ ] `src/content/vitrine.test.ts` passes.
