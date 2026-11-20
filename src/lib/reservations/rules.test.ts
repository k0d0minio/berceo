import { describe, expect, it } from "vitest";

import {
  acceptRefusal,
  adaptedNights,
  answerRefusal,
  canRepublish,
  canWithdraw,
  changeRefusal,
  effectiveStart,
  hasAddress,
  isAdapted,
  proposalChanged,
  proposalField,
  proposalsSignature,
  readProposal,
  requestedStart,
  seriesAnswerState,
  seriesShownRates,
  shownRates,
  type AnswerFacts,
  type ChangeFacts,
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

/**
 * Spec (JAM-306): a professional can answer a night with a start that differs
 * from the family's. The proposal is a half hour from 18:00 to 23:00, never the
 * family's own start. The length of the night does not change, so the end
 * moves with the start. The family books the answer with its proposal only
 * after it confirmed exactly that proposal. After the booking, the night's
 * start is the proposed one, and the family's start stays as a record.
 */
describe("the adapted schedule (JAM-306)", () => {
  // 25 September 2026, 18:15 in Brussels (CEST).
  const EVENING = new Date("2026-09-25T16:15:00Z");
  const tonight: RequestFacts = { ...request, nightDate: "2026-09-25", startTime: "19:00:00" };

  it("reads no proposal from an empty field or from the family's own start", () => {
    expect(readProposal("19:00:00", "")).toEqual({ ok: true, proposed: null });
    expect(readProposal("19:00:00", null)).toEqual({ ok: true, proposed: null });
    expect(readProposal("19:00:00", undefined)).toEqual({ ok: true, proposed: null });
    expect(readProposal("19:00:00", "19:00")).toEqual({ ok: true, proposed: null });
    expect(readProposal("19:00:00", "19:00:00")).toEqual({ ok: true, proposed: null });
  });

  it("reads a half hour of the request's range that differs from the family's start", () => {
    expect(readProposal("19:00:00", "20:00")).toEqual({ ok: true, proposed: "20:00" });
    expect(readProposal("19:00:00", "18:30:00")).toEqual({ ok: true, proposed: "18:30" });
    expect(readProposal("19:00:00", "18:00")).toEqual({ ok: true, proposed: "18:00" });
    expect(readProposal("19:00:00", "23:00")).toEqual({ ok: true, proposed: "23:00" });
  });

  it.each(["17:30", "23:30", "20:15", "20:00:30", "20h00", "8pm", "20:00; drop table", "24:00"])(
    "refuses %s",
    (value) => {
      expect(readProposal("19:00:00", value)).toEqual({ ok: false });
    },
  );

  it("names one form field for each night", () => {
    expect(proposalField("2a7c9e1b-3d4f-4a6b-8c0d-1e2f3a4b5c61")).toBe("heure-2a7c9e1b-3d4f-4a6b-8c0d-1e2f3a4b5c61");
  });

  it("gives the night the proposed start, and the family's start when there is no proposal", () => {
    expect(effectiveStart("19:00:00", "20:00:00")).toBe("20:00");
    expect(effectiveStart("19:00:00", null)).toBe("19:00");
    expect(effectiveStart("19:00:00", undefined)).toBe("19:00");
  });

  it("keeps the start the family asked for readable on a night booked at a proposed start", () => {
    const booked = { startTime: "20:00:00", requestedStartTime: "19:00:00" };
    expect(requestedStart(booked)).toBe("19:00");
    expect(isAdapted(booked)).toBe(true);
    // A night booked at the family's own time, an open request, a request read without the column.
    for (const plain of [{ startTime: "19:00:00", requestedStartTime: null }, { startTime: "19:00:00" }]) {
      expect(requestedStart(plain)).toBe("19:00");
      expect(isAdapted(plain)).toBe(false);
    }
  });

  it("lists only the nights with a proposal, in night order, with the end the proposed start gives", () => {
    const nights = adaptedNights([
      { requestId: "n3", nightDate: "2026-10-03", startTime: "19:00:00", extraHours: 1.5, proposedStartTime: "20:00:00" },
      { requestId: "n1", nightDate: "2026-10-01", startTime: "19:00:00", extraHours: 0, proposedStartTime: null },
      { requestId: "n2", nightDate: "2026-10-02", startTime: "19:00:00", extraHours: 0, proposedStartTime: "18:30:00" },
      // A proposal equal to the family's start is no proposal.
      { requestId: "n4", nightDate: "2026-10-04", startTime: "19:00:00", extraHours: 0, proposedStartTime: "19:00:00" },
    ]);
    expect(nights).toEqual([
      // 18:30 + 11 hours: the length of the night does not change.
      { requestId: "n2", nightDate: "2026-10-02", requested: "19:00", proposed: "18:30", end: "05:30" },
      // 20:00 + 11 hours + 1 h 30.
      { requestId: "n3", nightDate: "2026-10-03", requested: "19:00", proposed: "20:00", end: "08:30" },
    ]);
  });

  it("has no adapted night on an answer at the family's times", () => {
    expect(
      adaptedNights([{ requestId: "n1", nightDate: "2026-10-01", startTime: "19:00:00", extraHours: 2, proposedStartTime: null }]),
    ).toEqual([]);
  });

  it("signs what the family confirms: each proposed start, whatever the order, empty for none", () => {
    expect(proposalsSignature([{ requestId: "n1", proposedStartTime: null }])).toBe("");
    expect(proposalsSignature([])).toBe("");
    const a = proposalsSignature([
      { requestId: "n2", proposedStartTime: "20:00:00" },
      { requestId: "n1", proposedStartTime: null },
      { requestId: "n3", proposedStartTime: "18:30:00" },
    ]);
    expect(a).toBe("n2=20:00,n3=18:30");
    expect(
      proposalsSignature([
        { requestId: "n3", proposedStartTime: "18:30" },
        { requestId: "n2", proposedStartTime: "20:00" },
      ]),
    ).toBe(a);
    // Another proposal is another signature: the checkout refuses it.
    expect(proposalsSignature([{ requestId: "n2", proposedStartTime: "20:30:00" }])).not.toBe(
      proposalsSignature([{ requestId: "n2", proposedStartTime: "20:00:00" }]),
    );
  });

  it("refuses an answer whose proposed start has passed, while the family's start is ahead", () => {
    expect(answerRefusal({ ...facts, request: tonight }, EVENING)).toBeNull();
    expect(answerRefusal({ ...facts, request: tonight, proposedStartTime: "20:00" }, EVENING)).toBeNull();
    expect(answerRefusal({ ...facts, request: tonight, proposedStartTime: "18:00" }, EVENING)).toBe("commencee");
  });

  it("refuses the booking of an answer whose proposed start has passed", () => {
    const answer = { status: "en_attente" as const, profileStatus: "valide" };
    expect(acceptRefusal({ request: tonight, answer, hasAddress: true }, EVENING)).toBeNull();
    expect(
      acceptRefusal({ request: tonight, answer: { ...answer, proposedStartTime: "20:00:00" }, hasAddress: true }, EVENING),
    ).toBeNull();
    expect(
      acceptRefusal({ request: tonight, answer: { ...answer, proposedStartTime: "18:00:00" }, hasAddress: true }, EVENING),
    ).toBe("nonModifiable");
  });
});

/**
 * Spec (JAM-349): while her answer waits, a professional changes or removes
 * the start she proposed, on the answer itself. A booked, declined or
 * withdrawn answer is not changed, nor an answer she never gave. The new start
 * must be ahead, as for an answer. A value equal to the saved one is no
 * change, so nothing is written and the family is not told.
 */
describe("a proposed start changed in place (JAM-349)", () => {
  // 30 September 2026, 19:00 in Brussels (CEST): the night of 20:00 is one hour ahead.
  const SEVEN_PM = new Date("2026-09-30T17:00:00Z");
  const waiting: ChangeFacts = {
    profile: { status: "valide" },
    request: { status: "ouverte", nightDate: "2026-09-30", startTime: "20:00:00" },
    answer: "en_attente",
    proposedStartTime: "20:30",
  };

  it("lets her change, and remove, the proposal of a waiting answer on an open night ahead", () => {
    expect(changeRefusal(waiting, SEVEN_PM)).toBeNull();
    expect(changeRefusal({ ...waiting, proposedStartTime: null }, SEVEN_PM)).toBeNull();
  });

  it.each(["retenue", "non_retenue", "retiree", null] as const)(
    "does not change an answer that is %s",
    (answer) => {
      expect(changeRefusal({ ...waiting, answer }, SEVEN_PM)).toBe("modification");
    },
  );

  it("refuses a profile that is not validated", () => {
    for (const status of ["en_attente", "complement_demande", "refuse"]) {
      expect(changeRefusal({ ...waiting, profile: { status } }, SEVEN_PM)).toBe("nonValide");
    }
  });

  it.each(["attribuee", "annulee"] as const)("refuses a request that is %s", (status) => {
    expect(changeRefusal({ ...waiting, request: { ...waiting.request, status } }, SEVEN_PM)).toBe("fermee");
  });

  it("refuses once the night has started, and a new start that has passed", () => {
    const started = new Date("2026-09-30T18:00:00Z");
    expect(changeRefusal(waiting, started)).toBe("commencee");
    // 18:30 has passed at 19:00, while the family's 20:00 is ahead.
    expect(changeRefusal({ ...waiting, proposedStartTime: "18:30" }, SEVEN_PM)).toBe("commencee");
    expect(changeRefusal({ ...waiting, proposedStartTime: "19:30" }, SEVEN_PM)).toBeNull();
  });

  it("reads a change only when the start differs from the saved one", () => {
    expect(proposalChanged("20:30:00", "21:00")).toBe(true);
    expect(proposalChanged("20:30:00", null)).toBe(true);
    expect(proposalChanged(null, "20:30")).toBe(true);
    // The column holds seconds, the form does not.
    expect(proposalChanged("20:30:00", "20:30")).toBe(false);
    expect(proposalChanged(null, null)).toBe(false);
    expect(proposalChanged(undefined, "")).toBe(false);
  });
});
