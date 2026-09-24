# Build notes: socle-design-system

- commits: see PR #21 (`feat: socle-design-system — …`)
- ci: GREEN on the cheap tier (eca4569); full gate on the post-flip head

## What changed

- `src/app/globals.css`: the DA as Tailwind v4 tokens (palette, confirmation colours, type scale switching at `md`, `rounded-carte`/`rounded-capsule`, `motif-raye`, `voile-perle`), the shadcn contract remapped, Tailwind's default palette off; the holding page's night palette scoped to `.nuit`.
- `src/app/fonts.ts`: the only file naming a typeface — Fraunces in Comodo's slot (`--font-titre`), Nunito (`--font-texte`), Karla for the holding page.
- `src/app/theme-color.ts`: the two `<meta name="theme-color">` values (decision B-2).
- `src/app/layout.tsx`: light root layout. `src/app/(holding)/`: the holding page, unchanged in look and words, with its metadata and OG card moved onto the page.
- `src/app/(public)/`: header + footer layout, `/design-system`. `src/app/(portail)/design-system/portail/`: the portal shell demo.
- `src/app/api/health/route.ts` + `route.test.ts`; `.icm/project.json` `health_endpoint` → UAT and production `/api/health`.
- `src/components/ui/`: Button (four background variants, DA hover, reduced motion), Card (32 px, tones), Input, AlertDialog, ConfirmDialog (sole user of the red/green tokens), StripedSection, TranslucentBlock; `dark:`, `ring-*`, `shadow-*`, `outline-none` stripped from the rest.
- `src/components/shell/`: PublicHeader, PublicFooter, MobileMenu (Radix dialog), PortalShell, SignOutDialog.
- `src/content/`: `locale.ts` (`catalogue()`, `words()`, `Shape`/`Catalogue` types), `common.ts`, `holding.ts`, `design-system.ts`, `portal.ts`; `site.ts` removed. `@relecture` tags on every entry the guide does not give verbatim, and on the students wording.
- `src/lib/utils.ts`: tailwind-merge told about the DA's `text-*` sizes (outside `touches:`, required — otherwise `cn("text-bouton", "text-sauge")` drops the size).
- `README.md`, `AGENTS.md` routing table.
- `package.json`, `package-lock.json`: `next` and `eslint-config-next` 16.3.0 → 16.3.6 and `npm audit fix` for sharp, fast-uri, js-yaml — the branch security gate blocked on these pre-existing advisories and the spec's `touches:` covers the manifest (security-audit skill). Consumes `triage/npm-audit-high-advisories`.

## Acceptance criteria status

- [x] `/design-system` shows palette, type scale, four button variants (default and held-hover), cards on white/sage/pearl, striped section, translucent block, input, confirmation dialog.
- [x] Both reference pages carry `robots: { index: false, follow: false }`; nothing links to them.
- [x] No hex/rgb/hsl in `src/components/**` or `src/app/**/*.tsx` (grep); colours in `globals.css`, the meta colours in `theme-color.ts` (B-2).
- [x] `rouge-confirmation`/`vert-confirmation` referenced only in `confirm-dialog.tsx` (and declared in `globals.css`).
- [x] No `shadow-*` or `ring-*` in any component (grep).
- [x] Button: `rounded-capsule`, `min-h-12`, 1 px border, `hover:[transform:scale(1.03)]`, 200 ms ease-out, `motion-reduce:hover:[transform:none]`.
- [x] Comodo swap: `src/app/fonts.ts` only.
- [x] Header/footer on `/design-system`; menu button with Radix dialog (Escape closes) below `lg` (B-1).
- [x] Portal shell with the logomark and a mobile menu at `/design-system/portail`.
- [x] Confirmation dialog on Radix alert dialog: focus trap, Escape, focus return.
- [x] `/` keeps its words, night palette, Fraunces/Karla, animation and metadata; no header/footer. To confirm on the preview.
- [x] `GET /api/health` → 200 `{status:"ok"}`, unit-tested.
- [x] `health_endpoint` lists both URLs.
- [x] Every rendered word from `src/content/`; `site.ts` gone.
- [x] Catalogue keyed by locale, `fr` only; `Catalogue<T>` requires every other locale in French's shape.
- [x] `@relecture` on the students entry and every non-verbatim label.
- [x] README documents the catalogue and adding a locale; AGENTS.md routing updated.
- [x] Lint, typecheck, tests and the Vercel build — GREEN in CI.

## Notes for Release

- Smoke `/` side by side with production: the holding page must look identical (night background including overscroll, Karla text, breathing mark).
- The DA's text colours are applied literally (operator decision): taupe body text on white is ~1.9:1. Expected, not a bug — to raise with Surya.
- `health_endpoint`'s production entry answers 404 until the first UAT promotion (operator decision in Define).
- `_shared/project-rules.md` → The factory → Health endpoint still describes `https://www.berceo.be/`; Release should update that line.
- The `next` patch bump (16.3.0 → 16.3.6) rides in this PR; the preview is its first build.
- The header/footer links point at vitrine pages that do not exist yet (404 by design until `vitrine-publique`).

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on dc9e226 before the release pushes (ci-status.sh, full gate); re-read after the last push
- reviews: code medium (1 finding: the portal shell's logomark defaulted to `/` under a "retour à mon espace" label — trivial, in-ticket, fixed: `home` is required) · security security-check.sh --branch --audit: OK ([WARN] gitleaks not installed — built-in patterns only) · /security-review n/a (no auth, payments, PII or route policy in the diff) · /production-readiness n/a (no DB, auth, payments or env var) · readiness env.sh audit --changed: OK
- parked: none
- migrations: skip — none of this run's own
- learned: none (1 candidate, the dependency bump, judged a one-off fix rather than a repo constraint; it counted twice only because the gate's read was logged twice)
- docs: no docs-tree impact; `_shared/project-rules.md` → Health endpoint updated · announce: deferred to promotion

