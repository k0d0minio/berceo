import { describe, expect, it } from "vitest";

import {
  acceptRefusal,
  acceptTransition,
  answerRefusal,
  canRepublish,
  canSendInPriority,
  canWithdraw,
  declinedOnClose,
  hasAddress,
  isOnHerList,
  type AnswerFacts,
  type RequestFacts,
} from "./rules";

/**
 * Spec (candidature-et-reservation, D-70, D-71, D-73, D-76, D-77): who may
 * answer and each refusal, the same-night rule, withdrawal, the accept and
 * republish transitions, the priority request set once, and the address a
 * family needs before accepting. Written from the acceptance criteria.
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

describe("her list", () => {
  const list = { request, servesCommune: true, answer: null, bookedThatNight: false, profileId: "p-julie" };

  it("holds open requests ahead in her zone, and priority ones sent to her anywhere", () => {
    expect(isOnHerList(list, NOON)).toBe(true);
    expect(isOnHerList({ ...list, servesCommune: false }, NOON)).toBe(false);
    expect(
      isOnHerList({ ...list, servesCommune: false, request: { ...request, priorityProfileId: "p-julie" } }, NOON),
    ).toBe(true);
  });

  it("hides a request she was declined on, one on a night she is booked, and a booked one", () => {
    expect(isOnHerList({ ...list, answer: "non_retenue" }, NOON)).toBe(false);
    expect(isOnHerList({ ...list, bookedThatNight: true }, NOON)).toBe(false);
    expect(isOnHerList({ ...list, request: { ...request, status: "attribuee" } }, NOON)).toBe(false);
  });

  it("keeps a request she answered, so she can withdraw", () => {
    expect(isOnHerList({ ...list, answer: "en_attente" }, NOON)).toBe(true);
  });
});

describe("withdrawing an answer", () => {
  it("is possible while the answer waits and the request is open and ahead", () => {
    expect(canWithdraw("en_attente", request, NOON)).toBe(true);
    expect(canWithdraw("retenue", request, NOON)).toBe(false);
    expect(canWithdraw("non_retenue", request, NOON)).toBe(false);
    expect(canWithdraw(null, request, NOON)).toBe(false);
    expect(canWithdraw("en_attente", { ...request, status: "attribuee" }, NOON)).toBe(false);
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

  it("books the chosen answer, declines the other waiting ones, and withdraws hers that night", () => {
    const onRequest = [
      { id: "a-julie", status: "en_attente" as const },
      { id: "a-emma", status: "en_attente" as const },
      { id: "a-lea", status: "retiree" as const },
    ];
    const hersThatNight = [
      { id: "a-julie", status: "en_attente" as const },
      { id: "a-julie-ailleurs", status: "en_attente" as const },
      { id: "a-julie-vieille", status: "non_retenue" as const },
    ];
    expect(acceptTransition("a-julie", onRequest, hersThatNight)).toEqual({
      retenue: "a-julie",
      nonRetenues: ["a-emma"],
      retirees: ["a-julie-ailleurs"],
    });
  });
});

describe("republishing and cancelling (D-70, D-76)", () => {
  it("offers republishing on an open request ahead with at least one waiting answer", () => {
    expect(canRepublish(request, 1, NOON)).toBe(true);
    expect(canRepublish(request, 0, NOON)).toBe(false);
    expect(canRepublish({ ...request, status: "attribuee" }, 2, NOON)).toBe(false);
    expect(canRepublish({ ...request, nightDate: "2026-09-24" }, 2, NOON)).toBe(false);
  });

  it("declines every waiting answer, and leaves withdrawn ones alone", () => {
    expect(
      declinedOnClose([
        { id: "a1", status: "en_attente" },
        { id: "a2", status: "retiree" },
        { id: "a3", status: "en_attente" },
      ]),
    ).toEqual(["a1", "a3"]);
  });
});

describe("the priority request (D-71)", () => {
  const unsent = { ...request, prioritySentAt: null };

  it("can be sent once, on an open request ahead", () => {
    expect(canSendInPriority(unsent, NOON)).toBe(true);
    expect(canSendInPriority({ ...unsent, priorityProfileId: "p-julie", prioritySentAt: NOON }, NOON)).toBe(false);
    expect(canSendInPriority({ ...unsent, status: "annulee" }, NOON)).toBe(false);
  });

  it("is never sent again once its professional left, even though her id was cleared", () => {
    expect(canSendInPriority({ ...unsent, prioritySentAt: NOON }, NOON)).toBe(false);
  });
});
