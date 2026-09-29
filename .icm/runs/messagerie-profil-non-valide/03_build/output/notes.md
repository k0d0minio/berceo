# Build notes: messagerie-profil-non-valide

- commits: feat: messagerie-profil-non-valide — close a non-validated professional's conversations but the booked one
- ci: pending (filled at the stop)

## What changed

- `src/lib/messagerie/rules.ts`: `ConversationRequest` gains two required facts, `profileStatus` and `booked`; `isConversationOpen` returns false when the profile is not `valide` and the answer is not `retenue`, before the D-89 checks. Required, not optional, so the type checker finds every caller.
- `src/lib/messagerie/conversations.ts`: `conversationList` joins the conversation's answer and returns `profileStatus` and `booked`; `conversationFor` returns `profileStatus` beside its `booked`; `sendMessage`'s pre-check read joins the answer and the profile and calls the rule with both; its `target` CTE joins `care_request_applications a` and `professional_profiles pp` and adds `(pp.status = 'valide' or a.status = 'retenue')`. `profileStatus` is a rule input only: both components are server components and pass neither field to a client component.
- `src/lib/messagerie/rules.test.ts`: every non-`valide` status closes a conversation not booked and keeps the booked one open; a `valide` profile is left to D-89 whether booked or not; the booked conversation still closes at the night's end and on a cancelled request; `complement_demande` → `valide` before the night's end reopens it.
- `src/components/messagerie/*`: unchanged; they already call `isConversationOpen(row|thread, now)` and now pass the two facts through the widened rows. No new words (D-157).
- `README.md`: the closing line of the conversation section.

## Acceptance criteria status

- [x] A non-`valide` professional cannot send in a conversation not booked — the composer is gone (the rule, in both components) and `sendMessage` refuses as `fermee` at its read and in its write; nothing is inserted, and the e-mail leaves only for an inserted message (`actions.ts`, unchanged).
- [x] The family cannot send there either — the rule and the SQL take no account of the side.
- [x] Both parties still read it — `partyOf` and the reads are unchanged; « Fermée » in the list and `conversation.fermee` in the thread come from the same rule.
- [x] The booked conversation stays open until its night ends whatever her status — `booked` / `a.status = 'retenue'`.
- [x] A `valide` professional sees no change — the new clause is true for `valide`; the D-89 test cases pass the `valide` fixture.
- [x] Once `valide` again it reopens — the rule reads the current status; nothing is stored (test « opens again once she is `valide` »).
- [x] A profile leaving `valide` between the read and the write inserts nothing — held in the `target` CTE, which returns `fermee` when empty.
- [x] `rules.test.ts` covers the truth table.

## Notes for Release

- Decisions were renumbered D-156 to D-158 at Build's start: three sibling runs defined the same day (`reservations-regles-non-appelees`, `gardes-shared-helpers`, `reservations-deux-gardes-meme-nuit`) had taken D-153 to D-155. Ids only, no requirement changed (see `FAILURE.md`).
- The booked exception keys on `a.status = 'retenue'`. A garde cancelled afterwards leaves the answer `retenue` but cancels its request (D-110), so its conversation closes through D-89 anyway.
- Not proven against a database: the new CTE joins are read by eye, not run on the run's Neon branch.

Context budget: read `src/lib/auth/guard.ts`, `README.md`'s conversation section and the three sibling branches' decision ids beyond the Inputs.
