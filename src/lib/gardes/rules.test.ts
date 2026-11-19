import { describe, expect, it } from "vitest";

import { otherSide } from "@/lib/demandes/rules";

import {
  CANCELLATION_DELAY_HOURS,
  CANCELLATION_REASONS,
  canCancel,
  canCancelForBerceo,
  canContest,
  canReportAbsence,
  canRepublish,
  CONTEST_HOURS,
  creditOriginOf,
  feeLine,
  gardeState,
  hoursBeforeStart,
  isAddressVisible,
  isCancellationDelay,
  isLateCancellation,
  isReasonOf,
  isReminderTime,
  isWithinDelay,
  lateCancellationFrom,
  outcomeOf,
  reminderNight,
  type ContestFacts,
  type GardeFacts,
  type TableFacts,
} from "./rules";

/**
 * Spec (cycle-de-garde-et-annulation, D-2, D-17, D-105 to D-110): a confirmed
 * garde reads « À venir » before its start hour, « En cours » from it until
 * start + 11 h + the extra hours, « Terminée » after, with no job run; an annulée one reads
 * « Annulée » at any hour. Either side cancels until the start hour; either
 * side reports the other absent from the start hour until 24 h after the night
 * ends; the family republishes an annulée garde whose night has not started;
 * the professional reads the address on a confirmed garde until the night
 * ends; the reminder leaves between 10:00 and 10:59 in Brussels, about
 * tomorrow's night. Written from the acceptance criteria. The fee follows the
 * founders' table: `outcomeOf` below (annulations-table).
 */

