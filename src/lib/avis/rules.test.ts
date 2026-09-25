import { describe, expect, it } from "vitest";

import type { GardeFacts } from "@/lib/gardes/rules";

import {
  canRate,
  CRITERIA,
  formatNote,
  hasWindowClosed,
  isPublished,
  noteOf,
  parseScores,
  ratedSide,
  rateRefusal,
  ratingMean,
  windowCloses,
} from "./rules";

/**
 * Spec (avis-etoiles, D-18, D-115 to D-122): a side rates a garde once, only
 * when it is terminée, never when it is annulée, and only in the 14 days after
 * the night's end; a rating counts once both sides have rated or once those 14
 * days are over; the note is the mean of every criterion score to one decimal
 * with a comma; a form carries four whole scores from 1 to 5 and nothing else
 * that is read. Written from the acceptance criteria.
 */

// The night of 30 September 2026 from 20:00 ends on 1 October at 07:00 in Brussels (CEST, UTC+2).
const garde: GardeFacts = { status: "confirmee", nightDate: "2026-09-30", startTime: "20:00:00" };
const cancelled: GardeFacts = { ...garde, status: "annulee" };
const DURING = new Date("2026-10-01T04:59:00Z"); // 06:59, still en cours
const AT_END = new Date("2026-10-01T05:00:00Z"); // 07:00, terminée
// The window closes 14 days after the end: 15 October at 07:00, still CEST (UTC+2).
const LAST_MINUTE = new Date("2026-10-15T04:59:00Z");
const AT_CLOSE = new Date("2026-10-15T05:00:00Z");

describe("the criteria", () => {
  it("are four per side, in the order of the four scores", () => {
    expect(CRITERIA.famille).toEqual(["ponctualite", "communication", "soin", "confiance"]);
    expect(CRITERIA.professionnelle).toEqual(["accueil", "communication", "clarteConsignes", "respectCadre"]);
  });

  it("the family rates the professional and the other way round", () => {
    expect(ratedSide("famille")).toBe("professionnelle");
    expect(ratedSide("professionnelle")).toBe("famille");
  });
});

describe("the window", () => {
  it("closes 14 days after the night's end", () => {
    expect(windowCloses("2026-09-30", "20:00:00")).toBe("2026-10-15T07:00");
    expect(hasWindowClosed("2026-09-30", "20:00", LAST_MINUTE)).toBe(false);
    expect(hasWindowClosed("2026-09-30", "20:00", AT_CLOSE)).toBe(true);
  });

  it("keeps Brussels wall-clock time across the change to winter time", () => {
    // 20 October 2026 from 21:00 ends on 21 October at 08:00 (CEST); the window closes on
    // 4 November at 08:00, after the clocks go back on 25 October: 07:00 UTC (CET, UTC+1).
    expect(windowCloses("2026-10-20", "21:00")).toBe("2026-11-04T08:00");
    expect(hasWindowClosed("2026-10-20", "21:00", new Date("2026-11-04T06:59:00Z"))).toBe(false);
    expect(hasWindowClosed("2026-10-20", "21:00", new Date("2026-11-04T07:00:00Z"))).toBe(true);
  });
});

describe("rateRefusal", () => {
  it("allows a terminée garde not yet rated by this side, from its end to the last minute", () => {
    expect(rateRefusal(garde, false, AT_END)).toBeNull();
    expect(rateRefusal(garde, false, LAST_MINUTE)).toBeNull();
    expect(canRate(garde, false, AT_END)).toBe(true);
  });

  it("refuses a garde not yet terminée", () => {
    expect(rateRefusal(garde, false, new Date("2026-09-30T12:00:00Z"))).toBe("pasTerminee");
    expect(rateRefusal(garde, false, DURING)).toBe("pasTerminee");
  });

  it("refuses an annulée garde at any hour, an absence reported after its end included", () => {
    expect(rateRefusal(cancelled, false, AT_END)).toBe("annulee");
    expect(rateRefusal(cancelled, false, LAST_MINUTE)).toBe("annulee");
  });

  it("refuses a second rating from the same side", () => {
    expect(rateRefusal(garde, true, AT_END)).toBe("dejaNote");
    expect(canRate(garde, true, AT_END)).toBe(false);
  });

  it("refuses once the window has closed", () => {
    expect(rateRefusal(garde, false, AT_CLOSE)).toBe("delaiPasse");
    expect(rateRefusal(garde, false, new Date("2027-01-01T12:00:00Z"))).toBe("delaiPasse");
  });
});

describe("isPublished (double-blind)", () => {
  it("counts a rating as soon as the other side has rated", () => {
    expect(isPublished(true, garde, AT_END)).toBe(true);
  });

  it("counts it once the window has closed, with no action by anyone", () => {
    expect(isPublished(false, garde, LAST_MINUTE)).toBe(false);
    expect(isPublished(false, garde, AT_CLOSE)).toBe(true);
  });

  it("counts nothing while only one side has rated inside the window", () => {
    expect(isPublished(false, garde, AT_END)).toBe(false);
  });
});

describe("the note", () => {
  it("is null with no published score, never zero", () => {
    expect(noteOf(0, 0)).toBeNull();
  });

  it("is the mean of every criterion score to one decimal", () => {
    expect(noteOf(4 + 5 + 5 + 4, 4)).toBe(4.5);
    // One rating of 5, 5, 5, 4 and one of 4, 4, 5, 5: 37 / 8 = 4.625 → 4,6.
    expect(noteOf(37, 8)).toBe(4.6);
    // 4.95 rounds up: 99 / 20.
    expect(noteOf(99, 20)).toBe(5);
    // 4.94 rounds down: 247 / 50.
    expect(noteOf(247, 50)).toBe(4.9);
  });

  it("reads with a comma and one decimal", () => {
    expect(formatNote(4.6)).toBe("4,6");
    expect(formatNote(5)).toBe("5,0");
    expect(formatNote(noteOf(99, 20) ?? 0)).toBe("5,0");
  });

  it("a rating's mean is its four scores averaged", () => {
    expect(ratingMean([5, 4, 4, 3])).toBe(4);
  });
});

describe("parseScores", () => {
  function form(values: Record<string, string>): FormData {
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) data.set(key, value);
    return data;
  }
  const valid = { score_1: "5", score_2: "4", score_3: "3", score_4: "1" };

  it("reads four whole scores from 1 to 5", () => {
    expect(parseScores(form(valid))).toEqual([5, 4, 3, 1]);
  });

  it("refuses a missing score", () => {
    expect(parseScores(form({ score_1: "5", score_2: "4", score_3: "3" }))).toBeNull();
  });

  it("refuses a score outside 1 to 5, or not a whole number", () => {
    for (const bad of ["0", "6", "4.5", "-1", "", "cinq", "10"]) {
      expect(parseScores(form({ ...valid, score_2: bad }))).toBeNull();
    }
  });

  it("ignores every other field: a forged side, rater or rated person reads nothing", () => {
    expect(
      parseScores(form({ ...valid, side: "famille", rated_user_id: "x", commentaire: "texte" })),
    ).toEqual([5, 4, 3, 1]);
  });
});
