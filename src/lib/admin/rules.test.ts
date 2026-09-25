import { describe, expect, it } from "vitest";

import {
  DECISION_ACTION,
  DECISION_STATUS,
  REASON_MAX,
  byOldestSubmission,
  checkReason,
  isHeldStudent,
  isPurgeDue,
  isReviewable,
  journalPage,
  needsReason,
  purgeCutoff,
  queueStatus,
  refuseDecision,
  type ReviewFile,
} from "./rules";

/*
 * Written from the spec's acceptance criteria (verification-back-office), not
 * from the implementation.
 */

const waiting: ReviewFile = { status: "en_attente", profession: "sage_femme", reviewReason: null };
const student: ReviewFile = { ...waiting, profession: "etudiante_sage_femme" };

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
  it("holds a waiting student file while the switch is off", () => {
    expect(isHeldStudent(student, false)).toBe(true);
    expect(queueStatus(student, false)).toBe("etudiantes");
    expect(refuseDecision("valider", student, false)).toBe("etudiantes");
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
