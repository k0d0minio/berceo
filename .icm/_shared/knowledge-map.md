# Knowledge map — what each stage reads, and where (Layer 3 reference, project-owned)

The router every stage loads to find its slice of this repo's knowledge. Project knowledge — what
the product is, who it serves, how it is built — is canonical in the docs tree named by
`docs_path` in `.icm/project.json` (or, for a repo without one, in `README.md` and the `AGENTS.md`
files); the pipeline never copies it into a contract, it reads it from here on demand. This file is
project-owned: it names this repo's pages, and the sync never touches it. Validate it with
`.icm/scripts/validate-knowledge-map.sh` whenever a page moves.

`docs_path` is `.icm/docs` — the discovery material the engagement rests on, mostly in French.
There is no product docs site yet; the platform as built is described at the root.

## Where the knowledge lives

- The engagement in one read — `.icm/docs/REPORT.md`: the assessment written before quoting —
  what Berceo is, the two hard external dependencies (itsme, the Belgian regulatory context),
  where the effort goes, and the launch blockers (the legal chapter the founders left
  unanswered).
- The scope of record — `.icm/docs/cahier-des-charges.md`: the founders' annotated cahier des
  charges, the specification V1 is measured against. Document verification of professional
  diplomas is out of this version; the platform keeps accounts, night-care requests, the
  selection of a professional, messaging, payment and administration.
- The founders' answers — `.icm/docs/berceo-answers.pdf`: the 40-page answers document,
  declared the source of truth (a binary — read it through the summary in `REPORT.md` and quote
  it by section).
- The questions asked — `.icm/docs/QUESTIONS.md`: the exhaustive discovery questionnaire with
  stable ids (`A1`, `B2`, …) that the answers and call notes reference; `.icm/docs/DECOUVERTE-BERCEO.md`
  is the pared-down French version sent to the founders.
- The site as built — `README.md` (root): where every file of the vitrine, accounts and the
  signed-in spaces lives, plus the design system (Surya's light DA, D-9) and the content
  catalogue. `AGENTS.md` (root): identity, routing, the standing rules — the light DA, the
  editorial guide (D-19), never invent a commercial term, no archives or binaries, CI as the
  source of truth.
- The deal — outside this repo, in icm-board under workspaces/deals/berceo (the quote and the
  devis). No stage reads it.

## What each stage reads

| Stage | Reads | Writes |
| --- | --- | --- |
| **Scope** (incl. the cut) | may read everything, to check requirements are clear, nothing breaks, and the feature fits what exists; prefers `.icm/docs/REPORT.md` first, then the section of `.icm/docs/cahier-des-charges.md` the story touches, and `.icm/docs/QUESTIONS.md` for what is still open | — (its artifacts are `.icm/runs/<slug>/01_scope/**` + `.icm/intake/<slug>/`) |
| **Define** | `.icm/docs/cahier-des-charges.md` — the touches and the personas (parent, professionnel, admin) come from it; `AGENTS.md` for the standing rules | — |
| **Build** | `AGENTS.md` (the code rules `_shared/conventions.md` redirects to) and `README.md` (where things live) | — |
| **Release** | `README.md` and `AGENTS.md` when a shipped change moves a file or a rule | those pages |
| **Knowledge lane** | exactly the one page the request names | that page; this map when a page is added or removed |
