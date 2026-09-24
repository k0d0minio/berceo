# Stub: Onboarding cleanups the release review found

- lane: chore
- found-by: onboarding-professionnelle release · 2026-09-24
- complexity: trivial

## Problem

Two small things in the professional's onboarding, neither a defect:

1. `inspectUpload` (`src/lib/documents/storage.ts`) makes a HEAD and then a ranged GET; the ranged
   GET alone carries the total size in its `Content-Range` header (`bytes 0-15/<total>`), so one
   round trip to Neon Object Storage is spent for nothing on every upload.
2. `ONBOARDING` and `SPACE` are defined in both `actions.ts` and `inscription/step.ts`
   (`SPACES.professionnel` already exists in `src/lib/auth/routing.ts`), and the student-option
   filter (D-7) and the `of(kind)` helper are copied across `inscription/profil/page.tsx`,
   `inscription/justificatifs/page.tsx` and `profil/page.tsx`.

## Proposed change

Read the size from `Content-Range` and drop the HEAD. Export the paths once (from
`inscription/step.ts` or `src/lib/auth/routing.ts`) and move the professions filter and `of(kind)`
into `src/lib/professionnelle/` so the three pages share them. No behaviour change.

## Prompt

In the berceo repo, read `.icm/intake/triage/onboarding-cleanups.md` and make the two changes it
lists in `src/lib/documents/storage.ts` and `src/app/(portail)/espace/professionnelle/`, with no
behaviour change. Run it through `/pipeline chore onboarding-cleanups`.
