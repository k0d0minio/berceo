import { describe, expect, it } from "vitest";

import {
  ANONYMISED,
  anonymisedEmail,
  bookingFilter,
  checkContact,
  confirmsLastName,
  contactParagraphs,
  contactRefusal,
  deleteRefusal,
  foldText,
  reactivateRefusal,
  recentPaymentCutoff,
  reportFilter,
  requestFilter,
  searchTerms,
  suspendRefusal,
  type AccountFacts,
} from "./rules";

/*
 * Written from back-office-admin's acceptance criteria and decisions
 * (D-133 to D-139), not from the implementation.
 */

const at = new Date("2026-10-01T10:00:00Z");
const family: AccountFacts = { role: "parent", suspendedAt: null, deletedAt: null };
const suspended: AccountFacts = { ...family, suspendedAt: at };
const deleted: AccountFacts = { ...suspended, deletedAt: at };
const founder: AccountFacts = { role: "admin", suspendedAt: null, deletedAt: null };

describe("the search finds an account by name, e-mail or phone in any notation", () => {
  it("folds case and accents, so Zoé, zoe and ZOË find one another", () => {
    expect(foldText("Zoé")).toBe("zoe");
    expect(foldText("ZOË")).toBe("zoe");
    expect(foldText("  Anne   Dupré ")).toBe("anne dupre");
  });

  it("finds the same phone number from its three notations", () => {
    const digits = ["0470 12 34 56", "+32470123456", "470123456"].map((q) => searchTerms(q)?.digits);
    for (const d of digits) expect("32470123456").toContain(d);
    expect(searchTerms("0032 470 12 34 56")?.digits).toBe("32470123456");
  });

  it("searches no phone on fewer than four digits, and nothing on an empty box", () => {
    expect(searchTerms("Anne")?.digits).toBeNull();
    expect(searchTerms("047")?.digits).toBeNull();
    expect(searchTerms("0470")?.digits).toBe("470");
    expect(searchTerms("   ")).toBeNull();
    expect(searchTerms(undefined)).toBeNull();
  });

  it("keeps an e-mail whole", () => {
    expect(searchTerms("Anne.Dupre@Exemple.be")?.text).toBe("anne.dupre@exemple.be");
  });
});

describe("who can be suspended, reactivated, deleted or written to", () => {
  it("never acts on an admin account", () => {
    expect(suspendRefusal(founder)).toBe("admin");
    expect(reactivateRefusal(founder)).toBe("admin");
    expect(deleteRefusal(founder, 0)).toBe("admin");
    expect(contactRefusal(founder)).toBe("admin");
  });

  it("suspends an active account once, and reactivates only a suspended one", () => {
    expect(suspendRefusal(family)).toBeNull();
    expect(suspendRefusal(suspended)).toBe("dejaSuspendu");
    expect(reactivateRefusal(family)).toBe("nonSuspendu");
    expect(reactivateRefusal(suspended)).toBeNull();
  });

  it("refuses deletion on an active account and on one with a garde to come (D-136)", () => {
    expect(deleteRefusal(family, 0)).toBe("nonSuspendu");
    expect(deleteRefusal(suspended, 1)).toBe("gardesAVenir");
    expect(deleteRefusal(suspended, 0)).toBeNull();
  });

  it("does nothing more to a deleted account", () => {
    expect(suspendRefusal(deleted)).toBe("supprime");
    expect(reactivateRefusal(deleted)).toBe("supprime");
    expect(deleteRefusal(deleted, 0)).toBe("supprime");
    expect(contactRefusal(deleted)).toBe("supprime");
  });

  it("writes to an active or a suspended account (D-138)", () => {
    expect(contactRefusal(family)).toBeNull();
    expect(contactRefusal(suspended)).toBeNull();
  });

  it("confirms a deletion only with her last name typed, case and accents aside", () => {
    expect(confirmsLastName("dupre", "Dupré")).toBe(true);
    expect(confirmsLastName(" DUPRÉ ", "Dupré")).toBe(true);
    expect(confirmsLastName("Dupont", "Dupré")).toBe(false);
    expect(confirmsLastName("", "")).toBe(false);
    expect(confirmsLastName(undefined, "Dupré")).toBe(false);
  });
});

describe("a deleted account (D-137)", () => {
  it("is called « Compte supprimé »", () => {
    expect(`${ANONYMISED.firstName} ${ANONYMISED.lastName}`).toBe("Compte supprimé");
  });

  it("keeps a unique address nobody can receive mail at", () => {
    const id = "3F0C9A52-1111-4222-8333-444455556666";
    expect(anonymisedEmail(id)).toBe("supprime-3f0c9a52-1111-4222-8333-444455556666@invalid");
    expect(anonymisedEmail(id)).not.toBe(anonymisedEmail("3f0c9a52-1111-4222-8333-444455556667"));
  });
});

describe("the contact e-mail (D-138)", () => {
  it("needs a subject and a message, trimmed, within their lengths", () => {
    expect(checkContact({ subject: "  ", message: "" })).toEqual({
      ok: false,
      errors: { subject: "objetRequis", message: "messageRequis" },
    });
    expect(checkContact({ subject: "x".repeat(151), message: "y".repeat(5001) })).toEqual({
      ok: false,
      errors: { subject: "objetLong", message: "messageLong" },
    });
    expect(checkContact({ subject: " Votre garde \n du 12 ", message: " Bonjour \r\n" })).toEqual({
      ok: true,
      value: { subject: "Votre garde du 12", message: "Bonjour" },
    });
  });

  it("splits the message into paragraphs on blank lines", () => {
    expect(contactParagraphs("Premier.\nSuite.\n\n\nSecond.")).toEqual(["Premier.\nSuite.", "Second."]);
  });
});

describe("the overview's filters (D-133, D-139)", () => {
  it("counts the payments of the last 7 days", () => {
    expect(recentPaymentCutoff(at).toISOString()).toBe("2026-09-24T10:00:00.000Z");
  });

  it("reads only the filters it knows", () => {
    expect(bookingFilter("en-cours")).toBe("en-cours");
    expect(bookingFilter("autre")).toBeNull();
    expect(requestFilter("passee")).toBe("passee");
    expect(requestFilter(undefined)).toBeNull();
    expect(reportFilter(undefined)).toBe("a-traiter");
    expect(reportFilter("tous")).toBe("tous");
  });
});
