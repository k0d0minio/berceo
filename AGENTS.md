# AGENTS.md — Layer 0: Repository Identity & Routing

> This is the **first file any agent session reads.** It says what this repo is and where
> to go for a given task. Keep it short; detail lives in `README.md` and the routed files.

## What this repo is

**berceo** — the **holding page for Berceo**, a Belgian two-sided marketplace connecting
parents of newborns with professionals who take overnight post-partum care shifts
(*gardes de nuit*). One screen, in French, that says the site is being built.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui, deployed on Vercel. The
package is still named `berceo-shell`.

The engagement was won in September 2026 and the repo pivoted from proposal document to
product site. The proposal and discovery questionnaire that used to live here are gone
from the working tree — they are preserved in git history and in [`.icm/docs/`](.icm/docs/).

**This page is public.** It is indexable, it carries an OG card, and it is the first thing
anyone who hears the brand name will find. That is a deliberate reversal of the old
`robots: noindex` — this repo used to hold a private client document and now holds a
public one. If Berceo wants the brand kept quiet until launch, put `robots` back in
[`src/app/layout.tsx`](src/app/layout.tsx); it is a two-line change.

## Routing — "if the task is… → go to…"

| The task | Go to |
|---|---|
| Change any word on the page | [`src/content/site.ts`](src/content/site.ts) — the whole copy deck, one file |
| Layout, spacing, the page itself | [`src/app/page.tsx`](src/app/page.tsx) — one screen, no nav |
| Colour, type, the breathing animation | [`src/app/globals.css`](src/app/globals.css) — night palette + `souffle`/`halo`/`lever` |
| Metadata, fonts, OG card | [`src/app/layout.tsx`](src/app/layout.tsx) |
| The logo marks | [`src/components/berceo-logo.tsx`](src/components/berceo-logo.tsx) — inlined, `currentColor` |
| Brand artwork | [`public/logos/`](public/logos/) — SVG is what the site uses; PNG for raster; `.ai` is the source |
| shadcn components | [`src/components/ui/`](src/components/ui/) — retained and retuned to the brand palette, currently unused |
| The research behind the engagement | [`.icm/docs/`](.icm/docs/) — `REPORT.md`, `cahier-des-charges.md`, `QUESTIONS.md` |
| Plan or track work | [`.icm/intake/`](.icm/intake/) — epics and stubs, contract in its README |

## Standing rules

- **Never invent a commercial term.** Rates, scope, launch dates and contact addresses
  come from Jamie or from `.icm/docs/`. Berceo has no published email or domain yet — a
  blank is the correct state until it does. The holding page deliberately shows no
  contact for exactly this reason.
- **The page is committed to dark.** Berceo is a night service; there is no light theme
  and no toggle. Don't add one back "for completeness".
- **Never commit archives or binaries over a few MB.** A 58MB brand-pack zip and 51MB of
  flattened JPGs once landed here and had to be purged from history with a force-push.
  `.gitignore` now blocks `*.zip` and friends. Brand masters live in Drive.
- **CI is the source of truth.** Never run `build`/`lint`/`typecheck`/`dev` locally —
  push and read the Vercel deployment check.
- **Planning is tickets.** Any plan or backlog becomes stubs in `.icm/intake/`, never a
  loose `TODO.md`. Ticket-only commits go straight to `main`; everything else through a PR
  on a `claude/` branch.
- **Gates are human checkboxes** — read them, never tick them.
- **No secrets in git, ever.** Env vars only; flag any plaintext credential found.
