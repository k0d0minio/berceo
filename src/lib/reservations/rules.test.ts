import { describe, expect, it } from "vitest";

import {
  acceptRefusal,
  answerRefusal,
  canRepublish,
  canWithdraw,
  hasAddress,
  seriesAnswerState,
  seriesShownRates,
  shownRates,
  type AnswerFacts,
  type Rates,
  type RequestFacts,
} from "./rules";

/**
 * Spec (candidature-et-reservation, D-70, D-71, D-73, D-77): who may answer
 * and each refusal, the same-night rule, withdrawal, accepting, republishing,
 * and the address a family needs before accepting. Written from the acceptance
 * criteria. The rules only the SQL decides (her list, the priority candidates,
 * the declines on cancel, republish and accept) are held by the statement
 * tests beside those writes (reservations-regles-non-appelees).
 */

// 25 September 2026, 12:00 in Brussels (CEST).
const NOON = new Date("2026-09-25T10:00:00Z");

const request: RequestFacts = {
  status: "ouverte",
  nightDate: "2026-09-30",
  startTime: "20:00:00",
  priorityProfileId: null,
};

const facts: AnswerFacts = {
  profile: { id: "p-julie", status: "valide", nightRateEur: 150 },
  request,
  servesCommune: true,
  answer: null,
  bookedThatNight: false,
};

describe("who may answer a request", () => {
  it("lets a validated professional serving the commune answer an open request ahead", () => {
    expect(answerRefusal(facts, NOON)).toBeNull();
  });

  it.each<[string, Partial<AnswerFacts>, string]>([
    ["a profile not validated", { profile: { id: "p-julie", status: "en_attente", nightRateEur: 150 } }, "nonValide"],
    ["a cancelled request", { request: { ...request, status: "annulee" } }, "fermee"],
    ["a booked request", { request: { ...request, status: "attribuee" } }, "fermee"],
    ["a night that has started", { request: { ...request, nightDate: "2026-09-25", startTime: "11:00:00" } }, "commencee"],
    ["a commune she does not serve", { servesCommune: false }, "horsZone"],
    ["a request she was declined on", { answer: "non_retenue" }, "declinee"],
    ["a night she is already booked for", { bookedThatNight: true }, "dejaReservee"],
    ["a second answer while the first waits", { answer: "en_attente" }, "dejaRepondu"],
  ])("refuses %s", (_case, change, reason) => {
    expect(answerRefusal({ ...facts, ...change }, NOON)).toBe(reason);
  });

  it("lets her answer a request sent to her in priority outside her communes (D-71)", () => {
    const priority = { ...request, priorityProfileId: "p-julie" };
    expect(answerRefusal({ ...facts, request: priority, servesCommune: false }, NOON)).toBeNull();
    // Priority to someone else does not open it to her.
    const other = { ...request, priorityProfileId: "p-emma" };
    expect(answerRefusal({ ...facts, request: other, servesCommune: false }, NOON)).toBe("horsZone");
  });

  it("lets her answer again after she withdrew (D-73)", () => {
    expect(answerRefusal({ ...facts, answer: "retiree" }, NOON)).toBeNull();
  });
});

describe("withdrawing an answer", () => {
  it("is possible while the answer waits and the request is open and ahead", () => {
    expect(canWithdraw("en_attente", request, NOON)).toBe(true);
    expect(canWithdraw("retenue", request, NOON)).toBe(false);
    expect(canWithdraw("non_retenue", request, NOON)).toBe(false);
    expect(canWithdraw(null, request, NOON)).toBe(false);
    expect(canWithdraw("en_attente", { ...request, status: "attribuee" }, NOON)).toBe(false);
    expect(canWithdraw("en_attente", { ...request, nightDate: "2026-09-24" }, NOON)).toBe(false);
  });
});

describe("accepting an answer", () => {
  const accept = {
    request,
    answer: { status: "en_attente" as const, profileStatus: "valide" },
    hasAddress: true,
  };

  it("is allowed on an open request, for a waiting answer of a validated professional", () => {
    expect(acceptRefusal(accept, NOON)).toBeNull();
  });

  it("needs the family's street and house number (D-77)", () => {
    expect(acceptRefusal({ ...accept, hasAddress: false }, NOON)).toBe("adresse");
    expect(hasAddress({ street: "Rue du Bailli", houseNumber: "12" })).toBe(true);
    expect(hasAddress({ street: "Rue du Bailli", houseNumber: null })).toBe(false);
    expect(hasAddress({ street: "  ", houseNumber: "12" })).toBe(false);
    expect(hasAddress(null)).toBe(false);
  });

  it("refuses a booked or started request, and a withdrawn answer or one no longer validated", () => {
    expect(acceptRefusal({ ...accept, request: { ...request, status: "attribuee" } }, NOON)).toBe("nonModifiable");
    expect(
      acceptRefusal({ ...accept, request: { ...request, nightDate: "2026-09-24" } }, NOON),
    ).toBe("nonModifiable");
    expect(acceptRefusal({ ...accept, answer: { status: "retiree", profileStatus: "valide" } }, NOON)).toBe(
      "indisponible",
    );
    expect(acceptRefusal({ ...accept, answer: { status: "en_attente", profileStatus: "en_attente" } }, NOON)).toBe(
      "indisponible",
    );
  });
});

