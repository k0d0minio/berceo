import { addDays, brusselsNow, endTime } from "@/lib/demandes/rules";

/**
 * The conversation's rules (messagerie), pure so the tests hold them: when a
 * conversation accepts messages (D-89), what a message may be, what is unread
 * for whom (D-91), where « Lu » sits and where the reminder line falls (D-88).
 * `src/lib/messagerie/conversations.ts` holds each of them again in the SQL
 * of the write it governs.
 */

/** A message is 1 to 2 000 characters once trimmed (counted as the database counts them). */
export const MESSAGE_MAX = 2000;

/** The reminder line falls after every third message the two people wrote (D-88). */
export const REMINDER_EVERY = 3;

/** The two sides of a conversation, as `messages.author` names them. */
export type Side = "famille" | "professionnelle";

export type Author = Side | "berceo";

export type BodyResult = { ok: true; body: string } | { ok: false; reason: "vide" | "tropLong" };

/** Trims the text, keeps its line breaks (as `\n`), and holds it to 1 to 2 000 characters. */
export function normalizeBody(raw: string): BodyResult {
  const body = raw.replace(/\r\n?/g, "\n").trim();
  const length = Array.from(body).length;
  if (length === 0) return { ok: false, reason: "vide" };
  if (length > MESSAGE_MAX) return { ok: false, reason: "tropLong" };
  return { ok: true, body };
}

/** Whether the night of `date` starting at `startTime` (11 hours, D-20) has ended in Brussels at `now`. */
export function hasNightEnded(date: string, startTime: string, now: Date): boolean {
  // Every night starts between 18:00 and 23:00, so it ends the next morning.
  const here = brusselsNow(now);
  return `${addDays(date, 1)}T${endTime(startTime)}` <= `${here.date}T${here.time}`;
}

export type ConversationRequest = {
  status: "ouverte" | "annulee" | "attribuee";
  nightDate: string;
  startTime: string;
};

/**
 * A conversation accepts messages until its request's night ends, whatever its
 * answer's state; a cancelled request closes it at once (D-89). Closed, it
 * stays readable by both.
 */
export function isConversationOpen(request: ConversationRequest, now: Date): boolean {
  return request.status !== "annulee" && !hasNightEnded(request.nightDate, request.startTime, now);
}

/** The other side of a conversation. */
export function otherSide(side: Side): Side {
  return side === "famille" ? "professionnelle" : "famille";
}

export type TimedMessage = { author: Author; createdAt: Date };

/** A message is unread for a side when the other one, or Berceo, wrote it after that side last opened the conversation. */
export function isUnread(message: TimedMessage, side: Side, lastReadAt: Date | null): boolean {
  if (message.author === side) return false;
  return lastReadAt === null || message.createdAt > lastReadAt;
}

/**
 * The index of the viewer's last message, when « Lu » belongs under it: the
 * other side opened the conversation at or after it was sent. Null otherwise.
 */
export function readReceiptIndex(
  messages: readonly TimedMessage[],
  side: Side,
  otherLastReadAt: Date | null,
): number | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.author !== side) continue;
    return otherLastReadAt !== null && otherLastReadAt >= message.createdAt ? i : null;
  }
  return null;
}

/**
 * The indexes of the messages the reminder line follows (D-88): the 3rd, 6th …
 * message written by the two people, Berceo's not counted. None in the booked
 * conversation.
 */
export function reminderIndexes(messages: readonly { author: Author }[], booked: boolean): number[] {
  if (booked) return [];
  const indexes: number[] = [];
  let written = 0;
  messages.forEach((message, i) => {
    if (message.author === "berceo") return;
    written += 1;
    if (written % REMINDER_EVERY === 0) indexes.push(i);
  });
  return indexes;
}
