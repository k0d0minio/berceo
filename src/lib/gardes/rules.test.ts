import { describe, expect, it } from "vitest";

import {
  canCancel,
  canReportAbsence,
  canRepublish,
  feeLine,
  gardeState,
  isAddressVisible,
  isReminderTime,
  otherSide,
  reminderNight,
  type GardeFacts,
} from "./rules";

/**
 * Spec (cycle-de-garde-et-annulation, D-2, D-17, D-105 to D-110): a confirmed
 * garde reads « À venir » before its start hour, « En cours » from it until
 * start + 11 h, « Terminée » after, with no job run; an annulée one reads
 * « Annulée » at any hour. Either side cancels until the start hour; either
 * side reports the other absent from the start hour until 24 h after the night
 * ends; the family republishes an annulée garde whose night has not started;
 * the professional reads the address on a confirmed garde until the night
 * ends; a professional's cancellation refunds the fee, a family's keeps it, an
 * absence refunds nothing on its own; the reminder leaves between 10:00 and
 * 10:59 in Brussels, about tomorrow's night. Written from the acceptance
 * criteria.
 */

// The night of 30 September 2026 from 20:00 ends on 1 October at 07:00 in Brussels (CEST, UTC+2).
const confirmed: GardeFacts = { status: "confirmee", nightDate: "2026-09-30", startTime: "20:00:00" };
const cancelled: GardeFacts = { ...confirmed, status: "annulee" };
const BEFORE_START = new Date("2026-09-30T17:59:00Z"); // 19:59 in Brussels
const AT_START = new Date("2026-09-30T18:00:00Z"); // 20:00
const BEFORE_END = new Date("2026-10-01T04:59:00Z"); // 06:59 the next morning
const AT_END = new Date("2026-10-01T05:00:00Z"); // 07:00
const BEFORE_DEADLINE = new Date("2026-10-02T04:59:00Z"); // 06:59 a day after the end
const AT_DEADLINE = new Date("2026-10-02T05:00:00Z"); // 07:00 a day after the end

describe("gardeState", () => {
  it("moves by the clock alone: à venir, en cours, terminée", () => {
    expect(gardeState(confirmed, BEFORE_START)).toBe("a_venir");
    expect(gardeState(confirmed, AT_START)).toBe("en_cours");
    expect(gardeState(confirmed, BEFORE_END)).toBe("en_cours");
    expect(gardeState(confirmed, AT_END)).toBe("terminee");
    expect(gardeState(confirmed, new Date("2026-11-30T12:00:00Z"))).toBe("terminee");
  });

  it("reads annulée at any hour", () => {
    for (const now of [BEFORE_START, AT_START, AT_END]) expect(gardeState(cancelled, now)).toBe("annulee");
  });

  it("keeps Brussels time across the change to winter time", () => {
    // 24 October 2026 from 23:00 (CEST) ends on 25 October at 10:00 (CET, UTC+1), after the clocks go back.
    const garde: GardeFacts = { status: "confirmee", nightDate: "2026-10-24", startTime: "23:00:00" };
    expect(gardeState(garde, new Date("2026-10-24T20:59:00Z"))).toBe("a_venir");
    expect(gardeState(garde, new Date("2026-10-24T21:00:00Z"))).toBe("en_cours");
    expect(gardeState(garde, new Date("2026-10-25T08:59:00Z"))).toBe("en_cours");
    expect(gardeState(garde, new Date("2026-10-25T09:00:00Z"))).toBe("terminee");
  });

  it("starts a night across midnight at the right hour in winter", () => {
    // 15 January 2027 from 18:30 (CET, UTC+1).
    const garde: GardeFacts = { status: "confirmee", nightDate: "2027-01-15", startTime: "18:30:00" };
    expect(gardeState(garde, new Date("2027-01-15T17:29:00Z"))).toBe("a_venir");
    expect(gardeState(garde, new Date("2027-01-15T17:30:00Z"))).toBe("en_cours");
    expect(gardeState(garde, new Date("2027-01-16T04:30:00Z"))).toBe("terminee");
  });
});

describe("canCancel", () => {
  it("lets either side cancel until the start hour, never from it", () => {
    expect(canCancel(confirmed, BEFORE_START)).toBe(true);
    expect(canCancel(confirmed, AT_START)).toBe(false);
    expect(canCancel(confirmed, AT_END)).toBe(false);
  });

  it("never cancels a garde twice", () => {
    expect(canCancel(cancelled, BEFORE_START)).toBe(false);
  });
});

