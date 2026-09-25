# Spec: A conversation per answered request

- slug: messagerie
- personas: parent, professionnel
- touches: src/db/schema.ts, drizzle/**, src/lib/messagerie/**, src/lib/reservations/answers.ts, src/lib/reservations/bookings.ts, src/lib/email/templates.ts, src/components/messagerie/**, src/components/reservations/**, src/components/shell/space-shell.tsx, src/components/shell/portal-shell.tsx, src/components/shell/mobile-menu.tsx, src/app/(portail)/espace/famille/messages/**, src/app/(portail)/espace/professionnelle/messages/**, src/app/(portail)/espace/famille/demandes/[id]/**, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/espace/professionnelle/demandes/**, src/app/(portail)/espace/professionnelle/gardes/**, src/content/messagerie.ts, src/content/messagerie.test.ts, src/content/emails.ts, src/content/portal.ts, README.md, AGENTS.md
- complexity: standard

## Problem

Once a professional has answered a request (candidature-et-reservation), the family and she need
to talk about the baby's rhythm, the arrival time and the access to the home, and today they have
nowhere to do it but outside Berceo: the platform loses the thread of the garde and the family
loses the frame the manual verification gave her. The cahier des charges makes the messagerie a
must-have (E-01 to E-04) and D-16 settles its shape. It advances the Plateforme Berceo V1
objective: a first usable version on uat.berceo.be before December 2026, for a launch in January
2027; it is the last piece before cycle-de-garde-et-annulation, which depends on it.

## Proposed change

**The words.** Every visible word lives in a new `src/content/messagerie.ts` (the pages, the
Berceo messages, the banner), `src/content/emails.ts` (the new-message e-mail) and
`src/content/portal.ts` (the navigation entry), keyed by locale (D-19). Entries quoted from the
cahier des charges or the guide say so; every other entry carries `@relecture Surya`. Vouvoiement,
no `!`, `…` or `—`, no insurance wording (D-8). A new `src/content/messagerie.test.ts` holds the
file to the same mechanical rules as the other catalogue tests.

### 1. One conversation per answer (D-16, D-91, E-01)

A conversation belongs to one answer (`care_request_applications` row): one family, one
professional, one request. It is created in the same transaction that first records her
« Je suis disponible pour cette garde »; a re-answer after a withdrawal updates the same answer
row (D-73) and so finds the same conversation. No other path creates one: a family cannot write to
a professional who has not answered her request, and two professionals never share one.

Only the two parties read it: the family who owns the request and the professional who owns the
answer. Any other signed-in user, a founder included, gets the not-found page (the founders'
access, if any, belongs to back-office-admin).

### 2. Berceo's two messages (D-16, D-87, the cahier des charges E, the guide « La messagerie »)

Berceo posts two messages, shown to both sides under the author « L'équipe Berceo », set apart
from the two people's messages (pearl card, no avatar). Each is stored as a key, not as text, and
rendered from the catalogue, so a revision by Surya reaches every conversation.

- **When she answers** (`amorce`): the guide's « Message d'amorce automatique », « ! » replaced by
  « . » (D-19): « Bonjour. Pour préparer au mieux cette garde, nous vous suggérons d'échanger sur :
  le rythme de votre bébé, ses habitudes d'endormissement, et tout ce que vous souhaitez partager
  sur son quotidien. La professionnelle répondra dès que possible. » `@relecture` (the edit).
- **When the family confirms the booking** (`bonne_garde`), in the booking transaction, in that
  answer's conversation only: the cahier des charges message, « ! » replaced by « . »:
  « L'équipe Berceo vous souhaite une excellente garde. 🤍 N'hésitez pas également à confirmer
  ensemble les derniers détails pratiques (heure d'arrivée, adresse, accès au domicile, besoins
  particuliers du bébé, etc.). Nous vous souhaitons une belle expérience et une garde en toute
  sérénité. » `@relecture` (the edit).

Neither sends an e-mail: the family already receives « [Prénom] a répondu à votre demande » and
both sides the booking confirmation. Both count as unread (§4) until the conversation is opened.

### 3. Writing and reading (D-91)

**Where.** Each space gains « Messages » (`@relecture`) in its navigation:
`/espace/famille/messages` and `/espace/professionnelle/messages` list the viewer's
conversations, the one with the latest message first. A row shows the other party's prénom (the
family sees the professional's prénom and profession; the professional sees the family's prénom),
the night's date, the first line of the last message and an unread marker. The family's empty
state quotes the guide: « La messagerie s'ouvre dès qu'une professionnelle postule à votre
demande. Vous pouvez échanger pour préciser les modalités de la garde. »; the professional's is
`@relecture`. A conversation opens at `…/messages/[id]`.

**Entry points.** « Écrire à [Prénom] » (`@relecture`) on each answer card of
`/espace/famille/demandes/[id]` and on `/espace/famille/reservations/[id]`; « Voir la
conversation » (`@relecture`) on a request card of `/espace/professionnelle/demandes` she has
answered and on `/espace/professionnelle/gardes/[id]`.

**The page.** A header naming the other party and the night (« Garde du [date], de 20h00 à
7h00 »), with a link back to the request or the booking. Messages in the order they were sent,
the viewer's own on the right, each with its time; the dates of the conversation group them by
day. Plain text only: line breaks kept, nothing rendered as HTML, links not made clickable. Under
the viewer's last message, « Lu » (`@relecture`) once the other party has opened the conversation
after it was sent (E-04).

**Sending.** A text field and « Envoyer » (`@relecture`). A message is 1 to 2 000 characters after
trimming; the server refuses an empty or longer one with a plain message. The button is disabled
while a send is in flight, and the client gives every message its id: a retried or double-clicked
send inserts once. No attachments.

**The banner, reworded** (D-88: the guide's « Rappel discret », minus the insurance claim, D-8). In a
conversation whose answer is not the booked one (`retenue`), after every third message written by
the two people (the 3rd, the 6th, …; Berceo's are not counted), a discreet line in the flow:
« Une garde est réservée une fois confirmée sur Berceo. » `@relecture`. Fixed positions, never
random; never shown in the booked conversation.

### 4. Read state and the unread count (D-91, E-04)

Each side has a read marker per conversation: opening the conversation page moves the viewer's
marker to now. A message is unread for a viewer when someone other than the viewer (the other
party, or Berceo) wrote it after the viewer's marker. The unread count is the number of the
viewer's conversations holding at least one unread message; it sits next to « Messages » in the
header navigation and, below md, on the menu button, and is hidden at zero. It is read on each
page load; no live update, a refresh shows new messages.

### 5. The e-mail on a new message (D-90, E-03)

Every message one of the two people sends e-mails the other party, once, with no message text
(the conversation stays on Berceo), in the guide's e-mail structure:

- subject « [Prénom] vous a écrit » `@relecture`;
- « Bonjour [Prénom], », then « [Prénom] vous a écrit au sujet de la garde du [date]. Vous pouvez
  lui répondre sur Berceo. » `@relecture`;
- a button « Lire le message » `@relecture` to the conversation; signature « L'équipe Berceo ».

It is sent by the send action only, after the message is committed (`after()`, as the answer
e-mail), with idempotency key `message-<message id>`: a retry never sends twice and loading or
refreshing a page never sends anything. A failed send is logged and never undoes the message.
Berceo's messages send none (§2).

### 6. When a conversation closes (D-16, D-89, E-02)

A conversation accepts messages until the night ends (the request's night date and start time,
Europe/Brussels, plus 11 hours), whatever its answer's state: pending, booked, not retained or
withdrawn. It closes early when the request is cancelled. Once closed, both sides still read the
whole history; the field and « Envoyer » are replaced by « Cette conversation est fermée. Vous
pouvez toujours la relire. » `@relecture`, and the server refuses a send. The rule lives in one
function in `src/lib/messagerie/rules.ts` so cycle-de-garde-et-annulation extends it for a
cancelled booking.

### 7. Data

One migration (`db:generate -- --name messagerie`):

- `conversations`: id, `application_id` (unique, cascade), `request_id`, `profile_id`,
  `family_user_id` (copied for the list queries), `family_last_read_at`,
  `professional_last_read_at` (nullable), `last_message_at`, timestamps; indexes on
  `(family_user_id, last_message_at)` and `(profile_id, last_message_at)`.
- `messages`: id (client-supplied uuid, primary key), `conversation_id` (cascade), `author`
  enum (`berceo`, `famille`, `professionnelle`), `body` (null for Berceo's), `berceo_key` enum
  (`amorce`, `bonne_garde`, null for the people's), `created_at`; a check that exactly one of
  `body` and `berceo_key` is set, that `berceo_key` is set iff the author is `berceo`, and that
  `body` is 1 to 2 000 characters; index `(conversation_id, created_at)`.
- The migration backfills a conversation for every existing answer, with its `amorce` dated at
  the answer's `answered_at`, and a `bonne_garde` dated at `confirmed_at` for every existing
  booking, so the answers and bookings already on UAT have one.

`src/lib/messagerie/` holds the only reads and writes of both tables (rules, queries, the send
action's server side); `answers.ts` and `bookings.ts` call it inside their transactions.

## Acceptance criteria

- [ ] Answering a request creates exactly one conversation for that answer, with Berceo's `amorce` message; re-answering after a withdrawal reuses it and adds no second `amorce`.
- [ ] No conversation exists without an answer: no page or action lets a family or a professional start one, and a signed-in user who is not one of its two parties gets the not-found page for its URL and cannot send to it.
- [ ] Confirming a booking posts Berceo's `bonne_garde` message in the booked answer's conversation only; both Berceo messages read as the catalogue entries quoted in §2, with no `!`.
- [ ] Each space's header navigation shows « Messages » with the count of conversations holding an unread message, on the menu button too below md, hidden at zero; opening the conversation clears it on the next page load.
- [ ] A sender sees « Lu » under her last message once the other party has opened the conversation after it, and not before.
- [ ] Each message one party sends produces exactly one e-mail to the other, carrying no message text and linking to the conversation; a double-clicked or retried send inserts one message and sends one e-mail; refreshing sends none; Berceo's messages send none.
- [ ] An empty or over-2 000-character message is refused with a plain message; a message renders as plain text with its line breaks.
- [ ] In a conversation whose answer is not booked, the reminder line appears after the 3rd, 6th, … people's message; it never appears in the booked conversation.
- [ ] After the night ends (start + 11 h, Europe/Brussels), or once the request is cancelled, the conversation shows the closed line instead of the field, the server refuses a send, and both sides still read the full history; before that it accepts messages whatever the answer's state.
- [ ] Answers and bookings made before the migration each have a conversation with the matching Berceo messages.
- [ ] Every new visible word is in `src/content/`, quoted or marked `@relecture`, and `messagerie.test.ts` passes the catalogue's mechanical rules.

## Out of scope

- Live updates, typing indicators, push notifications: a refresh shows new messages (stub).
- Attachments and images; phone-number or e-mail detection or blocking (stub).
- The founders reading or moderating conversations, a report button (back-office-admin; DSA features wait for the lawyer).
- Closing on a cancelled booking and the cancellation notifications: cycle-de-garde-et-annulation extends the §6 rule.
- An e-mail digest or batching of new-message e-mails, and a setting to turn them off.
- Deleting or editing a sent message.

## Open questions

- none. The operator's answers in this Define session, 2026-09-25, are D-87 to D-90; D-91 is Define's (routes under each space rather than the stub's `/messages`, one conversation per answer, per-side read markers); `revise` changes them. Surya reviews every `@relecture` entry, the two edited Berceo messages and the reworded banner included; a changed wording is a catalogue edit, not a spec change.
