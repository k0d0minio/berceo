import { describe, expect, it } from "vitest";

import { COMMUNES, communeByNis, isKnownCommune, searchCommunes } from "./index";

/*
 * Spec: the committed register holds every current commune (565 since the
 * 1 January 2025 mergers) with its NIS code, French name, Dutch name where
 * different and postcodes; the picker finds a commune by its French name, its
 * Dutch name or a postcode.
 */
describe("the commune register", () => {
  it("holds the 565 communes of 2025, each NIS code once", () => {
    expect(COMMUNES).toHaveLength(565);
    expect(new Set(COMMUNES.map((c) => c.nis)).size).toBe(565);
  });

  it("gives every commune a five-digit NIS code, a French name and at least one postcode", () => {
    for (const commune of COMMUNES) {
      expect(commune.nis).toMatch(/^\d{5}$/);
      expect(commune.fr.length).toBeGreaterThan(0);
      expect(commune.postcodes.length).toBeGreaterThan(0);
      for (const postcode of commune.postcodes) expect(postcode).toMatch(/^\d{4}$/);
      if (commune.nl !== undefined) expect(commune.nl).not.toBe(commune.fr);
    }
  });

  it("carries the 2025 mergers, not the communes they replaced", () => {
    expect(communeByNis("46030")?.fr).toBe("Beveren-Kruibeke-Zwijndrecht");
    expect(communeByNis("82039")?.fr).toBe("Bastogne");
    // Bertogne (82005) merged into Bastogne.
    expect(isKnownCommune("82005")).toBe(false);
  });
});

describe("searchCommunes", () => {
  const nis = (query: string) => searchCommunes(query).map((c) => c.nis);

  it("finds a commune by its French name, accents and case aside", () => {
    expect(nis("liege")).toContain("62063");
    expect(nis("Anvers")[0]).toBe("11002");
  });

  it("finds a commune by its Dutch name", () => {
    expect(nis("Antwerpen")).toContain("11002");
    expect(nis("Elsene")).toContain("21009");
  });

  it("finds a commune by a postcode or its first digits", () => {
    expect(nis("1050")).toContain("21009");
    expect(nis("2400")).toContain("13025");
    expect(searchCommunes("105").length).toBeGreaterThan(0);
  });

  it("answers nothing to an empty query", () => {
    expect(searchCommunes("  ")).toEqual([]);
  });
});
