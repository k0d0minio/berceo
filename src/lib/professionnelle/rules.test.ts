import { describe, expect, it } from "vitest";

import {
  DECLARATIONS,
  DECLARATIONS_VERSION,
  REQUIREMENTS,
  areDocumentsComplete,
  canOpenStep,
  canReadFile,
  canSubmit,
  changeNeedsReview,
  checkProfile,
  checkUpload,
  firstIncompleteStep,
  missingDocuments,
  missingProfile,
  normalizeInami,
  parseRate,
  reopenedStatus,
  uploadMatches,
  type FileState,
  type ProfileInput,
} from "./rules";

/*
 * Written from the spec's acceptance criteria (onboarding-professionnelle),
 * not from the implementation.
 */

const known = new Set(["21009", "11002", "62063"]);
const context = {
  studentsAdmitted: false,
  currentProfession: null,
  isKnownCommune: (nis: string) => known.has(nis),
};

const blank: ProfileInput = {
  profession: "",
  specialisations: [],
  communes: [],
  tarif: "",
  experience: "",
  bio: "",
};

const complete: FileState = {
  status: "brouillon",
  draft: {
    profession: "sage_femme",
    specialisations: [],
    communes: ["21009"],
    nightRateEur: 150,
    experience: "un_a_trois_ans",
    bio: "Sage-femme en maternité depuis trois ans.",
  },
  inamiNumber: "12345678901",
  files: { photo: 1, diplome: 1 },
};

const bytes = (...b: number[]) => Uint8Array.from([...b, ...new Array(16).fill(0)]);
const PDF = bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31);
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const WEBP = bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50);
const EXE = bytes(0x4d, 0x5a, 0x90, 0x00);

describe("the night rate (D-4)", () => {
  it("accepts whole euros from 100 to 300", () => {
    expect(parseRate("100")).toEqual({ ok: true, value: 100 });
    expect(parseRate(" 300 ")).toEqual({ ok: true, value: 300 });
    expect(parseRate("150,00")).toEqual({ ok: true, value: 150 });
  });

  it("refuses below 100, above 300 and anything not a whole number", () => {
    for (const raw of ["99", "301", "0", "-150", "150,5", "150.25", "abc", "1e2"]) {
      expect(parseRate(raw).ok, raw).toBe(false);
    }
  });

  it("is refused by the form's check with a message on the rate", () => {
    expect(checkProfile({ ...blank, tarif: "99" }, context).errors.tarif).toBe("tarif");
    expect(checkProfile({ ...blank, tarif: "301" }, context).errors.tarif).toBe("tarif");
  });
});

describe("step 2", () => {
  it("refuses to continue without a profession, a commune, a rate, an experience, a bio and a photo", () => {
    const { values } = checkProfile(blank, context);
    expect(missingProfile(values, false)).toEqual({
      profession: "requis",
      communes: "communesMin",
      tarif: "requis",
      experience: "requis",
      bio: "requis",
      photo: "photo",
    });
  });

  it("lets spécialisations stay empty", () => {
    expect(missingProfile(complete.draft, true)).toEqual({});
  });

  it("keeps every valid answer when another is wrong, so a partial save loses nothing", () => {
    const { values, errors } = checkProfile(
      { ...blank, profession: "puericultrice", communes: ["21009"], tarif: "999" },
      context,
    );
    expect(values.profession).toBe("puericultrice");
    expect(values.communes).toEqual(["21009"]);
    expect(values.nightRateEur).toBeNull();
    expect(errors).toEqual({ tarif: "tarif" });
  });

  it("refuses a bio over 500 characters", () => {
    expect(checkProfile({ ...blank, bio: "a".repeat(501) }, context).errors.bio).toBe("bioLongue");
    expect(checkProfile({ ...blank, bio: "a".repeat(500) }, context).errors.bio).toBeUndefined();
  });

  it("accepts one to fifty known communes, stored as NIS codes", () => {
    expect(checkProfile({ ...blank, communes: ["21009", "11002"] }, context).values.communes).toEqual([
      "21009",
      "11002",
    ]);
    expect(checkProfile({ ...blank, communes: ["Ixelles"] }, context).errors.communes).toBe("commune");
    const many = Array.from({ length: 51 }, (_, i) => String(10000 + i));
    const all = { ...context, isKnownCommune: () => true };
    expect(checkProfile({ ...blank, communes: many }, all).errors.communes).toBe("communesMax");
    expect(checkProfile({ ...blank, communes: many.slice(0, 50) }, all).errors.communes).toBeUndefined();
  });

  it("refuses a spécialisation that is not on the list", () => {
    expect(checkProfile({ ...blank, specialisations: ["magie"] }, context).errors.specialisations).toBe(
      "specialisation",
    );
  });
});

