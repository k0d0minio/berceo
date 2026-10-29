# Stub: A professional who sends her file reaches her space, not the re-acceptance page

- lane: bug
- found-by: the UAT review of 2026-10-29, a new sign-up on uat.berceo.be · 2026-10-29
- complexity: medium
- priority: P0

## Problem

A professional sends her file at step 4 with the seven boxes ticked. Her space answers
`/espace/professionnelle/declarations` (« Vos déclarations ont changé ») at once, again after
« Confirmer mes déclarations », and again once the founders validate her. No page of her space
opens. Her seven rows in `professional_declarations` carry the current version,
`feedback-2026-10-23`.

The cause, read on the UAT database: `mustRenewDeclarations` in
`src/lib/professionnelle/declarations.ts` reads the version through a `sql` subquery inside
`db.select()`. Drizzle renders a column of a single-table select without its table name. The
subquery then reads `where "profile_id" = "id"`, which compares two columns of
`professional_declarations`. It returns null, and `needsNewDeclarations(status, null)` is true
for every submitted file. The same statement with `d.profile_id = p.id` returns the version.

## Proposed change

Read the status and the latest version in a form Drizzle qualifies: a `leftJoin` on an aliased
`professional_declarations`, or two statements. Add a test that holds the rendered SQL to a
qualified comparison, so the gotcha cannot come back.

## Acceptance criteria

- [ ] A professional who sends her file at step 4 lands on `/espace/professionnelle` with « dossier en attente ».
- [ ] A validated professional whose last acceptance carries the current version opens every page of her space.
- [ ] A professional whose last acceptance carries `cdc-2026-08-02` is sent to the re-acceptance page once, and reaches her space after « Confirmer mes déclarations ».
- [ ] A test fails when the version lookup compares `profile_id` with an unqualified `id`.

## Notes

- The test professional `contact+berceo-uat-pro@jamienisbet.com` on UAT, validated on 2026-10-29,
  shows the loop. Alix's own file carries `cdc-2026-08-02` and must pass the re-acceptance page
  once after the fix.
- Files: `src/lib/professionnelle/declarations.ts` and its test. `src/lib/auth/guard.ts` reads it.
