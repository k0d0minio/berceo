import { describe, expect, it } from "vitest";

import {
  answersCount,
  extraHourLine,
  professionInSentence,
  professionLabel,
  rateLine,
  recapNight,
} from "./format";

/**
 * Spec (candidature-et-reservation): the card's price line is her rate with
 * the euro after the number; the récapitulatif shows the date, the hours
 * (start to start + 11 h + the extra hours) and « 11 heures », with the extra
 * hours named apart; « Mes demandes » counts the
 * answers (« 2 réponses »).
 */
describe("the answer and the booking, as they read", () => {
  it("writes the price line of the DA's card", () => {
    expect(rateLine(150)).toBe("150 € pour la garde de nuit");
    expect(extraHourLine(15)).toBe("15 € par heure supplémentaire");
  });

  it("writes the récapitulatif's date, hours and duration", () => {
    expect(recapNight("2026-09-30", "20:00:00", 0)).toEqual({
      date: "30/09/2026",
      heures: "de 20h00 à 7h00",
      duree: "11 heures",
    });
    expect(recapNight("2026-10-02", "23:00:00", 0).heures).toBe("de 23h00 à 10h00");
  });

  it("names the extra hours in the duration and ends the night after them", () => {
    expect(recapNight("2026-09-30", "19:00:00", 2)).toEqual({
      date: "30/09/2026",
      heures: "de 19h00 à 8h00",
      duree: "11 heures et 2 heures supplémentaires",
    });
    expect(recapNight("2026-09-30", "19:00:00", 1).duree).toBe("11 heures et 1 heure supplémentaire");
  });

  it("names the half hours in the duration (JAM-303)", () => {
    expect(recapNight("2026-09-30", "19:00:00", 0.5)).toEqual({
      date: "30/09/2026",
      heures: "de 19h00 à 6h30",
      duree: "11 heures et 30 minutes supplémentaires",
    });
    expect(recapNight("2026-09-30", "19:00:00", 1.5).duree).toBe("11 heures et 1 h 30 supplémentaires");
    expect(recapNight("2026-09-30", "19:00:00", 5.5).duree).toBe("11 heures et 5 h 30 supplémentaires");
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
