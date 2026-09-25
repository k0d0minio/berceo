import { describe, expect, it } from "vitest";

import { returnToStore, verifiedLanding } from "./retour";
import { FAMILY_SIGN_UP_PATH, SIGN_IN_PATH, withReturn } from "./routing";

/**
 * Spec (recherche-et-fiches-publiques, D-129): the way back from a full
 * profile survives sign-in ↔ sign-up and the e-mail confirmation, for a family
 * only, and a way back outside a space is dropped at every step.
 */

const PROFILE = "/espace/famille/professionnelles/3f0c9a52-6f2e-4a8b-9d7e-1c2b3a4d5e6f";
const BAD = ["//evil.example", "https://evil.example", "/professionnelles/emma-3f0c9a52", "\\\\evil", ""];

describe("the account pages' links carry the way back", () => {
  it("from sign-in to family sign-up and back", () => {
    const encoded = encodeURIComponent(PROFILE);
    expect(withReturn(FAMILY_SIGN_UP_PATH, PROFILE)).toBe(`/inscription-famille?retour=${encoded}`);
    expect(withReturn(SIGN_IN_PATH, PROFILE)).toBe(`/connexion?retour=${encoded}`);
  });

  it("drops a way back outside a space", () => {
    for (const bad of BAD) expect(withReturn(FAMILY_SIGN_UP_PATH, bad)).toBe(FAMILY_SIGN_UP_PATH);
    expect(withReturn(SIGN_IN_PATH, null)).toBe(SIGN_IN_PATH);
  });
});

describe("the cookie sign-up sets", () => {
  it("holds a family's accepted way back", () => {
    expect(returnToStore("parent", PROFILE)).toBe(PROFILE);
  });

  it("is never set for a professional, nor for a way back outside a space", () => {
    expect(returnToStore("professionnel", PROFILE)).toBeNull();
    for (const bad of BAD) expect(returnToStore("parent", bad)).toBeNull();
  });
});

describe("where a verified user lands", () => {
  it("a family: her way back, else her space", () => {
    expect(verifiedLanding("parent", PROFILE)).toBe(PROFILE);
    expect(verifiedLanding("parent", undefined)).toBe("/espace/famille");
    for (const bad of BAD) expect(verifiedLanding("parent", bad)).toBe("/espace/famille");
  });

  it("a family whose way back leads into another space: her own", () => {
    expect(verifiedLanding("parent", "/espace/professionnelle/gardes")).toBe("/espace/famille");
  });

  it("a professional: always her space", () => {
    expect(verifiedLanding("professionnel", PROFILE)).toBe("/espace/professionnelle");
  });
});
