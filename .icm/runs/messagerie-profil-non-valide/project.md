# Project: messagerie-profil-non-valide

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/professionnelle-invalidee-consequences/messagerie-profil-non-valide.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/messagerie/rules.ts, src/lib/messagerie/rules.test.ts, src/lib/messagerie/conversations.ts, src/components/messagerie/conversation-list.tsx, src/components/messagerie/conversation-view.tsx, README.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
