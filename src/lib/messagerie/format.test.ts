import { describe, expect, it } from "vitest";

import { conversationNight, conversationTitle, listNight, messageDay, messageTime, preview, unreadLabel } from "./format";

/**
 * Spec (messagerie): the night as the conversation names it, a message's day
 * and time in Brussels, the list's preview (the first line of the last
 * message, a word for Berceo's) and the header's count for screen readers.
 */

describe("how a conversation reads", () => {
  it("names the other person with a capital first letter (round 2, JAM-345)", () => {
    expect(conversationTitle({ firstName: "alix", profession: "sage_femme" })).toBe(
      "Conversation avec Alix, Sage-femme",
    );
    expect(conversationTitle({ firstName: "Alix", profession: "sage_femme" })).toBe(
      "Conversation avec Alix, Sage-femme",
    );
    expect(conversationTitle({ firstName: "élodie", profession: null })).toBe("Conversation avec Élodie");
  });

  it("keeps each part of a compound first name", () => {
    expect(conversationTitle({ firstName: "marie-claire", profession: null })).toBe(
      "Conversation avec Marie-Claire",
    );
    expect(conversationTitle({ firstName: "anne sophie", profession: null })).toBe("Conversation avec Anne Sophie");
    expect(conversationTitle({ firstName: "jean-françois", profession: "puericultrice" })).toBe(
      "Conversation avec Jean-François, Puéricultrice",
    );
  });

  it("does not change a letter that is already a capital", () => {
    expect(conversationTitle({ firstName: "McKenzie", profession: null })).toBe("Conversation avec McKenzie");
    expect(conversationTitle({ firstName: "ALIX", profession: null })).toBe("Conversation avec ALIX");
  });

  it("gives the profession one capital, on its first word", () => {
    expect(conversationTitle({ firstName: "emma", profession: "etudiante_sage_femme_3e" })).toBe(
      "Conversation avec Emma, Étudiante sage-femme, 3e année",
    );
  });

  it("names the night", () => {
    expect(listNight("2026-09-30")).toBe("Garde du 30/09/2026");
    expect(conversationNight("2026-09-30", "20:00:00", 0)).toBe("Garde du 30/09/2026, de 20h00 à 7h00");
    expect(conversationNight("2026-09-30", "19:00:00", 2)).toBe("Garde du 30/09/2026, de 19h00 à 8h00");
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
