import { describe, expect, it } from "vitest";

import {
  DECISION_ACTION,
  DECISION_STATUS,
  NOTE_MAX,
  REASON_MAX,
  byOldestSubmission,
  canGrantCredit,
  checkReason,
  delayVerdict,
  isHeldStudent,
  isPurgeDue,
  isReviewable,
  journalPage,
  needsReason,
  purgeCutoff,
  queueStatus,
  refuseDecision,
  reportFilter,
  reportOutcome,
  type ReportFacts,
  type ReviewFile,
} from "./rules";

/*
 * Written from the spec's acceptance criteria (verification-back-office), not
 * from the implementation.
 */

const waiting: ReviewFile = { status: "en_attente", profession: "sage_femme", reviewReason: null };
const student: ReviewFile = { ...waiting, profession: "etudiante_sage_femme_3e" };
const fourthYear: ReviewFile = { ...waiting, profession: "etudiante_sage_femme_4e" };

describe("the queue", () => {
  it("lists waiting files and files asked for a complément, nothing else", () => {
    expect(isReviewable("en_attente")).toBe(true);
    expect(isReviewable("complement_demande")).toBe(true);
    for (const status of ["brouillon", "valide", "refuse"] as const) {
      expect(isReviewable(status)).toBe(false);
    }
  });

  it("puts the oldest file first, a file sent back keeping its date", () => {
    const files = [
      { id: "c", submittedAt: new Date("2026-09-24T10:00:00Z") },
      { id: "a", submittedAt: new Date("2026-09-20T10:00:00Z") },
      { id: "b", submittedAt: new Date("2026-09-22T10:00:00Z") },
    ];
    expect(files.sort(byOldestSubmission).map((f) => f.id)).toEqual(["a", "b", "c"]);
  });

  it("reads the four statuts", () => {
    expect(queueStatus(waiting, true)).toBe("enAttente");
    expect(queueStatus({ ...waiting, status: "complement_demande", reviewReason: "Le verso" }, true)).toBe(
      "complementDemande",
    );
    expect(queueStatus({ ...waiting, reviewReason: "Le verso" }, true)).toBe("complementRecu");
    expect(queueStatus(student, false)).toBe("etudiantes");
  });
});

describe("the students switch (D-7, D-52)", () => {
  it.each([student, fourthYear])("holds a waiting $profession file while the switch is off", (file) => {
    expect(isHeldStudent(file, false)).toBe(true);
    expect(queueStatus(file, false)).toBe("etudiantes");
    expect(refuseDecision("valider", file, false)).toBe("etudiantes");
  });

  it("still lets the founders ask for a complément or refuse it", () => {
    expect(refuseDecision("complement", student, false)).toBeNull();
    expect(refuseDecision("refuser", student, false)).toBeNull();
  });

  it("releases it into the ordinary queue once the switch is on", () => {
    expect(isHeldStudent(student, true)).toBe(false);
    expect(queueStatus(student, true)).toBe("enAttente");
    expect(refuseDecision("valider", student, true)).toBeNull();
  });

  it("never holds another profession", () => {
    expect(isHeldStudent(waiting, false)).toBe(false);
    expect(refuseDecision("valider", waiting, false)).toBeNull();
  });
});

describe("the three decisions", () => {
  it("moves a file to valide, complément demandé or refusé, each with its journal action", () => {
    expect(DECISION_STATUS).toEqual({ valider: "valide", complement: "complement_demande", refuser: "refuse" });
    expect(DECISION_ACTION).toEqual({
      valider: "profil_valide",
      complement: "complement_demande",
      refuser: "profil_refuse",
    });
  });

  it("allows each decision on a waiting file and on a file asked for a complément", () => {
    for (const decision of ["valider", "complement", "refuser"] as const) {
      expect(refuseDecision(decision, waiting, true)).toBeNull();
      expect(refuseDecision(decision, { ...waiting, status: "complement_demande" }, true)).toBeNull();
    }
  });

  it("refuses any decision on a file already handled", () => {
    for (const status of ["brouillon", "valide", "refuse"] as const) {
      for (const decision of ["valider", "complement", "refuser"] as const) {
        expect(refuseDecision(decision, { ...waiting, status }, true)).toBe("traite");
      }
    }
  });

  it("asks a reason for a complément and a refusal only", () => {
    expect(needsReason("valider")).toBe(false);
    expect(needsReason("complement")).toBe(true);
    expect(needsReason("refuser")).toBe(true);
  });
});

describe("a reason", () => {
  it("is required", () => {
    expect(checkReason("")).toEqual({ ok: false, error: "motifRequis" });
    expect(checkReason("   \n ")).toEqual({ ok: false, error: "motifRequis" });
    expect(checkReason(undefined)).toEqual({ ok: false, error: "motifRequis" });
  });

  it("holds 1 to 1,000 characters, trimmed", () => {
    expect(checkReason("  Le verso du diplôme  ")).toEqual({ ok: true, value: "Le verso du diplôme" });
    expect(checkReason("x".repeat(REASON_MAX))).toEqual({ ok: true, value: "x".repeat(1000) });
    expect(checkReason("x".repeat(REASON_MAX + 1))).toEqual({ ok: false, error: "motifLong" });
  });
});

