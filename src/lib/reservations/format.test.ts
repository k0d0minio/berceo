import { describe, expect, it } from "vitest";

import { answersCount, professionInSentence, professionLabel, rateLine, recapNight } from "./format";

/**
 * Spec (candidature-et-reservation): the card's price line is her rate with
 * the euro after the number; the récapitulatif shows the date, the hours
 * (start to start + 11 h) and « 11 heures »; « Mes demandes » counts the
 * answers (« 2 réponses »).
 */
describe("the answer and the booking, as they read", () => {
  it("writes the price line of the DA's card", () => {
    expect(rateLine(150)).toBe("150 € pour la garde de nuit");
  });

  it("writes the récapitulatif's date, hours and duration", () => {
    expect(recapNight("2026-09-30", "20:00:00")).toEqual({
      date: "30/09/2026",
      heures: "de 20h00 à 7h00",
      duree: "11 heures",
    });
    expect(recapNight("2026-10-02", "23:00:00").heures).toBe("de 23h00 à 10h00");
  });

  it("writes a profession as a label and inside a sentence", () => {
    expect(professionLabel("sage_femme")).toBe("Sage-femme");
    expect(professionInSentence("sage_femme")).toBe("sage-femme");
    expect(professionInSentence("infirmiere_neonatologie")).toBe("infirmière en néonatologie");
    expect(professionInSentence(null)).toBe("");
  });

  it("counts the answers", () => {
    expect(answersCount(1)).toBe("1 réponse");
    expect(answersCount(2)).toBe("2 réponses");
  });
});
