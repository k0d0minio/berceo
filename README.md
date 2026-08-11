# BERCEO

Single-page proposal site for the Berceo lead-engineer engagement.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Where things live

| Path | Purpose |
| --- | --- |
| [src/content/proposal.ts](src/content/proposal.ts) | Title, author, and the ordered list of sections. Editing `sections` updates both the nav and the page. |
| [src/app/page.tsx](src/app/page.tsx) | The proposal itself. Replace each `<Placeholder />` with real content. |
| [src/components/proposal/section.tsx](src/components/proposal/section.tsx) | `Section` wrapper (heading, anchor, body typography) and `Placeholder`. |
| [src/components/proposal/blocks.tsx](src/components/proposal/blocks.tsx) | Presentation primitives: `StatRow`/`Stat`, `Callout`, `Terms`/`Term`. |
| [src/components/ui/](src/components/ui/) | shadcn components. Add more with `npx shadcn@latest add <name>`. |
| [src/app/globals.css](src/app/globals.css) | Theme tokens, `.prose-proposal` body typography, print styles. |

Body copy inside a `Section` is styled automatically — write plain `<p>`, `<ul>`,
`<h3>` and it will look right.

## Notes

- Dark/light/system toggle is wired up via `next-themes`.
- The page sets `robots: noindex` — it is a private document shared by link.
- Print styles strip the header/footer so ⌘P → PDF is presentable.
- [REPORT.md](.icm/docs/REPORT.md) holds the underlying research this proposal draws on.
