# Tasks: socle-design-system

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `/design-system` renders the palette, the type scale, the four button variants on their backgrounds, cards, the striped section, the translucent block, the input and the confirmation dialog, matching the DA's values listed in this spec.
- [ ] `/design-system` and `/design-system/portail` carry `noindex, nofollow` in their robots metadata and no page links to them.
- [ ] Every colour and font family is a token declared in `src/app/globals.css` (fonts bound in `src/app/fonts.ts`); a search for hex colour literals and `rgb(`/`hsl(` in `src/components/**` and `src/app/**/*.tsx` returns nothing.
- [ ] The red and green confirmation tokens are referenced only by `src/components/ui/confirm-dialog.tsx`.
- [ ] No component in `src/components/**` or `src/app/**` applies a box-shadow.
- [ ] Buttons are capsules at least 48 px tall with a 1 px border and scale to 1.03 over 200 ms ease-out on hover, with no scale under `prefers-reduced-motion: reduce`.
- [ ] Swapping the display face from Fraunces to Comodo requires editing `src/app/fonts.ts` only.
- [ ] The public header and footer render on `/design-system`; below `md` the header navigation opens from a menu button and closes on Escape.
- [ ] `/design-system/portail` renders the portal shell with the logomark in its header and a working mobile navigation.
- [ ] The confirmation dialog opens from its trigger, traps focus, closes on Escape, and returns focus to the trigger.
- [ ] `/` renders the holding page with the same words, dark palette, fonts, animation and metadata as before this run, without the public header or footer.
- [ ] `GET /api/health` returns 200 with `{ "status": "ok" }`, covered by a unit test.
- [ ] `health_endpoint` in `.icm/project.json` lists `https://uat.berceo.be/api/health` and `https://www.berceo.be/api/health`.
- [ ] Every word rendered by the holding page, the header, the footer, the portal shell and the design-system pages comes from `src/content/`; `src/content/site.ts` is gone.
- [ ] The catalogue is keyed by locale with `fr` only, and its types make a missing key in a second locale a typecheck error.
- [ ] The students wording entry and every label not given verbatim by the guide carry a `@relecture` tag.
- [ ] `README.md` documents the catalogue's shape and how to add a locale; `AGENTS.md`'s routing table points at the new locations.
- [ ] Lint, typecheck, tests and the Vercel build are green.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
