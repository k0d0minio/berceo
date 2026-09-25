import { describe, expect, it } from "vitest";

import { dayNumber, monthHeading, nightName } from "./format";

/**
 * Spec (disponibilites-indicatives): a night reads « Nuit du … au … », from its
 * evening to the next morning, across a month end and a year end; the calendar
 * heads its months « Octobre 2026 ».
 */
describe("a night's name", () => {
  it("names the month once when both days share it", () => {
    expect(nightName("2026-10-12")).toBe("Nuit du lundi 12 au mardi 13 octobre");
  });

  it("names both months across a month end, with « 1er »", () => {
    expect(nightName("2026-09-30")).toBe("Nuit du mercredi 30 septembre au jeudi 1er octobre");
  });

  it("crosses the year end", () => {
    expect(nightName("2026-12-31")).toBe("Nuit du jeudi 31 décembre au vendredi 1er janvier");
  });

  it("starts on the first of a month", () => {
    expect(nightName("2026-10-01")).toBe("Nuit du jeudi 1er au vendredi 2 octobre");
  });
});

describe("the calendar's words", () => {
  it("heads a month with its name and year", () => {
    expect(monthHeading("2026-10")).toBe("Octobre 2026");
    expect(monthHeading("2027-01")).toBe("Janvier 2027");
  });

  it("shows the day number without a leading zero", () => {
    expect(dayNumber("2026-10-05")).toBe("5");
    expect(dayNumber("2026-10-25")).toBe("25");
  });
});
