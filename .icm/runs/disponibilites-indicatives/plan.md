# Plan: disponibilites-indicatives

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `src/db/schema.ts` gains `professional_availability`
   (`profile_id` → `professional_profiles.id` cascade, `night_date` date, `created_at`, primary key
   `(profile_id, night_date)`) and its exported type; `npm run db:generate -- --name
   professional_availability`; commit `drizzle/`. Load `.icm/skills/database-migration/` — done
   when: drizzle-kit emitted the one migration (`0006_…` unless another run merged one first:
   regenerate on the merged tree, never hand-edit the journal) and the journal test passes.
2. **The rules module** — `src/lib/disponibilites/rules.ts` (pure, client-safe): the window
   (tonight to today + `NORMAL_LAST_DAY`, reusing `brusselsNow` and `addDays` from
   `src/lib/demandes/rules.ts`), the week grid (57 nights padded to Monday–Sunday rows, month
   headings), the validation of a submitted set (ISO dates, in window, ≤ 57, duplicates
   collapsed), `SHOWN_TO_FAMILIES = 5`, the « Nuit du … au … » wording helper; and
   `rules.test.ts` around every edge: midnight in Brussels, a daylight-saving change, a month
   end — done when: the tests pass.
3. **The data module** — `src/lib/disponibilites/` (server-only): her marked nights in the window,
   `markNights` / `clearNights` (insert on conflict do nothing / delete, scoped to the session's
   profile), `nextAvailableNights(profileId, now)` (≤ 5, in window, none unless `valide`) — done
   when: unit tests cover the `valide` gate and the window of the read, and no file under
   `src/lib/demandes/` imports this module.
4. **Words** — `src/content/disponibilites.ts` (the guide's « Les disponibilités » lines verbatim
   and marked as quotes; the not-yet-validated line, the empty-state line, « Ce que voient les
   familles », the night wording, the form errors carrying `@relecture Surya`), the « Mes
   disponibilités » navigation label in `src/content/comptes.ts`, and
   `src/content/disponibilites.test.ts` on the pattern of `demandes.test.ts` — done when: the
   catalogue tests pass.
5. **The family-facing block** — `src/components/disponibilites/` server component « Prochaines
   disponibilités » (dates + caveat, or the empty-state line), shown on `/design-system/portail`
   with sample dates and empty — done when: both states render on the preview's design-system
   page.
6. **The professional's page** — `src/app/(portail)/espace/professionnelle/disponibilites/`
   (`page.tsx`, `actions.ts`): `requireAccess(SPACES.professionnel)`, `noindex`, `force-dynamic`,
   the not-yet-validated line, the calendar client component (select, « Disponible » /
   « Indisponible », disabled with no selection, 44 px targets, accessible names, no horizontal
   scroll at 360 px), the server action (dates only, profile from the session, refuse the whole
   invalid set), the preview block under the help message; the « Mes disponibilités » entry in
   `SpaceShell`, the link on `/espace/professionnelle` for `valide`; `routing.test.ts` — done
   when: marking and clearing a week work on the preview at 360 px and on desktop.
7. **Docs** — README « The professional's availability » and the `AGENTS.md` routing row — done
   when: every acceptance criterion in `tasks.md` is checked.

## Risks

- **A parallel migration** (messagerie, candidature-et-reservation): if `main` gains `0006` first,
  the drizzle journal conflicts. Signal: the merge of `main` touches `drizzle/meta/_journal.json`.
  Regenerate this run's migration on the merged tree (as demande-de-garde did).
- **Brussels dates on the client**: the calendar must not compute "today" from the phone's clock
  and zone alone; the server passes the window in, the client only renders it. Signal: a test at
  23:30 UTC in summer shows the wrong first night.
- **Smoke on UAT needs a `valide` profile**: verification-back-office is merged, so a founder can
  validate a test professional from `/admin`; no database edit needed.
- **Decision ids D-69 to D-72** may collide with a run defined in parallel; renumber at the merge.
