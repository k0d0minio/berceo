import { describe, expect, it } from "vitest";

import {
  NIGHTS_IN_WINDOW,
  SHOWN_TO_FAMILIES,
  availabilityWindow,
  calendarMonths,
  isInWindow,
  validateNights,
  weekdayIndex,
  type CalendarMonth,
} from "./rules";

/**
 * Spec (disponibilites-indicatives, D-79, D-80, D-81): the window runs from
 * tonight to today + 56 days in Brussels time, around midnight and across a
 * daylight-saving change; the calendar is one block per month, Monday-first
 * rows padded with inert days; a save carries 1 to 57 dates inside the window or is
 * refused whole; families see five nights. Written from the acceptance
 * criteria, not from the implementation.
 */

// 25 September 2026, 12:00 in Brussels (CEST, UTC+2), a Friday.
const SUMMER_NOON = new Date("2026-09-25T10:00:00Z");

describe("the window", () => {
  it("runs from tonight to today + 56 days: 57 nights", () => {
    expect(availabilityWindow(SUMMER_NOON)).toEqual({ first: "2026-09-25", last: "2026-11-20" });
    expect(NIGHTS_IN_WINDOW).toBe(57);
  });

  it("keeps tonight until midnight in Brussels, not in UTC (summer time)", () => {
    // 23:59:59 on the 12th in Brussels is 21:59:59 UTC.
    expect(availabilityWindow(new Date("2026-10-12T21:59:59Z")).first).toBe("2026-10-12");
    // Midnight in Brussels: the 12th is past, though it is still the 12th in UTC.
    expect(availabilityWindow(new Date("2026-10-12T22:00:00Z")).first).toBe("2026-10-13");
  });

  it("follows Brussels across the change to winter time (25 October 2026)", () => {
    // 00:30 on the 25th, still summer time (UTC+2).
    expect(availabilityWindow(new Date("2026-10-24T22:30:00Z"))).toEqual({
      first: "2026-10-25",
      last: "2026-12-20",
    });
    // 23:59 on the 25th, now winter time (UTC+1).
    expect(availabilityWindow(new Date("2026-10-25T22:59:00Z")).first).toBe("2026-10-25");
    expect(availabilityWindow(new Date("2026-10-25T23:00:00Z")).first).toBe("2026-10-26");
  });

  it("accepts tonight and the 56th day, refuses the day before and the 57th", () => {
    const range = availabilityWindow(SUMMER_NOON);
    expect(isInWindow("2026-09-25", range)).toBe(true);
    expect(isInWindow("2026-11-20", range)).toBe(true);
    expect(isInWindow("2026-09-24", range)).toBe(false);
    expect(isInWindow("2026-11-21", range)).toBe(false);
  });

  it("refuses a malformed or impossible date", () => {
    const range = availabilityWindow(SUMMER_NOON);
    expect(isInWindow("2026-10-1", range)).toBe(false);
    expect(isInWindow("2026-09-31", range)).toBe(false);
    expect(isInWindow("demain", range)).toBe(false);
  });
});

describe("the calendar's months", () => {
  const months = calendarMonths(availabilityWindow(SUMMER_NOON));
  const nights = (month: CalendarMonth) =>
    month.weeks.flat().filter((day) => day.inWindow).map((day) => day.date);

  it("heads each month of the window once, in order", () => {
    expect(months.map((month) => month.month)).toEqual(["2026-09", "2026-10", "2026-11"]);
  });

  it("lays each month out as whole Monday-to-Sunday rows", () => {
    expect(months.map((month) => month.weeks.length)).toEqual([2, 5, 4]);
    for (const month of months) {
      for (const week of month.weeks) {
        expect(week).toHaveLength(7);
        expect(weekdayIndex(week[0].date)).toBe(0);
      }
    }
  });

  it("pads before tonight, after the window and around each month with inert days", () => {
    expect(months[0].weeks[0].map((day) => day.inWindow)).toEqual([
      false, // Monday 21, before tonight
      false,
      false,
      false,
      true, // Friday 25, tonight
      true,
      true,
    ]);
    // October's first row starts on Monday 28 September: those three days are padding.
    expect(months[1].weeks[0].slice(0, 3).map((day) => day.inWindow)).toEqual([false, false, false]);
    expect(months[1].weeks[0][3]).toEqual({ date: "2026-10-01", inWindow: true });
    // After Friday 20 November, the last night.
    expect(months[2].weeks.at(-1)?.map((day) => day.inWindow)).toEqual([
      true,
      true,
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it("puts every night of the window under its own month, exactly once", () => {
    expect(nights(months[0])).toEqual([
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
    ]);
    expect(nights(months[1])).toHaveLength(31);
    expect(nights(months[2])).toHaveLength(20);
    const all = months.flatMap(nights);
    expect(all).toHaveLength(57);
    expect(new Set(all).size).toBe(57);
    expect(all[0]).toBe("2026-09-25");
    expect(all.at(-1)).toBe("2026-11-20");
  });

  it("gives the next month its own heading when it starts in tonight's week", () => {
    // Monday 28 September: 1 October falls in the first week.
    const monday = calendarMonths(availabilityWindow(new Date("2026-09-28T10:00:00Z")));
    expect(monday.map((month) => month.month)).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(nights(monday[0])).toEqual(["2026-09-28", "2026-09-29", "2026-09-30"]);
    expect(nights(monday[1])[0]).toBe("2026-10-01");
  });

  it("crosses the year end", () => {
    const december = calendarMonths(availabilityWindow(new Date("2026-12-20T10:00:00Z")));
    expect(december.map((month) => month.month)).toEqual(["2026-12", "2027-01", "2027-02"]);
  });
});

describe("what a save may carry", () => {
  const range = availabilityWindow(SUMMER_NOON);

  it("accepts dates inside the window, sorted and without duplicates", () => {
    expect(validateNights(["2026-10-02", "2026-09-25", "2026-10-02"], range)).toEqual({
      ok: true,
      dates: ["2026-09-25", "2026-10-02"],
    });
  });

  it("accepts the whole window in one save", () => {
    const all = calendarMonths(range)
      .flatMap((month) => month.weeks.flat())
      .filter((day) => day.inWindow)
      .map((day) => day.date);
    expect(validateNights(all, range)).toMatchObject({ ok: true });
  });

  it("refuses the whole set when one date is before today, after the window or malformed", () => {
    expect(validateNights(["2026-10-01", "2026-09-24"], range)).toEqual({ ok: false, reason: "horsFenetre" });
    expect(validateNights(["2026-10-01", "2026-11-21"], range)).toEqual({ ok: false, reason: "horsFenetre" });
    expect(validateNights(["2026-10-01", "01/10/2026"], range)).toEqual({ ok: false, reason: "horsFenetre" });
  });

  it("refuses more than 57 dates", () => {
    const tooMany = Array.from({ length: 58 }, () => "2026-10-01");
    expect(validateNights(tooMany, range)).toEqual({ ok: false, reason: "horsFenetre" });
  });

  it("refuses an empty save", () => {
    expect(validateNights([], range)).toEqual({ ok: false, reason: "vide" });
  });
});

describe("what families see", () => {
  it("is five nights at most", () => {
    expect(SHOWN_TO_FAMILIES).toBe(5);
  });
});
