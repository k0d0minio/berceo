import { describe, expect, it } from "vitest";

import { conversationNight, listNight, messageDay, messageTime, preview, unreadLabel } from "./format";

/**
 * Spec (messagerie): the night as the conversation names it, a message's day
 * and time in Brussels, the list's preview (the first line of the last
 * message, a word for Berceo's) and the header's count for screen readers.
 */

describe("how a conversation reads", () => {
  it("names the night", () => {
    expect(listNight("2026-09-30")).toBe("Garde du 30/09/2026");
    expect(conversationNight("2026-09-30", "20:00:00")).toBe("Garde du 30/09/2026, de 20h00 à 7h00");
  });

  it("dates a message in Brussels", () => {
    // 23:30 UTC on 30 September is 01:30 on 1 October in Brussels (CEST).
    const at = new Date("2026-09-30T23:30:00Z");
    expect(messageDay(at)).toBe("01/10/2026");
    expect(messageTime(at)).toBe("1h30");
  });

  it("previews the first line of the last message", () => {
    expect(preview({ author: "famille", body: "Bonjour,\nà 20h", berceoKey: null })).toBe("Bonjour,");
    expect(preview({ author: "berceo", body: null, berceoKey: "amorce" })).toBe("Un message de l'équipe Berceo");
    expect(preview(null)).toBe("");
  });

  it("counts unread conversations for screen readers", () => {
    expect(unreadLabel(1)).toBe("1 conversation non lue");
    expect(unreadLabel(3)).toBe("3 conversations non lues");
  });
});
