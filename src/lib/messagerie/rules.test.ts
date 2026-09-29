import { describe, expect, it } from "vitest";

import { hasNightEnded } from "@/lib/demandes/rules";

import {
  isConversationOpen,
  isUnread,
  MESSAGE_MAX,
  normalizeBody,
  readReceiptIndex,
  reminderIndexes,
  type Author,
  type TimedMessage,
} from "./rules";

/**
 * Spec (messagerie, D-88, D-89, D-91; messagerie-profil-non-valide, D-156 to
 * D-158): a message of 1 to 2 000 characters with its line breaks; a
 * conversation open until the night ends (start + 11 h, Europe/Brussels)
 * whatever the answer's state, closed at once by a cancelled request, and
 * closed while its professional is not `valide` unless her answer is the
 * booked one, open again once she is `valide`; unread for a side when the other side or Berceo wrote after its
 * marker; « Lu » under the sender's last message once the other side opened
 * the conversation after it; the reminder after the 3rd, 6th … people's
 * message, never in the booked conversation. Written from the acceptance
 * criteria.
 */

// The night of 30 September 2026 from 20:00 ends on 1 October at 07:00 in Brussels (CEST, UTC+2).
const night = { nightDate: "2026-09-30", startTime: "20:00:00", profileStatus: "valide", booked: false } as const;
const BEFORE_END = new Date("2026-10-01T04:59:00Z"); // 06:59 in Brussels
const AT_END = new Date("2026-10-01T05:00:00Z"); // 07:00 in Brussels
const DURING = new Date("2026-09-30T20:00:00Z"); // 22:00 in Brussels, the night under way

describe("normalizeBody", () => {
  it("refuses an empty or blank message", () => {
    expect(normalizeBody("")).toEqual({ ok: false, reason: "vide" });
    expect(normalizeBody("   \n\t ")).toEqual({ ok: false, reason: "vide" });
  });

  it("accepts 2 000 characters and refuses 2 001", () => {
    expect(normalizeBody("a".repeat(MESSAGE_MAX))).toEqual({ ok: true, body: "a".repeat(2000) });
    expect(normalizeBody("a".repeat(MESSAGE_MAX + 1))).toEqual({ ok: false, reason: "tropLong" });
  });

  it("counts after trimming", () => {
    expect(normalizeBody(`  ${"a".repeat(MESSAGE_MAX)}  `).ok).toBe(true);
  });

  it("counts an emoji as one character, as the database does", () => {
    expect(normalizeBody("🤍".repeat(MESSAGE_MAX)).ok).toBe(true);
  });

  it("keeps the line breaks inside the message", () => {
    expect(normalizeBody("Bonjour,\r\nà 20h.\rMerci")).toEqual({ ok: true, body: "Bonjour,\nà 20h.\nMerci" });
  });
});

describe("when a conversation accepts messages (D-89)", () => {
  it("ends the night 11 hours after it starts, in Brussels", () => {
    expect(hasNightEnded(night.nightDate, night.startTime, BEFORE_END)).toBe(false);
    expect(hasNightEnded(night.nightDate, night.startTime, AT_END)).toBe(true);
  });

  it("keeps a late night's end the next morning", () => {
    // 23:00 on 30 September ends at 10:00 on 1 October.
    expect(hasNightEnded("2026-09-30", "23:00:00", new Date("2026-10-01T07:59:00Z"))).toBe(false);
    expect(hasNightEnded("2026-09-30", "23:00:00", new Date("2026-10-01T08:00:00Z"))).toBe(true);
  });

  it("follows Brussels across the change to winter time", () => {
    // 24 October 2026 at 20:00 ends on 25 October at 07:00, after the clocks went back (CET, UTC+1).
    expect(hasNightEnded("2026-10-24", "20:00:00", new Date("2026-10-25T05:59:00Z"))).toBe(false);
    expect(hasNightEnded("2026-10-24", "20:00:00", new Date("2026-10-25T06:00:00Z"))).toBe(true);
  });

  it.each(["ouverte", "attribuee"] as const)("stays open for a request %s until the night ends", (status) => {
    expect(isConversationOpen({ ...night, status }, DURING)).toBe(true);
    expect(isConversationOpen({ ...night, status }, BEFORE_END)).toBe(true);
    expect(isConversationOpen({ ...night, status }, AT_END)).toBe(false);
  });

  it("closes at once when the request is cancelled", () => {
    expect(isConversationOpen({ ...night, status: "annulee" }, new Date("2026-09-25T10:00:00Z"))).toBe(false);
  });
});

