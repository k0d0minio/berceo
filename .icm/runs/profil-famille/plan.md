# Plan: profil-famille

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The commune reference** — `scripts/communes/` (generator: bpost postcode list joined to
   Statbel REFNIS, communes in force at the source's date), `src/lib/communes/` (the committed
   data module with sources + date in its header; search by postcode prefix or name, accent- and
   case-insensitive; lookup by postcode + locality; INS code) and its tests — done when: the tests
   find « 1050 Ixelles » by « 105 » and « ixel », and one sample locality per region carries the
   right INS code; the module stays well under 1 MB.
2. **Schema and migration** — `src/db/schema.ts` gains `family_profiles` (user_id PK → users.id
   cascade, commune_ins, postcode, locality, street, house_number, box, context ≤ 300 with a
   check, timestamps); `npm run db:generate -- --name family_profiles`; commit `drizzle/`. Load
   `.icm/skills/database-migration/` — done when: drizzle-kit emitted the one migration and the
   journal test passes.
3. **The family module** — `src/lib/famille/` (server-only): validation of the profile form
   (reuse `normalizePhone` and the sign-up name rules; commune must be a list entry; rue +
   numéro together, boîte only with them; context ≤ 300), the owner's reader, the commune-only
   reader, the save (users row + upsert `family_profiles`, user id from the session only), the
   Neon Auth `name` sync if the SDK allows it server-side; the test that fails when a file outside
   `src/lib/famille/` names the address columns — done when: the unit tests for validation, the
   commune-only reader and the column guard pass.
4. **Words** — `src/content/famille.ts` (labels, hints, errors, the confirmation, the home block,
   the read-only e-mail line; `@relecture Surya` on each), "Mon profil" in `src/content/comptes.ts`,
   and the catalogue test extended to the new file — done when: the catalogue test passes.
5. **The pages** — `src/app/(portail)/espace/famille/profil/` (page + server action, noindex,
   `requireAccess(SPACES.parent)`), the commune combobox and the form under
   `src/components/famille/`, the "Complétez votre profil" block on `/espace/famille`, the "Mon
   profil" entry in `SpaceShell` for the parent role, `routing.test.ts` extended to the new path —
   done when: the form saves and prefills on the preview at 360 px and on desktop.
6. **Docs and the triage stub** — the routing row in `AGENTS.md` and the README section for the
   family profile and the commune reference; confirm `.icm/intake/triage/famille-changement-email.md`
   is on the branch — done when: every acceptance criterion in `tasks.md` is checked.

## Risks

- The bpost and Statbel sources may be unreachable from the build session's network: the
  generator then cannot run. Signal: the fetch fails. Stop and say so; do not hand-type the list.
- The 2025 Flemish mergers: a postcode whose commune changed must map to the new INS code.
  Signal: a join between the two sources leaves localities with no INS code; the generator must
  fail on any unmatched row rather than drop it.
- onboarding-professionnelle also adds a migration. If it runs in parallel, the two `drizzle/meta`
  journals conflict. Signal: a second open run touching `src/db/schema.ts`; generate on the merged
  tree, one after the other.
- `@neondatabase/auth` 0.5.0-beta may expose no server-side `updateUser`; then only the row
  changes (the spec allows it). Do not work around it with a client call.
