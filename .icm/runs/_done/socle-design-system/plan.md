# Plan: socle-design-system

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define), executed
pass by pass, and rewritten when reality disagrees with it — never left describing a plan that
was abandoned.

## Passes

1. **The catalogue** — `src/content/` split per surface (`common.ts`, `holding.ts`,
   `design-system.ts`, `portal.ts`), a `locale.ts` with `locales`/`defaultLocale`, types derived
   from `fr`; move `site.ts`'s words to `holding.ts` verbatim and repoint imports; `@relecture`
   tags on the students entry and non-verbatim labels — done when: `site.ts` is gone and the
   holding page imports from `holding.ts`.
2. **Holding page isolation** — move `src/app/page.tsx` into `src/app/(holding)/`, give it a
   layout that loads Karla and scopes the night palette (a `.nuit` scope in `globals.css`, not
   `:root`) plus the dark `viewport`; keep its metadata — done when: `/` is unchanged on the
   preview, side by side with production.
3. **Tokens and type** — `src/app/fonts.ts` (Fraunces as `--font-display`, Nunito as
   `--font-sans`), light `:root` in `globals.css`: DA palette, confirmation tokens, stripe
   utility, pearl translucent utility, radii, type utilities per the spec's table, shadcn
   variable contract remapped; root layout light — done when: no hex outside `globals.css`.
4. **Components** — retune `button.tsx` (four background variants, capsule, hover scale,
   reduced motion), `card.tsx`, strip shadows from every `ui/` file, add `input.tsx`,
   `alert-dialog.tsx` + `confirm-dialog.tsx`, striped-section and translucent-block components —
   done when: the D-24 grep shows the red/green tokens in `confirm-dialog.tsx` only.
5. **Shell** — `src/components/shell/public-header.tsx` (mobile menu panel),
   `public-footer.tsx`, `portal-shell.tsx`; `(public)/layout.tsx` using header and footer —
   done when: both render with catalogue words only.
6. **Reference pages** — `(public)/design-system/page.tsx` and `/design-system/portail` (outside
   the public header/footer), both `noindex, nofollow` — done when: every block in the spec's
   list is on the page.
7. **Health** — `src/app/api/health/route.ts` + a vitest unit test; `health_endpoint` array in
   `.icm/project.json` — done when: the test passes in CI.
8. **Docs** — README (catalogue shape, route groups, adding a locale), AGENTS.md routing rows
   (not the dark rule) — done when: every path the docs name exists.

## Risks

- `/design-system/portail` must escape the `(public)` layout: nesting it under
  `(public)/design-system/` would inherit header/footer. Signal: header visible on the portal
  demo. Fix with a sibling route group for the portal demo, checked against a route conflict at
  build time.
- The night palette leaking into or out of the holding scope (root `color-scheme`, body
  background). Signal: the preview's `/` differs from production, or light pages get the green
  vignette.
- shadcn `alert-dialog` pulls a new radix import; `radix-ui` is already a dependency, so no new
  package should be needed. Signal: a `package.json` diff beyond what the spec names.
