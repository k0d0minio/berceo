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

- Bookings are untouched: nothing here changes a `retenue` answer, a booking or a garde.
- No new words: the existing « Fermée » mark, `conversation.fermee` and `envoi.fermee` are reused (D-157).
- Nothing is stored: the rule reads the profile's current status (D-158); no schema change.
- The rule is held twice, in `rules.ts` and in `sendMessage`'s SQL (the messagerie module's standing pattern).

## Context budget

- Define read `src/lib/messagerie/conversations.ts`, `rules.ts`, `actions.ts`, the two messagerie components, `src/lib/auth/guard.ts` and `reopenFile` to establish where the rule is read and held.
