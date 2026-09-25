import { describe, expect, it } from "vitest";

import { cardTitle, childrenLine, formatDate, formatTime, nightLine, placeLine } from "./format";

/**
 * Spec (demande-de-garde): the request card reads like the DA's example
 * (« Garde de nuit à Bruxelles », « 30/09/2026 de 20h00 à 7h00 », « Un bébé de
 * trois mois »), the end of the night 11 hours after its start.
 */

describe("the night", () => {
  it("reads as the DA's example", () => {
    expect(formatDate("2026-09-30")).toBe("30/09/2026");
    expect(formatTime("07:00:00")).toBe("7h00");
    expect(formatTime("20:30")).toBe("20h30");
    expect(nightLine("2026-09-30", "20:00:00")).toBe("30/09/2026 de 20h00 à 7h00");
    expect(nightLine("2026-09-30", "23:00")).toBe("30/09/2026 de 23h00 à 10h00");
  });
});

describe("the children line", () => {
  it("writes the age in words, like the DA's example", () => {
    expect(childrenLine("un_bebe", 3, "mois")).toBe("Un bébé de trois mois");
    expect(childrenLine("jumeaux", 6, "semaines")).toBe("Jumeaux de six semaines");
    expect(childrenLine("un_bebe", 11, "mois")).toBe("Un bébé de onze mois");
    expect(childrenLine("un_bebe", 21, "mois")).toBe("Un bébé de vingt et un mois");
    expect(childrenLine("jumeaux", 24, "mois")).toBe("Jumeaux de vingt-quatre mois");
  });

  it("elides before « un » and « une », and says « moins d'une semaine » at 0", () => {
    expect(childrenLine("un_bebe", 1, "mois")).toBe("Un bébé d'un mois");
    expect(childrenLine("jumeaux", 1, "semaines")).toBe("Jumeaux d'une semaine");
    expect(childrenLine("un_bebe", 0, "semaines")).toBe("Un bébé de moins d'une semaine");
  });
});

describe("the place", () => {
  it("titles the card with the commune, and lists the locality", () => {
    expect(cardTitle("21009", "Ixelles")).toBe("Garde de nuit à Ixelles");
    expect(cardTitle("00000", "Ailleurs")).toBe("Garde de nuit à Ailleurs");
    expect(placeLine("1050", "Ixelles")).toBe("1050 Ixelles");
  });
});