// The night of 30 September 2026 from 20:00 ends on 1 October at 07:00 in Brussels (CEST, UTC+2).
const confirmed: GardeFacts = { status: "confirmee", nightDate: "2026-09-30", startTime: "20:00:00", extraHours: 0 };
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
    const garde: GardeFacts = { status: "confirmee", nightDate: "2026-10-24", startTime: "23:00:00", extraHours: 0 };
    expect(gardeState(garde, new Date("2026-10-24T20:59:00Z"))).toBe("a_venir");
    expect(gardeState(garde, new Date("2026-10-24T21:00:00Z"))).toBe("en_cours");
    expect(gardeState(garde, new Date("2026-10-25T08:59:00Z"))).toBe("en_cours");
    expect(gardeState(garde, new Date("2026-10-25T09:00:00Z"))).toBe("terminee");
  });

  it("starts a night across midnight at the right hour in winter", () => {
    // 15 January 2027 from 18:30 (CET, UTC+1).
    const garde: GardeFacts = { status: "confirmee", nightDate: "2027-01-15", startTime: "18:30:00", extraHours: 0 };
    expect(gardeState(garde, new Date("2027-01-15T17:29:00Z"))).toBe("a_venir");
    expect(gardeState(garde, new Date("2027-01-15T17:30:00Z"))).toBe("en_cours");
    expect(gardeState(garde, new Date("2027-01-16T04:30:00Z"))).toBe("terminee");
  });

  it("stays en cours through the extra hours", () => {
    // Two extra hours: the night of 30 September from 20:00 ends at 09:00.
    const longer: GardeFacts = { ...confirmed, extraHours: 2 };
    expect(gardeState(longer, AT_END)).toBe("en_cours");
    expect(gardeState(longer, new Date("2026-10-01T06:59:00Z"))).toBe("en_cours");
    expect(gardeState(longer, new Date("2026-10-01T07:00:00Z"))).toBe("terminee");
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

  it("closes 24 hours after the end of the extra hours", () => {
    const longer: GardeFacts = { ...confirmed, extraHours: 2 };
    expect(canReportAbsence(longer, AT_DEADLINE)).toBe(true);
    expect(canReportAbsence(longer, new Date("2026-10-02T07:00:00Z"))).toBe(false);
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

  it("keeps it through the extra hours", () => {
    const longer: GardeFacts = { ...confirmed, extraHours: 2 };
    expect(isAddressVisible(longer, AT_END)).toBe(true);
    expect(isAddressVisible(longer, new Date("2026-10-01T07:00:00Z"))).toBe(false);
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
  const professionalAbsent = { by: "professionnelle", kind: "absence" } as const;
  const familyAbsent = { by: "famille", kind: "absence" } as const;

  it("names the credit when the garde has a live one", () => {
    expect(feeLine(byProfessional, false, "payee", true)).toBe("credit");
    expect(feeLine(byFamily, false, "payee", true)).toBe("credit");
    expect(feeLine(professionalAbsent, false, "payee", true)).toBe("credit");
  });

  it("says the fee stays when the family's cancellation or absence left it at Berceo", () => {
    expect(feeLine(byFamily, false, "payee", false)).toBe("conserves");
    expect(feeLine(familyAbsent, false, "payee", false)).toBe("conserves");
  });

  it("says the founders decide on a litige, whatever the fee", () => {
    expect(feeLine(professionalAbsent, true, "payee", false)).toBe("litige");
    expect(feeLine(familyAbsent, true, null, false)).toBe("litige");
  });

  it("says refunded once the founders refunded", () => {
    expect(feeLine(byProfessional, false, "remboursee", false)).toBe("rembourses");
  });

  it("promises nothing on a professional's cancellation made before the table, the founders refund it", () => {
    expect(feeLine(byProfessional, false, "payee", false)).toBeNull();
    expect(feeLine(byProfessional, false, "remboursement_echoue", false)).toBeNull();
  });

  it("says nothing on a confirmed garde or without a paid fee", () => {
    expect(feeLine(null, false, "payee", true)).toBeNull();
    expect(feeLine(byProfessional, false, null, false)).toBeNull();
    expect(feeLine(byFamily, false, "expiree", false)).toBeNull();
  });
});

/**
 * Spec (annulations-table, the answers [9.2, 9.3]): one line of the founders'
 * table per end of a garde, with the delay from the settings. The family
 * cancels more than the delay before the start: a credit. Within it: the fee
 * stays. The professional cancels, at any delay: a credit. The professional is
 * reported absent: a credit. The family is reported absent: the fee stays. The
 * absent side contests: « litige », no credit. Berceo cancels: a credit. No
 * paid fee: nothing to do.
 */
describe("outcomeOf, the founders' table", () => {
  // The night of 30 September 2026 from 20:00 in Brussels; 24 hours before is 29 September at 20:00.
  const base: TableFacts = {
    by: "famille",
    kind: "annulation",
    nightDate: "2026-09-30",
    startTime: "20:00:00",
    at: new Date("2026-09-29T17:59:00Z"), // 19:59 the day before
    disputed: false,
    paid: true,
  };
  const late = new Date("2026-09-29T18:00:00Z"); // 20:00 the day before
  const night = new Date("2026-09-30T23:00:00Z"); // 01:00 during the night

  it("credits the family who cancels more than the delay before the start", () => {
    expect(outcomeOf(base, CANCELLATION_DELAY_HOURS)).toBe("credit");
  });

  it("keeps the fee when the family cancels within the delay", () => {
    expect(outcomeOf({ ...base, at: late }, CANCELLATION_DELAY_HOURS)).toBe("conserve");
    expect(outcomeOf({ ...base, at: new Date("2026-09-30T17:59:00Z") }, CANCELLATION_DELAY_HOURS)).toBe("conserve");
  });

  it("reads the founders' delay, not a fixed 24 hours", () => {
    expect(outcomeOf({ ...base, at: late }, 1)).toBe("credit");
    expect(outcomeOf({ ...base, at: new Date("2026-09-30T17:00:00Z") }, 1)).toBe("conserve");
    expect(outcomeOf(base, 48)).toBe("conserve");
  });

  it("credits the professional's cancellation at any delay", () => {
    for (const at of [base.at, late, new Date("2026-09-30T17:59:00Z")]) {
      expect(outcomeOf({ ...base, by: "professionnelle", at }, CANCELLATION_DELAY_HOURS)).toBe("credit");
    }
  });

  it("credits the professional's absence", () => {
    expect(outcomeOf({ ...base, by: "professionnelle", kind: "absence", at: night }, CANCELLATION_DELAY_HOURS)).toBe(
      "credit",
    );
  });

  it("keeps the fee when the family is absent or the garde could not start at her home", () => {
    expect(outcomeOf({ ...base, kind: "absence", at: night }, CANCELLATION_DELAY_HOURS)).toBe("conserve");
  });

  it("opens a litige, with no credit, when the absent side contests", () => {
    for (const by of ["famille", "professionnelle"] as const) {
      expect(outcomeOf({ ...base, by, kind: "absence", at: night, disputed: true }, CANCELLATION_DELAY_HOURS)).toBe(
        "litige",
      );
    }
  });

  it("credits a cancellation by Berceo", () => {
    expect(outcomeOf({ ...base, by: "berceo", at: late }, CANCELLATION_DELAY_HOURS)).toBe("credit");
  });

  it("does nothing for a garde with no paid fee", () => {
    expect(outcomeOf({ ...base, paid: false }, CANCELLATION_DELAY_HOURS)).toBe("rien");
    expect(outcomeOf({ ...base, by: "professionnelle", paid: false }, CANCELLATION_DELAY_HOURS)).toBe("rien");
  });

  it("names the origin of each credit", () => {
    expect(creditOriginOf("famille", "annulation")).toBe("annulation_famille");
    expect(creditOriginOf("professionnelle", "annulation")).toBe("annulation_professionnelle");
    expect(creditOriginOf("professionnelle", "absence")).toBe("absence_professionnelle");
    expect(creditOriginOf("berceo", "annulation")).toBe("annulation_berceo");
  });

  it("agrees with the cancel dialog on the edge of the delay", () => {
    expect(isWithinDelay("2026-09-30", "20:00:00", base.at, 24)).toBe(false);
    expect(isWithinDelay("2026-09-30", "20:00:00", late, 24)).toBe(true);
    expect(isLateCancellation(confirmed, late, 24)).toBe(true);
  });
});

/**
 * Spec (annulations-table, the answers [9.3]): the side reported absent
 * contests the report once, for 24 hours after it; the reporting side cannot.
 */
describe("canContest", () => {
  const reportedAt = new Date("2026-09-30T23:00:00Z");
  const professionalAbsent: ContestFacts = {
    status: "annulee",
    cancellationKind: "absence",
    cancelledBy: "professionnelle",
    cancelledAt: reportedAt,
    disputedAt: null,
  };

  it("lets the absent side contest for 24 hours after the report", () => {
    expect(CONTEST_HOURS).toBe(24);
    expect(canContest(professionalAbsent, "professionnelle", reportedAt)).toBe(true);
    expect(canContest(professionalAbsent, "professionnelle", new Date("2026-10-01T22:59:00Z"))).toBe(true);
    expect(canContest(professionalAbsent, "professionnelle", new Date("2026-10-01T23:00:00Z"))).toBe(false);
  });

  it("never lets the reporting side contest its own report", () => {
    expect(canContest(professionalAbsent, "famille", reportedAt)).toBe(false);
  });

  it("contests once", () => {
    expect(canContest({ ...professionalAbsent, disputedAt: reportedAt }, "professionnelle", reportedAt)).toBe(false);
  });

  it("contests an absence only", () => {
    expect(canContest({ ...professionalAbsent, cancellationKind: "annulation" }, "professionnelle", reportedAt)).toBe(
      false,
    );
    expect(canContest({ ...professionalAbsent, status: "confirmee" }, "professionnelle", reportedAt)).toBe(false);
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

/**
 * Spec (annulations-delai-et-motif): the founders' delay is 24 hours until they
 * change it, a whole number of hours from 1 to 168; a cancellation from that
 * many hours before the start hour until the start is late; each side cancels
 * with one reason of its own short list.
 */
describe("the cancellation delay", () => {
  it("is 24 hours by default", () => {
    expect(CANCELLATION_DELAY_HOURS).toBe(24);
  });

  it("takes a whole number of hours from 1 to 168", () => {
    for (const value of [1, 24, 168]) expect(isCancellationDelay(value)).toBe(true);
    for (const value of [0, 169, -24, 24.5, Number.NaN, "24", null, undefined]) {
      expect(isCancellationDelay(value)).toBe(false);
    }
  });

  it("starts the delay that many wall-clock hours before the start hour", () => {
    expect(lateCancellationFrom("2026-09-30", "20:00:00", 24)).toBe("2026-09-29T20:00");
    expect(lateCancellationFrom("2026-09-30", "20:00:00", 1)).toBe("2026-09-30T19:00");
    expect(lateCancellationFrom("2026-09-30", "20:00:00", 168)).toBe("2026-09-23T20:00");
    expect(lateCancellationFrom("2026-03-01", "06:00", 24)).toBe("2026-02-28T06:00");
  });

  it("reads a cancellation late from the delay until the start hour", () => {
    // 19:59 and 20:00 in Brussels the day before the night of 30 September from 20:00.
    expect(isLateCancellation(confirmed, new Date("2026-09-29T17:59:00Z"), 24)).toBe(false);
    expect(isLateCancellation(confirmed, new Date("2026-09-29T18:00:00Z"), 24)).toBe(true);
    expect(isLateCancellation(confirmed, BEFORE_START, 24)).toBe(true);
  });

  it("follows the founders' value", () => {
    // 18:59 and 19:00 in Brussels the same evening, with a delay of one hour.
    expect(isLateCancellation(confirmed, new Date("2026-09-30T16:59:00Z"), 1)).toBe(false);
    expect(isLateCancellation(confirmed, new Date("2026-09-30T17:00:00Z"), 1)).toBe(true);
  });

  it("says nothing of a garde that can no longer be cancelled", () => {
    expect(isLateCancellation(confirmed, AT_START, 24)).toBe(false);
    expect(isLateCancellation(cancelled, BEFORE_START, 24)).toBe(false);
  });
});

describe("the reasons of a cancellation", () => {
  it("gives each side four reasons, « Autre » last", () => {
    expect(CANCELLATION_REASONS.famille).toEqual(["plus_besoin", "imprevu", "autre_solution", "autre"]);
    expect(CANCELLATION_REASONS.professionnelle).toEqual(["malade", "empechement", "indisponible", "autre"]);
  });

  it("holds a reason to its side's list", () => {
    expect(isReasonOf("famille", "plus_besoin")).toBe(true);
    expect(isReasonOf("professionnelle", "malade")).toBe(true);
    expect(isReasonOf("famille", "autre")).toBe(true);
    expect(isReasonOf("professionnelle", "autre")).toBe(true);
    expect(isReasonOf("famille", "malade")).toBe(false);
    expect(isReasonOf("professionnelle", "plus_besoin")).toBe(false);
    for (const value of ["", "inconnu", null, undefined, 1]) expect(isReasonOf("famille", value)).toBe(false);
  });
});

/**
 * Spec (annulations-back-office): a founder cancels a confirmed garde for
 * Berceo until the end of its night (Q5), and « Signalements » shows the whole
 * hours from a cancellation to the start hour, in Brussels wall-clock time (Q1).
 * A litige the founders closed with a credit of the fee reads as that credit.
 */
describe("a cancellation for Berceo (annulations-back-office)", () => {
  it("is open before the start and while the night is under way, never after its end", () => {
    expect(canCancelForBerceo(confirmed, BEFORE_START)).toBe(true);
    expect(canCancelForBerceo(confirmed, AT_START)).toBe(true);
    expect(canCancelForBerceo(confirmed, BEFORE_END)).toBe(true);
    expect(canCancelForBerceo(confirmed, AT_END)).toBe(false);
  });

  it("never cancels a garde twice", () => {
    for (const now of [BEFORE_START, AT_START]) expect(canCancelForBerceo(cancelled, now)).toBe(false);
  });

  it("credits the family's fee with the origin annulation_berceo", () => {
    expect(creditOriginOf("berceo", "annulation")).toBe("annulation_berceo");
  });
});

describe("hoursBeforeStart", () => {
  it("counts the whole hours to the start hour, rounded down", () => {
    expect(hoursBeforeStart("2026-09-30", "20:00:00", new Date("2026-09-29T18:00:00Z"))).toBe(24);
    expect(hoursBeforeStart("2026-09-30", "20:00:00", new Date("2026-09-29T18:30:00Z"))).toBe(23);
    expect(hoursBeforeStart("2026-09-30", "20:00:00", BEFORE_START)).toBe(0);
    expect(hoursBeforeStart("2026-09-30", "20:00:00", AT_START)).toBe(0);
  });

  it("is negative once the night has started", () => {
    expect(hoursBeforeStart("2026-09-30", "20:00:00", new Date("2026-09-30T19:00:00Z"))).toBe(-1);
  });

  it("reads Brussels wall-clock time across the change to winter time", () => {
    // 24 October 2026 at 20:00 (CEST) to 25 October 2026 at 20:00 (CET): 24 hours on the wall clock.
    expect(hoursBeforeStart("2026-10-25", "20:00:00", new Date("2026-10-24T18:00:00Z"))).toBe(24);
  });
});

describe("feeLine after the founders' credit (annulations-back-office)", () => {
  it("names the credit on a litige the founders closed with one", () => {
    expect(feeLine({ by: "famille", kind: "absence" }, true, "payee", true)).toBe("credit");
    expect(feeLine({ by: "professionnelle", kind: "absence" }, true, "payee", true)).toBe("credit");
  });

  it("names the credit of a cancellation by Berceo, and nothing without one", () => {
    expect(feeLine({ by: "berceo", kind: "annulation" }, false, "payee", true)).toBe("credit");
    expect(feeLine({ by: "berceo", kind: "annulation" }, false, null, false)).toBeNull();
  });
});