describe("the students switch (D-7)", () => {
  const student = { ...blank, profession: "etudiante_sage_femme" };

  it("refuses the student option while the switch is off", () => {
    expect(checkProfile(student, context).errors.profession).toBe("etudiantesFermees");
  });

  it("accepts it while the switch is on", () => {
    const on = { ...context, studentsAdmitted: true };
    expect(checkProfile(student, on).values.profession).toBe("etudiante_sage_femme");
  });

  it("lets a file that already carries it keep it when the switch goes off", () => {
    const carrying = { ...context, currentProfession: "etudiante_sage_femme" as const };
    expect(checkProfile(student, carrying).values.profession).toBe("etudiante_sage_femme");
  });
});

describe("step 3", () => {
  it("asks each profession for exactly its documents, and the INAMI number where it applies", () => {
    expect(REQUIREMENTS.sage_femme).toEqual({ documents: ["diplome"], inami: true });
    expect(REQUIREMENTS.infirmiere_neonatologie).toEqual({ documents: ["diplome"], inami: true });
    expect(REQUIREMENTS.puericultrice).toEqual({ documents: ["diplome"], inami: false });
    expect(REQUIREMENTS.etudiante_sage_femme).toEqual({
      documents: ["attestation_inscription"],
      inami: false,
    });
  });

  it("refuses to continue while a document or the INAMI number is missing", () => {
    expect(missingDocuments({ ...complete, files: { photo: 1 } })).toEqual({ diplome: "document" });
    expect(missingDocuments({ ...complete, inamiNumber: null })).toEqual({ inami: "inami" });
    expect(areDocumentsComplete(complete)).toBe(true);
    const puericultrice = { ...complete, draft: { ...complete.draft, profession: "puericultrice" as const } };
    expect(areDocumentsComplete({ ...puericultrice, inamiNumber: null })).toBe(true);
  });

  it("normalises the INAMI number to eleven digits", () => {
    expect(normalizeInami("1-23456-78-901")).toBe("12345678901");
    expect(normalizeInami("123 456 789 01")).toBe("12345678901");
    expect(normalizeInami("1234567890")).toBeNull();
    expect(normalizeInami("1234567890a")).toBeNull();
  });

  it("refuses a document over 10 MB or not PDF, JPEG, PNG or WebP", () => {
    const ctx = { profession: "sage_femme" as const, existing: 0 };
    expect(checkUpload("diplome", "application/pdf", 10 * 1024 * 1024, ctx)).toBeNull();
    expect(checkUpload("diplome", "application/pdf", 10 * 1024 * 1024 + 1, ctx)).toBe("taille");
    expect(checkUpload("diplome", "image/gif", 1000, ctx)).toBe("type");
    expect(checkUpload("diplome", "application/x-msdownload", 1000, ctx)).toBe("type");
  });

  it("refuses a photo over 5 MB or not JPEG, PNG or WebP", () => {
    const ctx = { profession: null, existing: 0 };
    expect(checkUpload("photo", "image/webp", 5 * 1024 * 1024, ctx)).toBeNull();
    expect(checkUpload("photo", "image/jpeg", 5 * 1024 * 1024 + 1, ctx)).toBe("taille");
    expect(checkUpload("photo", "application/pdf", 1000, ctx)).toBe("type");
  });

  it("takes one to three files per document, and only the documents of her profession", () => {
    expect(checkUpload("diplome", "image/png", 1000, { profession: "sage_femme", existing: 3 })).toBe("nombre");
    expect(
      checkUpload("attestation_inscription", "image/png", 1000, { profession: "sage_femme", existing: 0 }),
    ).toBe("genre");
  });

  it("rejects an upload whose content does not match its declared type", () => {
    expect(uploadMatches("diplome", "application/pdf", 1000, PDF)).toBe(true);
    expect(uploadMatches("diplome", "image/jpeg", 1000, JPEG)).toBe(true);
    expect(uploadMatches("photo", "image/png", 1000, PNG)).toBe(true);
    expect(uploadMatches("photo", "image/webp", 1000, WEBP)).toBe(true);
    // A renamed executable.
    expect(uploadMatches("diplome", "application/pdf", 1000, EXE)).toBe(false);
    expect(uploadMatches("diplome", "image/png", 1000, JPEG)).toBe(false);
    expect(uploadMatches("photo", "image/jpeg", 6 * 1024 * 1024, JPEG)).toBe(false);
  });
});