describe("when her profile is not `valide` (D-156, D-158)", () => {
  const NOT_VALIDE = ["brouillon", "en_attente", "complement_demande", "refuse"] as const;

  it.each(NOT_VALIDE)("closes a conversation not booked while her profile is %s", (profileStatus) => {
    expect(isConversationOpen({ ...night, status: "ouverte", profileStatus, booked: false }, DURING)).toBe(false);
  });

  it.each(NOT_VALIDE)("keeps the booked conversation open while her profile is %s", (profileStatus) => {
    expect(isConversationOpen({ ...night, status: "attribuee", profileStatus, booked: true }, DURING)).toBe(true);
  });

  it.each([true, false])("leaves a `valide` profile's conversation to D-89 (booked: %s)", (booked) => {
    expect(isConversationOpen({ ...night, status: "attribuee", booked }, DURING)).toBe(true);
    expect(isConversationOpen({ ...night, status: "attribuee", booked }, AT_END)).toBe(false);
  });

  it("still closes the booked conversation when the night ends or the request is cancelled", () => {
    const booked = { ...night, profileStatus: "brouillon", booked: true } as const;
    expect(isConversationOpen({ ...booked, status: "attribuee" }, AT_END)).toBe(false);
    expect(isConversationOpen({ ...booked, status: "annulee" }, DURING)).toBe(false);
  });

  it("opens again once she is `valide` before the night ends, with nothing stored", () => {
    const facts = { ...night, status: "ouverte", booked: false } as const;
    expect(isConversationOpen({ ...facts, profileStatus: "complement_demande" }, DURING)).toBe(false);
    expect(isConversationOpen({ ...facts, profileStatus: "valide" }, DURING)).toBe(true);
    expect(isConversationOpen({ ...facts, profileStatus: "valide" }, AT_END)).toBe(false);
  });
});

function at(author: Author, iso: string): TimedMessage {
  return { author, createdAt: new Date(iso) };
}

describe("unread (D-91)", () => {
  const read = new Date("2026-09-26T10:00:00Z");

  it("never counts the viewer's own message", () => {
    expect(isUnread(at("famille", "2026-09-26T11:00:00Z"), "famille", null)).toBe(false);
  });

  it("counts the other side's and Berceo's messages after the marker", () => {
    expect(isUnread(at("professionnelle", "2026-09-26T11:00:00Z"), "famille", read)).toBe(true);
    expect(isUnread(at("berceo", "2026-09-26T11:00:00Z"), "famille", read)).toBe(true);
  });

  it("counts everything from the others when the side never opened the conversation", () => {
    expect(isUnread(at("berceo", "2026-09-20T11:00:00Z"), "professionnelle", null)).toBe(true);
  });

  it("clears once the side opened the conversation after the message", () => {
    expect(isUnread(at("professionnelle", "2026-09-26T09:00:00Z"), "famille", read)).toBe(false);
  });
});

describe("« Lu »", () => {
  const thread = [
    at("berceo", "2026-09-26T08:00:00Z"),
    at("famille", "2026-09-26T09:00:00Z"),
    at("professionnelle", "2026-09-26T09:30:00Z"),
    at("famille", "2026-09-26T10:00:00Z"),
  ];

  it("sits under the sender's last message once the other side opened the conversation after it", () => {
    expect(readReceiptIndex(thread, "famille", new Date("2026-09-26T10:05:00Z"))).toBe(3);
  });

  it("is absent before the other side opened it after that message", () => {
    expect(readReceiptIndex(thread, "famille", new Date("2026-09-26T09:45:00Z"))).toBeNull();
    expect(readReceiptIndex(thread, "famille", null)).toBeNull();
  });

  it("is absent when the viewer has written nothing", () => {
    expect(readReceiptIndex([thread[0]], "professionnelle", new Date("2026-09-27T00:00:00Z"))).toBeNull();
  });
});

describe("the reminder line (D-88)", () => {
  const people: Author[] = ["famille", "professionnelle", "famille", "professionnelle", "famille", "professionnelle", "famille"];

  it("follows the 3rd and 6th people's message", () => {
    expect(reminderIndexes(people.map((author) => ({ author })), false)).toEqual([2, 5]);
  });

  it("does not count Berceo's messages", () => {
    const thread: Author[] = ["berceo", "famille", "professionnelle", "berceo", "famille"];
    expect(reminderIndexes(thread.map((author) => ({ author })), false)).toEqual([4]);
  });

  it("never appears in the booked conversation", () => {
    expect(reminderIndexes(people.map((author) => ({ author })), true)).toEqual([]);
  });
});