describe("canReportAbsence", () => {
  it("opens at the start hour and closes 24 hours after the night ends", () => {
    expect(canReportAbsence(confirmed, BEFORE_START)).toBe(false);
    expect(canReportAbsence(confirmed, AT_START)).toBe(true);
    expect(canReportAbsence(confirmed, AT_END)).toBe(true);
    expect(canReportAbsence(confirmed, BEFORE_DEADLINE)).toBe(true);
    expect(canReportAbsence(confirmed, AT_DEADLINE)).toBe(false);
  });

  it("is refused once the garde is annulée, an absence already reported included", () => {
    expect(canReportAbsence(cancelled, AT_START)).toBe(false);
  });
});

describe("canRepublish", () => {
  it("offers a cancelled garde's night again until it starts", () => {
    expect(canRepublish(cancelled, BEFORE_START)).toBe(true);
    expect(canRepublish(cancelled, AT_START)).toBe(false);
  });

  it("never offers a confirmed garde", () => {
    expect(canRepublish(confirmed, BEFORE_START)).toBe(false);
  });
});

describe("isAddressVisible", () => {
  it("shows the address on a confirmed garde until the night ends", () => {
    expect(isAddressVisible(confirmed, BEFORE_START)).toBe(true);
    expect(isAddressVisible(confirmed, BEFORE_END)).toBe(true);
    expect(isAddressVisible(confirmed, AT_END)).toBe(false);
  });

  it("hides it on a cancelled garde at once", () => {
    expect(isAddressVisible(cancelled, BEFORE_START)).toBe(false);
  });
});

describe("otherSide", () => {
  it("records an absence against the side not reporting it", () => {
    expect(otherSide("famille")).toBe("professionnelle");
    expect(otherSide("professionnelle")).toBe("famille");
  });
});

describe("feeLine", () => {
  const byProfessional = { by: "professionnelle", kind: "annulation" } as const;
  const byFamily = { by: "famille", kind: "annulation" } as const;
  const absence = { by: "professionnelle", kind: "absence" } as const;

  it("says refunded once Stripe refunded, and in progress until then, when the professional cancels", () => {
    expect(feeLine(byProfessional, "remboursee")).toBe("rembourses");
    expect(feeLine(byProfessional, "payee")).toBe("remboursementEnCours");
    expect(feeLine(byProfessional, "remboursement_echoue")).toBe("remboursementEnCours");
  });

  it("says the fee is kept when the family cancels", () => {
    expect(feeLine(byFamily, "payee")).toBe("conserves");
  });

  it("promises nothing on an absence until the founders refund", () => {
    expect(feeLine(absence, "payee")).toBeNull();
    expect(feeLine(absence, "remboursee")).toBe("rembourses");
  });

  it("says nothing on a confirmed garde or without a paid fee", () => {
    expect(feeLine(null, "payee")).toBeNull();
    expect(feeLine(byProfessional, null)).toBeNull();
    expect(feeLine(byFamily, "expiree")).toBeNull();
  });
});

describe("the reminder of the day before", () => {
  it("leaves between 10:00 and 10:59 in Brussels, summer and winter", () => {
    expect(isReminderTime(new Date("2026-09-29T07:59:00Z"))).toBe(false); // 09:59 CEST
    expect(isReminderTime(new Date("2026-09-29T08:00:00Z"))).toBe(true); // 10:00 CEST
    expect(isReminderTime(new Date("2026-09-29T08:59:00Z"))).toBe(true); // 10:59 CEST
    expect(isReminderTime(new Date("2026-09-29T09:00:00Z"))).toBe(false); // 11:00 CEST
    expect(isReminderTime(new Date("2026-12-01T08:00:00Z"))).toBe(false); // 09:00 CET
    expect(isReminderTime(new Date("2026-12-01T09:00:00Z"))).toBe(true); // 10:00 CET
  });

  it("is about tomorrow's night", () => {
    expect(reminderNight(new Date("2026-09-29T08:00:00Z"))).toBe("2026-09-30");
    expect(reminderNight(new Date("2026-12-31T09:00:00Z"))).toBe("2027-01-01");
  });
});
