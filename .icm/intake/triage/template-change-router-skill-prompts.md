# Stub: The router hook routes a skill's expanded prompt to Scope

- lane: chore
- found-by: template-change · 2026-09-25
- complexity: standard

## Problem

During `release messagerie` (berceo, PR #44, head `ebe09eb` plus the review-fix commit), invoking
the `/security-review` skill injected its long instruction body as a user turn, and
`.claude/hooks/route-request.sh` answered it with its layer-3 line
`[pipeline-router] Route: /pipeline scope "<the story>" (multi-feature dump …)`, marked
authoritative. The prompt was a skill's own instructions, not the operator's content; the session
ignored the line and carried on with Release. The hook's investigation bail
(`\b(analy[sz]e|…|review|…)\b`) should have matched the body's « security review » wording; why it
did not is unconfirmed (the expanded body the hook receives may differ from what the session sees).
A pointer, never a cut: no lane here consumes it.

## Prompt

Template change request — from berceo · 2026-09-25

In the icm-board repo (`~/Apps`), change the canonical `.claude/` asset
`_system/template/claude*/hooks/route-request.sh` (in every pipeline repo:
`.claude/hooks/route-request.sh`, a canonical hook without a MANIFEST line). Read
`_system/contracts/PIPELINE.md` → File-level ownership first.

What it does today (berceo's copy, `.icm/template-version`: icm-board e7a99bb): after its layer-1
stage forms and the investigation bail, it emits

> emit "[pipeline-router] Route: /pipeline scope \"<the story>\" (multi-feature dump — nothing in .icm/runs/ or .icm/intake/ matches it; …)"

for any prompt over 800 characters or with six bullet lines, and the layer-3 « new content »
Route line for any work verb.

What it should do: never emit a Route or Suggest line for a prompt that is a skill or slash
command's expanded body rather than the operator's own words. At least: exit 0 when the prompt
carries a skill-expansion marker (a `<command-name>` / `<command-message>` tag, or starts with the
text of a skill's SKILL.md body — e.g. the `/security-review` body opening « You are a senior
security engineer conducting a focused security review »), and when the prompt contains a
`GIT STATUS:` / `DIFF CONTENT:` block. Add a fixture case with the `/security-review` expansion
that expects no output, and one confirming an ordinary 900-character story still routes to Scope.
Also check why the existing `review` bail did not fire on that body (the lowercased first 2 000
characters contain « security review »).

Why: berceo, `release messagerie`, 2026-09-25 — the hook marked `/pipeline scope` authoritative
on the `/security-review` skill's body in the middle of a Release. A session that obeyed it would
have abandoned a gated merge to open a Scope on a code-review prompt. Every repo with the hook and
review skills has the same exposure.

Then: prove it (the fixture, or a read-only run against projects/berceo on Jamie's machine), ship
it through a PR on a `claude/` branch, and after the merge bring it back by copying the new
canonical file over `projects/berceo/.claude/hooks/route-request.sh` in that repo's PR —
`icm-check.sh` reports the drift until it lands. Retire
`projects/berceo/.icm/intake/triage/template-change-router-skill-prompts.md` to `_done/` in that
commit.
