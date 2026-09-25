# Stub: A removed or replaced file can stay in the bucket with no row pointing at it

- lane: bug
- found-by: verification-back-office release review · 2026-09-25
- complexity: standard

## Problem

`removeDocuments` and `removeFile` (`src/app/(portail)/espace/professionnelle/actions.ts`) delete
the `professional_documents` row first and the bucket object second. When the object delete fails
(the store unreachable, a credential rotated), the diploma or photo stays in the private bucket
with no row referencing it. Nothing ever finds it again: the 30-day purge of refused files
(`src/lib/admin/purge.ts`, D-41, D-55) starts from the rows, so the retention rule is silently
broken for that file. The professional also sees an error although her save already went through.

## Proposed change

Delete the object first, then the row, as the purge does (deleting a missing object is not an
error, so a retry is safe); on an object failure keep the row and answer the error. A test with
injected storage for both orders.

## Prompt

In the berceo repo, read `.icm/intake/triage/onboarding-orphaned-objects.md`, then make
`removeDocuments` and `removeFile` in `src/app/(portail)/espace/professionnelle/actions.ts`
delete the bucket object before the row (the order `src/lib/admin/purge.ts` uses), keeping the row
when the object delete fails. Run it through `/pipeline bug onboarding-orphaned-objects`.
