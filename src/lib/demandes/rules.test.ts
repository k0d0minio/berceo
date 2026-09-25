import { describe, expect, it } from "vitest";

import {
  AGE_RANGES,
  START_TIMES,
  addDays,
  brusselsNow,
  dateWindow,
  displayStatus,
  endTime,
  hasNightStarted,
  isAgeInRange,
  isChangeable,
  isDateInWindow,
  isDigestTime,
  isStartTime,
} from "./rules";

/**
 * Spec (demande-de-garde, D-50, D-51, D-54, D-55): the two date windows in
 * Brussels time, the start-time slots, the age ranges, the end of the night
 * (start + 11 h) and the digest's 18:00 gate in summer and winter time.
 * Written from the acceptance criteria, not from the implementation.
 */

// 25 September 2026, 12:00 in Brussels (CEST, UTC+2).
const SUMMER_NOON = new Date("2026-09-25T10:00:00Z");

describe("Brussels time", () => {
  it("reads the calendar date in Brussels, not in UTC, around midnight", () => {
    // 22:30 UTC on the 25th is 00:30 on the 26th in Brussels (summer).
    expect(brusselsNow(new Date("2026-09-25T22:30:00Z")).date).toBe("2026-09-26");
    // 23:30 UTC on 15 January is 00:30 on the 16th in Brussels (winter).
    expect(brusselsNow(new Date("2026-01-15T23:30:00Z")).date).toBe("2026-01-16");
    // 21:30 UTC on the 25th is still 23:30 on the 25th in Brussels.
    expect(brusselsNow(new Date("2026-09-25T21:30:00Z")).date).toBe("2026-09-25");
  });

  it("adds calendar days across months and years", () => {
    expect(addDays("2026-09-25", 56)).toBe("2026-11-20");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("a normal request's date", () => {
  it("is refused for today and tomorrow, accepted from the day after tomorrow", () => {
    expect(isDateInWindow(false, "2026-09-25", SUMMER_NOON)).toBe(false);
    expect(isDateInWindow(false, "2026-09-26", SUMMER_NOON)).toBe(false);
    expect(isDateInWindow(false, "2026-09-27", SUMMER_NOON)).toBe(true);
  });

  it("is accepted on day 56 and refused after it", () => {
    expect(isDateInWindow(false, "2026-11-20", SUMMER_NOON)).toBe(true);
    expect(isDateInWindow(false, "2026-11-21", SUMMER_NOON)).toBe(false);
  });

  it("is refused in the past and when it is not a real date", () => {
    expect(isDateInWindow(false, "2026-09-01", SUMMER_NOON)).toBe(false);
    expect(isDateInWindow(false, "2026-10-32", SUMMER_NOON)).toBe(false);
    expect(isDateInWindow(false, "demain", SUMMER_NOON)).toBe(false);
  });

  it("follows the Brussels day just after midnight", () => {
    // 00:30 on the 26th in Brussels: the 28th is the first night allowed.
    const justAfterMidnight = new Date("2026-09-25T22:30:00Z");
    expect(dateWindow(false, justAfterMidnight)).toEqual({ min: "2026-09-28", max: "2026-11-21" });
  });
});

describe("an urgent request's date", () => {
  it("is tonight or tomorrow night, nothing else", () => {
    expect(dateWindow(true, SUMMER_NOON)).toEqual({ min: "2026-09-25", max: "2026-09-26" });
    expect(isDateInWindow(true, "2026-09-25", SUMMER_NOON)).toBe(true);
    expect(isDateInWindow(true, "2026-09-26", SUMMER_NOON)).toBe(true);
    expect(isDateInWindow(true, "2026-09-27", SUMMER_NOON)).toBe(false);
    expect(isDateInWindow(true, "2026-09-24", SUMMER_NOON)).toBe(false);
  });
});

describe("start times", () => {
  it("are every half hour from 18:00 to 23:00", () => {
    expect(START_TIMES[0]).toBe("18:00");
    expect(START_TIMES.at(-1)).toBe("23:00");
    expect(START_TIMES).toHaveLength(11);
    expect(isStartTime("20:30")).toBe(true);
  });

  it("refuse anything else", () => {
    for (const refused of ["17:30", "23:30", "20:15", "8:00", "20:00:00", ""]) {
      expect(isStartTime(refused)).toBe(false);
    }
  });
});

describe("the end of the night", () => {
  it("is 11 hours after the start, the next morning", () => {
    expect(endTime("20:00")).toBe("07:00");
    expect(endTime("18:00")).toBe("05:00");
    expect(endTime("18:30")).toBe("05:30");
    expect(endTime("23:00:00")).toBe("10:00");
  });
});

describe("a night that has started", () => {
  // 20:15 in Brussels on 25 September.
  const evening = new Date("2026-09-25T18:15:00Z");

  it("is one whose date and start time are past in Brussels", () => {
    expect(hasNightStarted("2026-09-25", "20:00", evening)).toBe(true);
    expect(hasNightStarted("2026-09-25", "20:30", evening)).toBe(false);
    expect(hasNightStarted("2026-09-24", "23:00:00", evening)).toBe(true);
    expect(hasNightStarted("2026-09-26", "18:00:00", evening)).toBe(false);
  });

  it("reads as « passée » and can no longer change; a cancelled one stays cancelled", () => {
    const started = { status: "ouverte" as const, nightDate: "2026-09-25", startTime: "20:00:00" };
    const ahead = { status: "ouverte" as const, nightDate: "2026-09-26", startTime: "20:00:00" };
    expect(displayStatus(started, evening)).toBe("passee");
    expect(isChangeable(started, evening)).toBe(false);
    expect(displayStatus(ahead, evening)).toBe("ouverte");
    expect(isChangeable(ahead, evening)).toBe(true);
    expect(displayStatus({ ...ahead, status: "annulee" }, evening)).toBe("annulee");
    expect(isChangeable({ ...ahead, status: "annulee" }, evening)).toBe(false);
  });
});

describe("the baby's age", () => {
  it("is 0 to 12 weeks or 1 to 24 months, in whole numbers", () => {
    expect(AGE_RANGES).toEqual({ semaines: { min: 0, max: 12 }, mois: { min: 1, max: 24 } });
    expect(isAgeInRange(0, "semaines")).toBe(true);
    expect(isAgeInRange(12, "semaines")).toBe(true);
    expect(isAgeInRange(13, "semaines")).toBe(false);
    expect(isAgeInRange(0, "mois")).toBe(false);
    expect(isAgeInRange(1, "mois")).toBe(true);
    expect(isAgeInRange(24, "mois")).toBe(true);
    expect(isAgeInRange(25, "mois")).toBe(false);
    expect(isAgeInRange(1.5, "mois")).toBe(false);
  });
});

describe("the digest's gate", () => {
  it("opens at 18:00 in Brussels in summer time (16:00 UTC)", () => {
    expect(isDigestTime(new Date("2026-07-15T15:59:00Z"))).toBe(false);
    expect(isDigestTime(new Date("2026-07-15T16:00:00Z"))).toBe(true);
    expect(isDigestTime(new Date("2026-07-15T17:00:00Z"))).toBe(true);
  });

  it("opens at 18:00 in Brussels in winter time (17:00 UTC)", () => {
    expect(isDigestTime(new Date("2026-01-15T16:00:00Z"))).toBe(false);
    expect(isDigestTime(new Date("2026-01-15T17:00:00Z"))).toBe(true);
  });
});