describe("the purge of a refused file (D-41)", () => {
  const now = new Date("2026-10-31T03:00:00Z");
  const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  it("counts thirty days from the refusal", () => {
    expect(purgeCutoff(now)).toEqual(days(30));
  });

  it("purges a file refused more than thirty days ago", () => {
    expect(isPurgeDue({ status: "refuse", reviewedAt: days(31) }, now)).toBe(true);
  });

  it("leaves a file refused less than thirty days ago", () => {
    expect(isPurgeDue({ status: "refuse", reviewedAt: days(29) }, now)).toBe(false);
    expect(isPurgeDue({ status: "refuse", reviewedAt: days(30) }, now)).toBe(false);
  });

  it("never touches a file that is not refused", () => {
    for (const status of ["brouillon", "en_attente", "complement_demande", "valide"] as const) {
      expect(isPurgeDue({ status, reviewedAt: days(90) }, now)).toBe(false);
    }
  });
});

describe("the journal's pages", () => {
  it("reads a page number, anything else as the first page", () => {
    expect(journalPage("3")).toBe(3);
    for (const raw of [undefined, "", "0", "-1", "2.5", "abc"]) expect(journalPage(raw)).toBe(1);
  });
});

/*
 * Spec (annulations-back-office): « Signalements » filters the litiges, shows
 * the line of the table each cancellation fell on, read from what was written
 * then (Q1), and what became of the fee; a founder grants a credit of the fee
 * on a litige or a fee the family's own cancellation or absence left at
 * Berceo, once, with a note of 500 characters at most (Q3).
 */
describe("the founders' reports and credits (annulations-back-office)", () => {
  const familyLate: ReportFacts = { side: "famille", kind: "annulation", disputed: false, fee: "payee", creditOrigin: null };
  const familyEarly: ReportFacts = { ...familyLate, creditOrigin: "annulation_famille" };
  const professional: ReportFacts = { ...familyLate, side: "professionnelle", creditOrigin: "annulation_professionnelle" };
  const berceo: ReportFacts = { ...familyLate, side: "berceo", creditOrigin: "annulation_berceo" };
  const familyAbsent: ReportFacts = { ...familyLate, kind: "absence" };
  const contested: ReportFacts = { ...familyLate, side: "professionnelle", kind: "absence", disputed: true };

  it("reads the litige filter, « À traiter » by default", () => {
    expect(reportFilter("litige")).toBe("litige");
    expect(reportFilter("tous")).toBe("tous");
    expect(reportFilter(undefined)).toBe("a-traiter");
    expect(reportFilter("autre")).toBe("a-traiter");
  });

  it("puts the family's cancellation in or out of the delay by what was written, not by today's setting", () => {
    expect(delayVerdict(familyEarly)).toBe("dansLeDelai");
    expect(delayVerdict(familyLate)).toBe("horsDelai");
    expect(delayVerdict({ ...familyLate, creditOrigin: "geste_berceo" })).toBe("horsDelai");
    expect(delayVerdict({ ...familyLate, fee: null })).toBeNull();
  });

  it("gives no delay where it does not apply", () => {
    for (const facts of [professional, berceo, familyAbsent, contested]) expect(delayVerdict(facts)).toBeNull();
  });

  it("says what became of the fee", () => {
    expect(reportOutcome(familyEarly)).toBe("credit");
    expect(reportOutcome(familyLate)).toBe("conserves");
    expect(reportOutcome(berceo)).toBe("credit");
    expect(reportOutcome(familyAbsent)).toBe("conserves");
    expect(reportOutcome(contested)).toBe("litige");
    expect(reportOutcome({ ...contested, creditOrigin: "geste_berceo" })).toBe("geste");
    expect(reportOutcome({ ...familyLate, fee: "remboursee" })).toBe("rembourses");
    expect(reportOutcome({ ...professional, creditOrigin: null })).toBe("aRembourser");
    expect(reportOutcome({ ...familyLate, fee: null })).toBe("aucun");
  });

  it("offers a credit on a litige or a fee the family left at Berceo, paid, with no live credit", () => {
    expect(canGrantCredit(familyLate)).toBe(true);
    expect(canGrantCredit(familyAbsent)).toBe(true);
    expect(canGrantCredit(contested)).toBe(true);
    expect(canGrantCredit({ ...contested, side: "famille" })).toBe(true);
  });

  it("offers no credit twice, on a refunded fee, without a fee, or on the professional's or Berceo's side", () => {
    expect(canGrantCredit(familyEarly)).toBe(false);
    expect(canGrantCredit({ ...contested, creditOrigin: "geste_berceo" })).toBe(false);
    expect(canGrantCredit({ ...familyLate, fee: "remboursee" })).toBe(false);
    expect(canGrantCredit({ ...familyLate, fee: null })).toBe(false);
    expect(canGrantCredit({ ...professional, creditOrigin: null })).toBe(false);
    expect(canGrantCredit({ ...berceo, creditOrigin: null })).toBe(false);
  });

  it("holds the founders' note to 1 to 500 characters", () => {
    expect(NOTE_MAX).toBe(500);
    expect(checkReason("", NOTE_MAX)).toEqual({ ok: false, error: "motifRequis" });
    expect(checkReason("x".repeat(NOTE_MAX), NOTE_MAX)).toEqual({ ok: true, value: "x".repeat(500) });
    expect(checkReason("x".repeat(NOTE_MAX + 1), NOTE_MAX)).toEqual({ ok: false, error: "motifLong" });
  });
});
