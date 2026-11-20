import { describe, expect, it } from "vitest";

import {
  AGE_RANGES,
  START_TIMES,
  addDays,
  brusselsNow,
  dateWindow,
  displayStatus,
  endTime,
  hasNightEnded,
  hasNightStarted,
  isAgeInRange,
  isChangeable,
  isDateInWindow,
  isEditable,
  isDigestTime,
  areFeedings,
  EXTRA_HOURS,
  FEEDINGS,
  isChildCount,
  isExtraHours,
  isStartTime,
  isTooOld,
  MAX_AGE_MONTHS,
  MAX_CHILDREN,
  MAX_SERIES_NIGHTS,
  parseExtraHours,
  sortFeedings,
  seriesWindow,
} from "./rules";

/**
 * Spec (demande-de-garde, D-60, D-61, D-64, D-65): the two date windows in
 * Brussels time, the start-time slots, the age ranges, the end of the night
 * (start + 11 h + the extra hours, demande-heures-supplementaires) and the digest's 18:00 gate in summer and winter time.
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

/**
 * Spec (demande-nuits-regulieres): regular nights run from the day after
 * tomorrow to the last day of next month in Brussels, 31 nights at most
 * (Jamie, 2026-10-28). Day 56 does not bind a series.
 */
describe("regular nights' window", () => {
  it("runs from the day after tomorrow to the last day of next month", () => {
    expect(seriesWindow(SUMMER_NOON)).toEqual({ min: "2026-09-27", max: "2026-10-31" });
    expect(seriesWindow(new Date("2026-10-28T11:00:00Z"))).toEqual({ min: "2026-10-30", max: "2026-11-30" });
  });

  it("crosses the year in December and ends on 28 or 29 February in January", () => {
    expect(seriesWindow(new Date("2026-12-15T11:00:00Z"))).toEqual({ min: "2026-12-17", max: "2027-01-31" });
    expect(seriesWindow(new Date("2027-01-31T11:00:00Z"))).toEqual({ min: "2027-02-02", max: "2027-02-28" });
    expect(seriesWindow(new Date("2028-01-10T11:00:00Z")).max).toBe("2028-02-29");
  });

  it("reaches past day 56 at the start of a month", () => {
    // 1 October: day 56 is 26 November, the window ends on 30 November.
    const first = new Date("2026-10-01T10:00:00Z");
    expect(seriesWindow(first).max > dateWindow(false, first).max).toBe(true);
  });

  it("follows the Brussels day just after midnight on the last day of a month", () => {
    // 00:30 on 1 November in Brussels (winter): next month is December.
    expect(seriesWindow(new Date("2026-10-31T23:30:00Z"))).toEqual({ min: "2026-11-03", max: "2026-12-31" });
  });

  it("holds 31 nights at most", () => {
    expect(MAX_SERIES_NIGHTS).toBe(31);
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
  it("is 11 hours after the start with 0 extra hours, the next morning", () => {
    expect(endTime("20:00", 0)).toBe("07:00");
    expect(endTime("18:00", 0)).toBe("05:00");
    expect(endTime("18:30", 0)).toBe("05:30");
    expect(endTime("23:00:00", 0)).toBe("10:00");
  });

  it("moves by the extra hours: 19:00 with 2 extra hours ends at 08:00", () => {
    expect(endTime("19:00", 2)).toBe("08:00");
    expect(endTime("19:00:00", 2)).toBe("08:00");
    // The latest night: 23:00 with 6 extra hours ends the next day at 16:00.
    expect(endTime("23:00", 6)).toBe("16:00");
  });

  it("has passed at the end in Brussels, with 0 and with 2 extra hours", () => {
    // 19:00 on 30 September, CEST: 0 extra hours end at 06:00 (04:00Z), 2 at 08:00 (06:00Z).
    expect(hasNightEnded("2026-09-30", "19:00", 0, new Date("2026-10-01T03:59:00Z"))).toBe(false);
    expect(hasNightEnded("2026-09-30", "19:00", 0, new Date("2026-10-01T04:00:00Z"))).toBe(true);
    expect(hasNightEnded("2026-09-30", "19:00", 2, new Date("2026-10-01T04:00:00Z"))).toBe(false);
    expect(hasNightEnded("2026-09-30", "19:00", 2, new Date("2026-10-01T05:59:00Z"))).toBe(false);
    expect(hasNightEnded("2026-09-30", "19:00", 2, new Date("2026-10-01T06:00:00Z"))).toBe(true);
    // The latest night ends on the next day at 16:00 (14:00Z), not on the day after.
    expect(hasNightEnded("2026-09-30", "23:00", 6, new Date("2026-10-01T13:59:00Z"))).toBe(false);
    expect(hasNightEnded("2026-09-30", "23:00", 6, new Date("2026-10-01T14:00:00Z"))).toBe(true);
  });
});

describe("the extra hours (JAM-303)", () => {
  it("go by half hours from 0 to 6", () => {
    for (const accepted of [0, 0.5, 1, 1.5, 2, 5.5, 6]) expect(isExtraHours(accepted)).toBe(true);
    for (const refused of [-1, -0.5, 6.5, 7, 1.25, 0.1, Number.NaN]) expect(isExtraHours(refused)).toBe(false);
  });

  it("are listed for the form: 13 choices, 0 first and 6 last", () => {
    expect(EXTRA_HOURS).toHaveLength(13);
    expect(EXTRA_HOURS.slice(0, 4)).toEqual([0, 0.5, 1, 1.5]);
    expect(EXTRA_HOURS.at(-1)).toBe(6);
    expect(EXTRA_HOURS.every(isExtraHours)).toBe(true);
  });

  it("are read from the form's value, with a point or a comma, empty as 0", () => {
    expect(parseExtraHours("")).toBe(0);
    expect(parseExtraHours("0")).toBe(0);
    expect(parseExtraHours("0.5")).toBe(0.5);
    expect(parseExtraHours("1,5")).toBe(1.5);
    expect(parseExtraHours("6")).toBe(6);
    expect(parseExtraHours("6.0")).toBe(6);
    for (const refused of ["6.5", "7", "-1", "1.25", "1.", "deux", "10", "1.50"]) {
      expect(parseExtraHours(refused)).toBeNaN();
    }
  });

  it("move the end of the night by half an hour", () => {
    expect(endTime("20:00", 0.5)).toBe("07:30");
    expect(endTime("20:30", 0.5)).toBe("08:00");
    expect(endTime("19:00:00", 1.5)).toBe("07:30");
    expect(endTime("23:00", 5.5)).toBe("15:30");
    expect(endTime("18:00", 6)).toBe("11:00");
  });

  it("end the night half an hour later", () => {
    // 19:00 + 11 h + 0.5 h is 06:30 in Brussels, 04:30Z in summer time.
    expect(hasNightEnded("2026-09-30", "19:00", 0.5, new Date("2026-10-01T04:29:00Z"))).toBe(false);
    expect(hasNightEnded("2026-09-30", "19:00", 0.5, new Date("2026-10-01T04:30:00Z"))).toBe(true);
  });
});

describe("the children (JAM-303)", () => {
  it("are 1 to 4", () => {
    expect(MAX_CHILDREN).toBe(4);
    for (const accepted of [1, 2, 3, 4]) expect(isChildCount(accepted)).toBe(true);
    for (const refused of [0, 5, 1.5, -1, Number.NaN]) expect(isChildCount(refused)).toBe(false);
  });

  it("are each 24 months at most: an older child is too old", () => {
    expect(MAX_AGE_MONTHS).toBe(24);
    expect(isTooOld(24, "mois")).toBe(false);
    expect(isTooOld(25, "mois")).toBe(true);
    expect(isTooOld(36, "mois")).toBe(true);
    expect(isTooOld(12, "semaines")).toBe(false);
    // 13 weeks is not too old: the family writes it in months.
    expect(isTooOld(13, "semaines")).toBe(false);
    expect(isTooOld(105, "semaines")).toBe(true);
    expect(isAgeInRange(24, "mois")).toBe(true);
    expect(isAgeInRange(25, "mois")).toBe(false);
  });
});

describe("the feedings (JAM-303)", () => {
  it("are the founders' three answers, then « diversification alimentaire »", () => {
    expect(FEEDINGS).toEqual([
      "allaitement_maternel",
      "lait_infantile",
      "allaitement_mixte",
      "diversification_alimentaire",
    ]);
  });

  it("are one answer or more, each of the list, none twice", () => {
    expect(areFeedings(["lait_infantile"])).toBe(true);
    expect(areFeedings(["lait_infantile", "diversification_alimentaire"])).toBe(true);
    expect(areFeedings([...FEEDINGS])).toBe(true);
    expect(areFeedings([])).toBe(false);
    expect(areFeedings(["biberon"])).toBe(false);
    expect(areFeedings(["lait_infantile", "biberon"])).toBe(false);
    expect(areFeedings(["lait_infantile", "lait_infantile"])).toBe(false);
  });

  it("are stored in the list's order", () => {
    expect(sortFeedings(["diversification_alimentaire", "lait_infantile"])).toEqual([
      "lait_infantile",
      "diversification_alimentaire",
    ]);
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

  // Spec (candidature-et-reservation): an « attribuée » request can no longer be
  // edited, cancelled or republished; a request with a pending answer cannot be
  // edited, and can once republishing has cleared it (D-76).
  it("keeps a booked request « attribuée », changeable by nobody", () => {
    const booked = { status: "attribuee" as const, nightDate: "2026-09-26", startTime: "20:00:00" };
    expect(displayStatus(booked, evening)).toBe("attribuee");
    expect(isChangeable(booked, evening)).toBe(false);
    expect(isEditable(booked, 0, evening)).toBe(false);
  });

  it("locks editing while an answer is pending, not cancelling", () => {
    const ahead = { status: "ouverte" as const, nightDate: "2026-09-26", startTime: "20:00:00" };
    expect(isEditable(ahead, 1, evening)).toBe(false);
    expect(isChangeable(ahead, evening)).toBe(true);
    expect(isEditable(ahead, 0, evening)).toBe(true);
    const started = { ...ahead, nightDate: "2026-09-25" };
    expect(isEditable(started, 0, evening)).toBe(false);
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