describe("republishing (D-70)", () => {
  it("offers republishing on an open request ahead with at least one waiting answer", () => {
    expect(canRepublish(request, 1, NOON)).toBe(true);
    expect(canRepublish(request, 0, NOON)).toBe(false);
    expect(canRepublish({ ...request, status: "attribuee" }, 2, NOON)).toBe(false);
    expect(canRepublish({ ...request, nightDate: "2026-09-24" }, 2, NOON)).toBe(false);
  });
});

/**
 * Spec (JAM-302, Q5): a professional answers a regular request once, for all
 * its open nights ahead, or not at all. A night she is booked or was declined
 * on leaves her list, and then she sees no answer button.
 */
describe("the answer to a regular request (JAM-302)", () => {
  it("offers the answer when her list holds every open night and she never answered", () => {
    expect(seriesAnswerState([{ answer: null }, { answer: null }, { answer: null }], 3)).toBe("repondre");
  });

  it("offers it again after she withdrew", () => {
    expect(seriesAnswerState([{ answer: "retiree" }, { answer: "retiree" }], 2)).toBe("repondre");
  });

  it("reads as answered once every night holds her waiting answer", () => {
    expect(seriesAnswerState([{ answer: "en_attente" }, { answer: "en_attente" }], 2)).toBe("repondu");
  });

  it("offers nothing when a night is missing from her list (booked that night, Q5)", () => {
    expect(seriesAnswerState([{ answer: null }, { answer: null }], 3)).toBe("aucun");
  });

  it("offers nothing on an empty list", () => {
    expect(seriesAnswerState([], 0)).toBe("aucun");
  });
});

/**
 * Spec (JAM-344): on a request she answered, a professional reads the rates
 * saved on her answer, the ones the family reads. On any other request she
 * reads her profile's current rates.
 */
describe("the rates she reads on a family's request (JAM-344)", () => {
  const profile = { nightRateEur: 160, extraHourRateEur: 16 };
  const saved = { nightRateEur: 150, extraHourRateEur: 15 };

  it("reads her profile's rates before an answer", () => {
    expect(shownRates(profile, null, undefined)).toEqual({ source: "profil", ...profile });
  });

  it("reads the rates saved on her waiting answer", () => {
    expect(shownRates(profile, "en_attente", saved)).toEqual({ source: "reponse", ...saved });
  });

  it("shows no extra hour's rate when her answer saved none", () => {
    expect(shownRates(profile, "en_attente", { nightRateEur: 150, extraHourRateEur: null })).toEqual({
      source: "reponse",
      nightRateEur: 150,
      extraHourRateEur: null,
    });
  });

  it("reads her profile's rates after she withdrew: a new answer carries them", () => {
    expect(shownRates(profile, "retiree", saved)).toEqual({ source: "profil", ...profile });
  });

  it("reads her profile's rates when the saved rates were not read", () => {
    expect(shownRates(profile, "en_attente", undefined)).toEqual({ source: "profil", ...profile });
  });

  it("keeps a profile with no rate as it is", () => {
    expect(shownRates({ nightRateEur: null, extraHourRateEur: null }, null, undefined)).toEqual({
      source: "profil",
      nightRateEur: null,
      extraHourRateEur: null,
    });
  });
});

describe("the rates she reads on a regular request (JAM-344)", () => {
  const profile = { nightRateEur: 160, extraHourRateEur: 16 };
  const saved = new Map<string, Rates>([
    ["n1", { nightRateEur: 150, extraHourRateEur: 15 }],
    ["n2", { nightRateEur: 150, extraHourRateEur: 15 }],
  ]);
  const night = (id: string, nightDate: string, answer: "en_attente" | "retiree" | null) => ({ id, nightDate, answer });

  it("reads her profile's rates before an answer", () => {
    const nights = [night("n1", "2026-10-01", null), night("n2", "2026-10-02", null)];
    expect(seriesShownRates(profile, nights, new Map())).toEqual({ source: "profil", ...profile });
  });

  it("reads the saved rates once every night holds her waiting answer", () => {
    const nights = [night("n1", "2026-10-01", "en_attente"), night("n2", "2026-10-02", "en_attente")];
    expect(seriesShownRates(profile, nights, saved)).toEqual({
      source: "reponse",
      nightRateEur: 150,
      extraHourRateEur: 15,
    });
  });

  it("reads the earliest night's answer, as the family's page does", () => {
    const nights = [night("n2", "2026-10-02", "en_attente"), night("n1", "2026-10-01", "en_attente")];
    const differing = new Map<string, Rates>([
      ["n1", { nightRateEur: 140, extraHourRateEur: null }],
      ["n2", { nightRateEur: 150, extraHourRateEur: 15 }],
    ]);
    expect(seriesShownRates(profile, nights, differing)).toEqual({
      source: "reponse",
      nightRateEur: 140,
      extraHourRateEur: null,
    });
  });

  it("reads her profile's rates after she withdrew", () => {
    const nights = [night("n1", "2026-10-01", "retiree"), night("n2", "2026-10-02", "retiree")];
    expect(seriesShownRates(profile, nights, saved)).toEqual({ source: "profil", ...profile });
  });

  it("reads her profile's rates when a night does not hold her waiting answer", () => {
    const nights = [night("n1", "2026-10-01", "en_attente"), night("n2", "2026-10-02", null)];
    expect(seriesShownRates(profile, nights, saved)).toEqual({ source: "profil", ...profile });
  });

  it("reads her profile's rates on an empty list", () => {
    expect(seriesShownRates(profile, [], saved)).toEqual({ source: "profil", ...profile });
  });
});
