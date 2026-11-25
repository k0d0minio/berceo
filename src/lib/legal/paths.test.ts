import { describe, expect, it } from "vitest";

import { common } from "@/content/common";
import { words } from "@/content/locale";
import { accessFor } from "@/lib/auth/routing";

import { LEGAL_SLUGS, legalPath } from "./paths";

const pages = words(common).pages;

describe("legalPath (JAM-582)", () => {
  it("keeps a family and a professional inside their own space", () => {
    expect(legalPath("parent", "conditionsGenerales")).toBe("/espace/famille/conditions-generales");
    expect(legalPath("parent", "confidentialite")).toBe("/espace/famille/confidentialite");
    expect(legalPath("professionnel", "conditionsGenerales")).toBe(
      "/espace/professionnelle/conditions-generales",
    );
    expect(legalPath("professionnel", "confidentialite")).toBe("/espace/professionnelle/confidentialite");
  });

  it("opens to the role it belongs to", () => {
    for (const page of ["conditionsGenerales", "confidentialite"] as const) {
      expect(accessFor("parent", legalPath("parent", page))).toEqual({ kind: "allow" });
      expect(accessFor("professionnel", legalPath("professionnel", page))).toEqual({ kind: "allow" });
    }
  });

  it("gives a founder the public pages of the catalogue", () => {
    expect(legalPath("admin", "conditionsGenerales")).toBe(pages.conditionsGenerales.href);
    expect(legalPath("admin", "confidentialite")).toBe(pages.confidentialite.href);
  });

  it("uses the public pages' last segment", () => {
    expect(`/${LEGAL_SLUGS.conditionsGenerales}`).toBe(pages.conditionsGenerales.href);
    expect(`/${LEGAL_SLUGS.confidentialite}`).toBe(pages.confidentialite.href);
  });
});
