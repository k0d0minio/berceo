import { describe, expect, it } from "vitest";

import {
  cardTitle,
  childrenLine,
  endLine,
  extraHoursLabel,
  feedingLine,
  formatDate,
  formatTime,
  hoursLine,
  nightLine,
  placeLine,
} from "./format";

/**
 * Spec (demande-de-garde): the request card reads like the DA's example
 * (« Garde de nuit à Bruxelles », « 30/09/2026 de 20h00 à 7h00 », « Un bébé de
 * trois mois »), the end of the night 11 hours plus its extra hours after its start.
 * Spec (demande-enfants-alimentation): « Triplés » reads like the two others,
 * and the card names the feeding in the founders' words.
 */

describe("the night", () => {
  it("reads as the DA's example", () => {
    expect(formatDate("2026-09-30")).toBe("30/09/2026");
    expect(formatTime("07:00:00")).toBe("7h00");
    expect(formatTime("20:30")).toBe("20h30");
    expect(nightLine("2026-09-30", "20:00:00", 0)).toBe("30/09/2026 de 20h00 à 7h00");
    expect(nightLine("2026-09-30", "23:00", 0)).toBe("30/09/2026 de 23h00 à 10h00");
  });

  it("ends later by the extra hours: « de 19h00 à 8h00 » with two from 19:00", () => {
    expect(nightLine("2026-09-30", "19:00:00", 2)).toBe("30/09/2026 de 19h00 à 8h00");
  });

  it("ends on the half hour with a half extra hour (JAM-303)", () => {
    expect(nightLine("2026-09-30", "19:00:00", 2.5)).toBe("30/09/2026 de 19h00 à 8h30");
    expect(nightLine("2026-09-30", "20:30:00", 0.5)).toBe("30/09/2026 de 20h30 à 8h00");
  });
});

describe("the children line (JAM-303)", () => {
  const child = (value: number, unit: "semaines" | "mois") => ({ value, unit });

  it("writes one child's age in words, like the DA's example", () => {
    expect(childrenLine([child(3, "mois")])).toBe("Un bébé de trois mois");
    expect(childrenLine([child(11, "mois")])).toBe("Un bébé de onze mois");
    expect(childrenLine([child(21, "mois")])).toBe("Un bébé de vingt et un mois");
  });

  it("elides before « un » and « une », and says « moins d'une semaine » at 0", () => {
    expect(childrenLine([child(1, "mois")])).toBe("Un bébé d'un mois");
    expect(childrenLine([child(1, "semaines")])).toBe("Un bébé d'une semaine");
    expect(childrenLine([child(0, "semaines")])).toBe("Un bébé de moins d'une semaine");
  });

  it("says children of one age once: the twins and triplets of before", () => {
    expect(childrenLine([child(6, "semaines"), child(6, "semaines")])).toBe("Deux enfants de six semaines");
    expect(childrenLine([child(1, "mois"), child(1, "mois"), child(1, "mois")])).toBe("Trois enfants d'un mois");
  });

  it("gives each child's own age when they differ, in the family's order", () => {
    expect(childrenLine([child(1, "semaines"), child(18, "mois")])).toBe(
      "Deux enfants : une semaine et dix-huit mois",
    );
    expect(childrenLine([child(2, "semaines"), child(12, "mois"), child(24, "mois"), child(2, "semaines")])).toBe(
      "Quatre enfants : deux semaines, douze mois, vingt-quatre mois et deux semaines",
    );
  });
});

describe("the feeding line (JAM-303)", () => {
  it("names each feeding", () => {
    expect(feedingLine(["allaitement_maternel"])).toBe("Allaitement maternel");
    expect(feedingLine(["lait_infantile"])).toBe("Lait infantile");
    expect(feedingLine(["allaitement_mixte"])).toBe("Allaitement mixte");
    expect(feedingLine(["diversification_alimentaire"])).toBe("Diversification alimentaire");
  });

  it("joins several feedings in one line", () => {
    expect(feedingLine(["lait_infantile", "diversification_alimentaire"])).toBe(
      "Lait infantile et diversification alimentaire",
    );
    expect(feedingLine(["allaitement_maternel", "lait_infantile", "diversification_alimentaire"])).toBe(
      "Allaitement maternel, lait infantile et diversification alimentaire",
    );
  });

  it("is empty for a request published before the field", () => {
    expect(feedingLine([])).toBe("");
  });
});

describe("the hours of regular nights (JAM-303)", () => {
  it("are said once when every night has the same", () => {
    expect(
      hoursLine([
        { startTime: "20:00:00", extraHours: 0 },
        { startTime: "20:00", extraHours: 0 },
      ]),
    ).toBe("de 20h00 à 7h00");
  });

  it("are one clear line when the nights differ", () => {
    expect(
      hoursLine([
        { startTime: "20:00:00", extraHours: 0 },
        { startTime: "20:00:00", extraHours: 1.5 },
      ]),
    ).toBe("à des horaires différents selon la nuit");
    expect(
      hoursLine([
        { startTime: "20:00:00", extraHours: 0 },
        { startTime: "21:30:00", extraHours: 0 },
      ]),
    ).toBe("à des horaires différents selon la nuit");
  });
});

describe("the form's end of the night and its list of extra hours (JAM-303)", () => {
  it("computes the end from the start and the half hours", () => {
    expect(endLine("20:00", 0)).toBe("7h00");
    expect(endLine("20:00", 0.5)).toBe("7h30");
    expect(endLine("21:30", 2.5)).toBe("11h00");
    expect(endLine("", 1)).toBe("");
  });

  it("names each choice of extra hours", () => {
    expect([0, 0.5, 1, 1.5, 2, 2.5, 6].map(extraHoursLabel)).toEqual([
      "Aucune",
      "30 minutes",
      "1 heure",
      "1 heure 30",
      "2 heures",
      "2 heures 30",
      "6 heures",
    ]);
  });
});

describe("the place", () => {
  it("titles the card with the commune, and lists the locality", () => {
    expect(cardTitle("21009", "Ixelles")).toBe("Garde de nuit à Ixelles");
    expect(cardTitle("00000", "Ailleurs")).toBe("Garde de nuit à Ailleurs");
    expect(placeLine("1050", "Ixelles")).toBe("1050 Ixelles");
  });
});
