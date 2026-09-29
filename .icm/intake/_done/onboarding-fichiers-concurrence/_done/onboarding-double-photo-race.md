# Stub: Two photo uploads at once leave two photos on a profile

- lane: bug
- found-by: verification-back-office release review · 2026-09-25
- complexity: low
- feature-slug: onboarding-double-photo-race
- sequence: 2 of 3
- depends-on: onboarding-upload-limit-race
- priority: P2

## Problem

`confirmUpload` (`src/app/(portail)/espace/professionnelle/actions.ts`) replaces her photo by
removing the photos it read before the upload started. Two uploads in flight (a quick second
pick, a double submit) each remove only the original and keep their own, so the profile holds two
`photo` rows and which one the pages and the founders' file view show is arbitrary. The same
read-then-insert shape is behind `onboarding-upload-limit-race.md` (the three-files limit).

## Proposed change

After recording the new photo, delete every other `photo` row of the profile (and their objects)
by id rather than from the pre-upload read, or hold one photo per profile with a partial unique
index and an upsert. Fix it with `onboarding-upload-limit-race` if both are taken together.

## Prompt

In the berceo repo, read `.icm/intake/onboarding-fichiers-concurrence/onboarding-double-photo-race.md`
and the epic's `breakdown.md`, then make
`confirmUpload` in `src/app/(portail)/espace/professionnelle/actions.ts` keep exactly one photo per
profile under concurrent uploads (delete every other photo row and object after the insert, or a
partial unique index with an upsert). Run it through `/pipeline bug onboarding-double-photo-race`.
