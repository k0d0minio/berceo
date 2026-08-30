# AGENTS.md — Layer 0: Repository Identity & Routing

> This is the **first file any agent session reads.** It says what this repo is and where
> to go for a given task. Keep it short; detail lives in `README.md` and the routed files.

## What this repo is

**berceo** — the single-page **proposal site for the Berceo lead-engineer engagement**. It
is a document, not a product: one page, shared by link, that makes the case for the
engagement and states its terms.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui, deployed on Vercel. The
package is named `berceo-shell` — the shell was built first and the content fills it in.

The page sets `robots: noindex`. It is a **private document**: treat its contents as
client-confidential and never add anything that assumes a public audience. Print styles
strip the chrome so ⌘P → PDF is presentable, which is a real delivery path — check it
before calling a change done.

## Routing — "if the task is… → go to…"

| The task | Go to |
|---|---|
| Change what the proposal *says* — sections, order, title | [`src/content/proposal.ts`](src/content/proposal.ts) — `sections` drives both the nav and the page |
| Write or replace proposal body copy | [`src/app/page.tsx`](src/app/page.tsx) — each `<Placeholder />` is content still to be written |
| Section chrome — heading, anchor, body typography | [`src/components/proposal/section.tsx`](src/components/proposal/section.tsx) |
| Presentation primitives — stats, callouts, terms | [`src/components/proposal/blocks.tsx`](src/components/proposal/blocks.tsx) |
| Theme tokens, `.prose-proposal`, print styles | [`src/app/globals.css`](src/app/globals.css) |
| shadcn components | [`src/components/ui/`](src/components/ui/) — add with `npx shadcn@latest add <name>` |
| The research the proposal draws on | [`.icm/docs/REPORT.md`](.icm/docs/REPORT.md) |
| What still needs answering before quoting | [`.icm/docs/QUESTIONS.md`](.icm/docs/QUESTIONS.md) — stable IDs, pare down per audience |
| Plan or track work on this repo | [`.icm/intake/`](.icm/intake/) — epics and stubs, contract in its README |

## Standing rules

- **Body copy inside a `Section` is styled automatically.** Write plain `<p>`, `<ul>`,
  `<h3>` — do not reach for utility classes to make prose look right.
- **Never invent a commercial term.** Rates, scope and dates come from Jamie or from
  `.icm/docs/`; a blank is the correct state until they do.
- **CI is the source of truth.** Never run `build`/`lint`/`typecheck` locally — push and
  read the Vercel deployment check.
- **Planning is tickets.** Any plan or backlog becomes stubs in `.icm/intake/`, never a
  loose `TODO.md`. Ticket-only commits go straight to `main`; everything else through a PR
  on a `claude/` branch.
- **Gates are human checkboxes** — read them, never tick them.
- **No secrets in git, ever.** Env vars only; flag any plaintext credential found.
