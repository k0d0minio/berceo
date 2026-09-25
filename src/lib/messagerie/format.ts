import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { formatDate, formatTime } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";
import { recapNight } from "@/lib/reservations/format";

import type { LastMessage } from "./conversations";

/**
 * How a conversation reads: its night (« Garde du 30/09/2026, de 20h00 à
 * 7h00 »), the day and time of a message in Brussels, the list's preview of
 * the last message and the header's unread label. Pure, so the tests hold the
 * wording.
 */

const t = words(messagerie);

/** « Garde du 30/09/2026 », in the list. */
export function listNight(nightDate: string): string {
  return fill(t.liste.garde, { date: formatDate(nightDate) });
}

/** « Garde du 30/09/2026, de 20h00 à 7h00 », on the conversation page. */
export function conversationNight(nightDate: string, startTime: string): string {
  const night = recapNight(nightDate, startTime);
  return fill(t.conversation.garde, { date: night.date, heures: night.heures });
}

/** The day a message was sent, in Brussels: « 26/09/2026 ». */
export function messageDay(at: Date): string {
  return formatDate(brusselsNow(at).date);
}

/** The time a message was sent, in Brussels: « 20h15 ». */
export function messageTime(at: Date): string {
  return formatTime(brusselsNow(at).time);
}

/** The list's preview: the first line of the last message, or a word for Berceo's. */
export function preview(last: LastMessage | null): string {
  if (!last) return "";
  if (last.author === "berceo" || last.body === null) return t.liste.apercuBerceo;
  return last.body.split("\n")[0];
}

/** « 1 conversation non lue », « 3 conversations non lues », for screen readers. */
export function unreadLabel(n: number): string {
  return n === 1 ? t.nav.nonLue : fill(t.nav.nonLues, { n: String(n) });
}
