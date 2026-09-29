# Plan: messagerie-profil-non-valide

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The pure rule** — `src/lib/messagerie/rules.ts`: `ConversationRequest` (or a sibling type the
   callers fill) gains `profileStatus: ProfileStatus` and `booked: boolean`; `isConversationOpen`
   returns false when the profile is not `valide` and the answer is not `retenue`, on top of the
   D-89 checks (D-156, D-158). Update the doc comment. — done when: the function is the single
   definition and the type forces every caller to supply both facts.
2. **The tests** — `src/lib/messagerie/rules.test.ts`: the truth table profile `valide`/not ×
   `retenue`/not (each non-`valide` status at least once), crossed with the existing cancelled and
   night-ended cases; existing tests updated to pass the new facts. — done when: vitest passes in CI.
3. **The reads feed the rule** — `src/lib/messagerie/conversations.ts`: `conversationList` joins
   the conversation's answer and returns `profileStatus` (from the already-joined
   `professional_profiles`) and `booked` (answer `retenue`); `conversationFor` returns
   `profileStatus` beside its existing `booked`; `sendMessage`'s pre-check read selects both and
   passes them to `isConversationOpen`. Keep `profileStatus` out of anything rendered (it is a rule
   input, not a displayed field). — done when: the list, the thread and the pre-check all call the
   rule with the two facts.
4. **The write holds it** — `sendMessage`'s `target` CTE joins
   `professional_profiles p on p.id = c.profile_id` and
   `care_request_applications a on a.id = c.application_id` and adds
   `and (p.status = 'valide' or a.status = 'retenue')`; the class comment names the rule next to
   D-89. — done when: a send into a conversation of a non-`valide` professional, not booked,
   returns `fermee` and inserts nothing, whichever side sends.
5. **The components** — `src/components/messagerie/conversation-list.tsx` and
   `conversation-view.tsx` already call `isConversationOpen(row|thread, now)`; they compile against
   the widened rows with no new words (the « Fermée » mark and the closed line are reused, D-157).
   — done when: typecheck is green in CI.
6. **README** — the conversation section: a conversation also closes, for both, while its
   professional is not `valide`, except the conversation of her confirmed booking; it reopens by
   itself if she is validated again before the night ends. — done when: the line is there.

## Risks

- A caller left passing the old shape would silently treat the conversation as open if the new
  fields were optional: make them required so the type checker finds every caller (signal: a
  `?:` on either field).
- The `retenue` exception relies on the answer being `retenue` for exactly the booked
  conversation (`conversationFor` already derives `booked` that way); a cancelled booking
  flips its answer, which then closes the conversation only when the profile is also not
  `valide`, and the cancelled request closes it anyway (D-89).
- No schema change and no migration: if Build finds itself generating one, the plan is wrong.
