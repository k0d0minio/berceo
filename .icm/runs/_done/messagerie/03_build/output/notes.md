# Build notes: messagerie

- commits: 5e371e7 schema + migration 0008 with backfill · e725a24 rules, `conversations.ts`, Berceo's messages inside the answer and the booking · 0dfe712 send action + new-message e-mail · 9099fcb pages, shell count, entry points, catalogue · 284b0bb README + AGENTS
- ci: see the stop line in `status.md` (the verdict `ci-status.sh` settled on the post-flip head)

## What changed

- `src/db/schema.ts`, `drizzle/0008_messagerie.sql`: enums `message_author`, `berceo_message`; tables `conversations` (one per answer, both read markers, `last_message_at`) and `messages` (client id as key, body 1 to 2 000 characters or a Berceo key, one of each key per conversation). The generated SQL is followed by the backfill: a conversation with its `amorce` for every existing answer, a `bonne_garde` for every existing booking; idempotent.
- `src/lib/messagerie/rules.ts`: the pure rules (body, night end in Brussels, open or closed, unread, « Lu », reminder positions). `conversations.ts`: every read and write of both tables; `withConversation` wraps the answer's INSERT, `bonneGardeStatement` is a statement of `acceptAnswer`'s batch; `sendMessage` holds the party and the closing rule again in SQL. `actions.ts` (`sendMessageAction`), `notify.ts` (the e-mail), `format.ts`, `paths.ts`.
- `src/lib/reservations/answers.ts`, `bookings.ts`: call the two statements above; nothing else changed in them.
- `src/components/messagerie/`: list, thread, conversation view, composer (client). `src/components/shell/`: `SpaceShell` is now async and reads the unread count for a parent or a professional; `MenuLink` takes an optional `badge`, shown in the desktop nav, in the mobile panel, and summed on the menu button.
- Pages: `/espace/famille/messages` + `[id]`, `/espace/professionnelle/messages` + `[id]`; entry points on `/espace/famille/demandes/[id]` (each answer), `/espace/famille/reservations/[id]`, `/espace/professionnelle/demandes` (answered cards), `/espace/professionnelle/gardes/[id]`.
- Words: `src/content/messagerie.ts` (+ test), `nouveauMessage` in `src/content/emails.ts`, template `newMessageEmail` (+ test).
- README « The conversation » and the schema paragraph; AGENTS routing row and data-model line.

## Acceptance criteria status

Proved on the run's Neon branch (`run/messagerie`) with throwaway probes calling the library functions, then deleted; the pages are for the preview smoke.

- [x] One conversation per answer with its `amorce`; a re-answer after a withdrawal reuses it, still one message. — probe: two answers → two conversations with one amorce each; withdraw + re-answer → same conversation, 1 message.
- [x] No conversation without an answer; a non-party gets not-found and cannot send. — no page or action creates one; probe: another family and the other professional read `null` (→ `notFound()`), a stranger's send → `introuvable`.
- [x] `bonne_garde` in the booked conversation only; both Berceo messages as §2 quotes them, no `!`. — probe after `acceptAnswer`: booked thread `amorce, famille, bonne_garde`, the other `amorce` only; `messagerie.test.ts` holds both texts.
- [x] « Messages » with the unread count in both spaces, on the menu button below md, hidden at zero; cleared by opening. — probe: family 2 unread, professional 1 → 0 after `markRead`; the page marks read before the shell counts, so the count drops on the conversation page itself. Visual check is the smoke's.
- [x] « Lu » under the sender's last message once the other side opened after it. — `readReceiptIndex` tests; probe: the family sees the professional's marker move after she opened it.
- [x] One e-mail per sent message, no text, a link; a retried send inserts once and sends one; refreshes and Berceo's messages send none. — probe: the same id sent twice → `inserted: true`, then `false`; the action schedules the e-mail only on `inserted`; key `message-<id>`; `messageNotice` returns null for Berceo's; nothing sends on a GET.
- [x] Empty or over 2 000 characters refused with a plain message; plain text with line breaks. — `normalizeBody` tests (counted in code points, as `char_length`); the database check holds it again; the thread renders text with `whitespace-pre-line`, never HTML.
- [x] The reminder after the 3rd, 6th … people's message, never in the booked conversation. — `reminderIndexes` tests.
- [x] Closed after the night ends (start + 11 h, Brussels) or once the request is cancelled; history readable; open before whatever the answer's state. — `rules.test.ts` (including the end of summer time); probe: a not-retained professional still sends before the night, any send after cancelling → `fermee`.
- [x] Earlier answers and bookings get a conversation with the matching messages. — probe: the backfill statements of `0008` run twice over an answer and a booking whose conversation was removed → one conversation, `{amorce, bonne_garde}`, `last_message_at` at the confirmation, the amorce at the answer.
- [x] Every new word in `src/content/`, quoted or `@relecture`; `messagerie.test.ts` on the mechanical rules. — the test is written; the advisory job runs it.