describe("the steps", () => {
  it("sends a draft to the first incomplete step", () => {
    const empty: FileState = {
      status: "brouillon",
      draft: { ...complete.draft, profession: null },
      inamiNumber: null,
      files: {},
    };
    expect(firstIncompleteStep(empty)).toBe("profil");
    expect(firstIncompleteStep({ ...complete, files: { photo: 1 } })).toBe("justificatifs");
    expect(firstIncompleteStep(complete)).toBe("declarations");
  });

  it("opens a later step only once the earlier ones are complete", () => {
    const atProfile = { ...complete, files: {} };
    expect(canOpenStep(atProfile, "profil")).toBe(true);
    expect(canOpenStep(atProfile, "justificatifs")).toBe(false);
    expect(canOpenStep(atProfile, "declarations")).toBe(false);
    expect(canOpenStep(complete, "profil")).toBe(true);
    expect(canOpenStep(complete, "declarations")).toBe(true);
  });
});

describe("step 4 and the states", () => {
  it("submits only with all five declarations ticked", () => {
    expect(DECLARATIONS).toHaveLength(5);
    expect(DECLARATIONS_VERSION).toBe("cdc-2026-08-02");
    expect(canSubmit(complete, DECLARATIONS)).toBe(true);
    expect(canSubmit(complete, DECLARATIONS.slice(0, 4))).toBe(false);
    expect(canSubmit({ ...complete, files: { photo: 1 } }, DECLARATIONS)).toBe(false);
    expect(canSubmit({ ...complete, status: "en_attente" }, DECLARATIONS)).toBe(false);
  });

  it("keeps a waiting file waiting whatever she edits", () => {
    for (const change of ["profession", "documents", "details"] as const) {
      expect(changeNeedsReview("en_attente", change)).toBe(false);
    }
    expect(reopenedStatus("en_attente")).toBe("en_attente");
  });

  it("sends a validated file back to review on a new profession or any document change", () => {
    expect(changeNeedsReview("valide", "profession")).toBe(true);
    expect(changeNeedsReview("valide", "documents")).toBe(true);
    // Rate, zone, spécialisations, experience, bio and photo apply at once.
    expect(changeNeedsReview("valide", "details")).toBe(false);
    // Reopened, she resubmits through step 4, which appends five new declarations.
    expect(reopenedStatus("valide")).toBe("brouillon");
    expect(canSubmit({ ...complete, status: reopenedStatus("valide") }, DECLARATIONS)).toBe(true);
  });
});

describe("who reads a file", () => {
  const owner = "user-1";

  it("lets its owner and an admin read it", () => {
    expect(canReadFile(owner, { id: owner, role: "professionnel" })).toBe(true);
    expect(canReadFile(owner, { id: "admin-1", role: "admin" })).toBe(true);
  });

  it("refuses a signed-out visitor, a parent and another professional", () => {
    expect(canReadFile(owner, null)).toBe(false);
    expect(canReadFile(owner, { id: "parent-1", role: "parent" })).toBe(false);
    expect(canReadFile(owner, { id: "user-2", role: "professionnel" })).toBe(false);
  });
});
