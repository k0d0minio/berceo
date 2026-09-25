import { describe, expect, it } from "vitest";

import {
  NIGHTS_IN_WINDOW,
  SHOWN_TO_FAMILIES,
  availabilityWindow,
  calendarWeeks,
  isInWindow,
  validateNights,
} from "./rules";

/**
 * Spec (disponibilites-indicatives, D-79, D-80, D-81): the window runs from
 * tonight to today + 56 days in Brussels time, around midnight and across a
 * daylight-saving change; the calendar is Monday-first week rows with month
 * headings and padding; a save carries 1 to 57 dates inside the window or is
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

describe("the calendar's weeks", () => {
  const weeks = calendarWeeks(availabilityWindow(SUMMER_NOON));

  it("is whole Monday-to-Sunday rows covering the window", () => {
    expect(weeks).toHaveLength(9);
    for (const week of weeks) expect(week.days).toHaveLength(7);
    expect(weeks[0].days[0].date).toBe("2026-09-21");
    expect(weeks.at(-1)?.days[6].date).toBe("2026-11-22");
  });

  it("pads the first and last rows with days outside the window", () => {
    expect(weeks[0].days.map((day) => day.inWindow)).toEqual([
      false,
      false,
      false,
      false,
      true,
      true,
      true,
    ]);
    expect(weeks.at(-1)?.days.map((day) => day.inWindow)).toEqual([
      true,
      true,
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it("holds exactly the 57 nights of the window as in-window days", () => {
    const inWindow = weeks.flatMap((week) => week.days).filter((day) => day.inWindow);
    expect(inWindow).toHaveLength(57);
    expect(inWindow[0].date).toBe("2026-09-25");
    expect(inWindow.at(-1)?.date).toBe("2026-11-20");
  });

  it("heads the first row with tonight's month and a row with the month starting in it", () => {
    expect(weeks.map((week) => week.month)).toEqual([
      "2026-09",
      "2026-10", // Thursday 1 October
      null,
      null,
      null,
      "2026-11", // Sunday 1 November
      null,
      null,
      null,
    ]);
  });

  it("starts on the Monday itself when tonight is a Monday", () => {
    const monday = calendarWeeks(availabilityWindow(new Date("2026-10-12T10:00:00Z")));
    expect(monday[0].days[0]).toEqual({ date: "2026-10-12", inWindow: true });
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
    const all = calendarWeeks(range)
      .flatMap((week) => week.days)
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
