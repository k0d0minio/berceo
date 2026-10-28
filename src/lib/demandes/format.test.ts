import { describe, expect, it } from "vitest";

import { cardTitle, childrenLine, feedingLine, formatDate, formatTime, nightLine, placeLine } from "./format";

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
});

describe("the children line", () => {
  it("writes the age in words, like the DA's example", () => {
    expect(childrenLine("un_bebe", 3, "mois")).toBe("Un bébé de trois mois");
    expect(childrenLine("jumeaux", 6, "semaines")).toBe("Jumeaux de six semaines");
    expect(childrenLine("un_bebe", 11, "mois")).toBe("Un bébé de onze mois");
    expect(childrenLine("un_bebe", 21, "mois")).toBe("Un bébé de vingt et un mois");
    expect(childrenLine("jumeaux", 24, "mois")).toBe("Jumeaux de vingt-quatre mois");
    expect(childrenLine("triples", 3, "mois")).toBe("Triplés de trois mois");
    expect(childrenLine("triples", 8, "semaines")).toBe("Triplés de huit semaines");
  });

  it("elides before « un » and « une », and says « moins d'une semaine » at 0", () => {
    expect(childrenLine("un_bebe", 1, "mois")).toBe("Un bébé d'un mois");
    expect(childrenLine("jumeaux", 1, "semaines")).toBe("Jumeaux d'une semaine");
    expect(childrenLine("un_bebe", 0, "semaines")).toBe("Un bébé de moins d'une semaine");
    expect(childrenLine("triples", 1, "mois")).toBe("Triplés d'un mois");
  });
});

describe("the feeding line", () => {
  it("names each of the three feedings", () => {
    expect(feedingLine("allaitement_maternel")).toBe("Allaitement maternel");
    expect(feedingLine("lait_infantile")).toBe("Lait infantile");
    expect(feedingLine("allaitement_mixte")).toBe("Allaitement mixte");
  });
});

describe("the place", () => {
  it("titles the card with the commune, and lists the locality", () => {
    expect(cardTitle("21009", "Ixelles")).toBe("Garde de nuit à Ixelles");
    expect(cardTitle("00000", "Ailleurs")).toBe("Garde de nuit à Ailleurs");
    expect(placeLine("1050", "Ixelles")).toBe("1050 Ixelles");
  });
});