## Notes for Release

- **Check before approving: the professional sees the family's first name before a booking.** The spec (§3 list row, §5 e-mail « [Prénom] vous a écrit ») names the family's prénom to the professional in a conversation that may never become a booking. candidature-et-reservation's `notices.ts` held the family's first name back until the booking (its reading of D-15). Built as the spec says; if the operator wants the family unnamed before booking, it is a `revise` (a generic « La famille » in the list, the header and the e-mail).
- `SpaceShell` is now an async server component (one `COUNT` per signed-in page, on the two new indexes). Admin pages use it too; they skip the query.
- The composer makes the message id at submit time (a ref), not at render, so the server's HTML and the browser's agree; a form posted before hydration carries no id and the server makes one (no double-send protection in that one case, which needs a click before the script loaded).
- The nav label lives in `src/content/messagerie.ts` rather than `src/content/portal.ts` (the spec's `touches:` named `portal.ts`): every word of the feature stays in one file. `mobile-menu.tsx` exports a `Badge`.
- Nothing was run locally but the probes against `run/messagerie`: format and lint are not wired (`format.sh`/`lint.sh` → SKIP), so the advisory quality job is the first typecheck, lint and test run of this code.
- The migration is forward-only, additive (two enums, two tables, backfill). A code revert tolerates it.
- Context budget: the spec's `touches:` plus `src/lib/demandes/requests.ts`, `rules.ts`, `format.ts`, `src/lib/reservations/notify.ts`, `notices.ts` and a few component files read for their patterns.

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on the head that merged (ci-status.sh, after the last push; the stop report names the SHA)
- reviews: code medium (/code-review — 1 finding fixed: the field's browser `maxLength` counted an emoji as two; 1 note fixed: « bonne garde » only for the batch's own booking, proved on `run/messagerie`) · security security-check.sh --branch --audit: OK + /security-review — no finding at confidence 8 or more (the gap of a professional no longer `valide` still writing, parked) · readiness env.sh audit --changed: OK · /production-readiness n/a — not installed in this session (the diff touches the database; the migration was proved on `run/messagerie` in Build)
- parked: messagerie-profil-non-valide.md, template-change-router-skill-prompts.md
- migrations: skip — none of this run's own in check-migrations.sh's stamp form (Drizzle 0008, journal order; `main` added none since)
- learned: 1 rule from FAILURE.md (copied by close-out.sh); retrospective.sh skip — no error.log
- docs: no docs impact (the docs tree is the discovery material; README and AGENTS were updated in Build) · announce: deferred to promotion
- merge of main: #43 (encres-contraste) merged in at Release; conflicts in `mobile-menu.tsx` and `portal-shell.tsx` resolved with `main`'s inks, the new components moved to `text-encre-*` for `src/app/contrast.test.ts`
- context budget: the #43 diff and `src/app/contrast.test.ts`, read to resolve the merge; `.claude/hooks/route-request.sh`, read for the template change request

