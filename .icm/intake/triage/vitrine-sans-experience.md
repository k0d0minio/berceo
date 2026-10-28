# Stub: The vitrine no longer promises an experience on each profile

- lane: tweak
- found-by: the build of `profil-formations-sans-experience` · 2026-10-28
- complexity: low
- priority: P1

## Problem

`profil-formations-sans-experience` removes the experience from every profile. Three vitrine lines still name it:

1. `src/content/comment-ca-marche.ts`, the professional's step « Créez votre profil »: « Présentez votre profession, votre expérience, votre zone et votre tarif de nuit. »
2. `src/content/comment-ca-marche.ts`, « Des profils transparents »: « Photo, prénom, profession, zone, expérience et note : vous savez qui vient chez vous. »
3. `src/content/accueil.ts`, « Vous savez qui vient »: « Photo, prénom, profession, zone, expérience et note : chaque profil est transparent. »

The vitrine then promises a field that no profile shows.

## Proposed change

Remove « expérience » from the three lines. Keep the `@relecture` tags. `vitrine-retour-1/comment-ca-marche-par-persona` rewrites the « Comment ça marche » page: do this tweak first, or fold it into that stub.

## Acceptance criteria

- [ ] No line in `src/content/accueil.ts` or `src/content/comment-ca-marche.ts` names an experience.
- [ ] `src/content/vitrine.test.ts` passes.
