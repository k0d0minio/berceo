import { describe, expect, it } from "vitest";

import {
  adaptedLines,
  agreedStartLine,
  answersCount,
  extraHourLine,
  ownProposalLine,
  proposalOptions,
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

/**
 * Spec (JAM-306): the family reads, for each night with a proposal, the start
 * it asked for, the start proposed and the new end. The professional reads her
 * own proposal, and chooses it from the half hours of the request's range. A
 * night booked at a proposed start says which start was asked for.
 */
describe("the adapted schedule, as it reads (JAM-306)", () => {
  const night = { requestId: "n1", nightDate: "2026-10-02", requested: "19:00", proposed: "20:00", end: "07:00" };

  it("tells the family the start asked for, the start proposed and the new end", () => {
    expect(adaptedLines([night], false)).toEqual(["Début à 20h00 au lieu de 19h00. Fin de la garde à 7h00."]);
    expect(adaptedLines([night, { ...night, requestId: "n2", nightDate: "2026-10-03", proposed: "18:30", end: "05:30" }], true)).toEqual([
      "Nuit du 02/10/2026 : début à 20h00 au lieu de 19h00, fin à 7h00.",
      "Nuit du 03/10/2026 : début à 18h30 au lieu de 19h00, fin à 5h30.",
    ]);
    expect(adaptedLines([], true)).toEqual([]);
  });

  it("tells the professional what she proposed", () => {
    expect(ownProposalLine(night, false)).toBe(
      "Vous avez proposé de commencer à 20h00 au lieu de 19h00. La garde se terminerait à 7h00.",
    );
    expect(ownProposalLine(night, true)).toBe("Vous avez proposé de commencer à 20h00 au lieu de 19h00, fin à 7h00.");
  });

  it("offers every half hour from 18:00 to 23:00 but the family's own, with the end each gives", () => {
    const options = proposalOptions("19:00:00", 1.5);
    expect(options).toHaveLength(10);
    expect(options.map((option) => option.value)).not.toContain("19:00");
    expect(options[0]).toEqual({ value: "18:00", label: "18h00, fin de la garde à 6h30" });
    expect(options.at(-1)).toEqual({ value: "23:00", label: "23h00, fin de la garde à 11h30" });
  });

  it("says which start the family asked for on a night booked at a proposed start, and nothing otherwise", () => {
    expect(agreedStartLine({ startTime: "20:00:00", requestedStartTime: "19:00:00" })).toBe(
      "Horaire adapté : début demandé à 19h00, début convenu à 20h00.",
    );
    expect(agreedStartLine({ startTime: "19:00:00", requestedStartTime: null })).toBeNull();
    expect(agreedStartLine({ startTime: "19:00:00" })).toBeNull();
  });
});
