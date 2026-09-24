import { describe, expect, it } from "vitest";

import { COMMUNES } from "./data";
import { communeName, isKnownCommune, postcodesOf, searchCommunes } from "./index";

/*
 * Spec (onboarding-professionnelle): the zone picker finds a commune by its
 * French name, its Dutch name or a postcode, and stores REFNIS codes only;
 * the register holds every current commune.
 */
const codes = (query: string) => searchCommunes(query).map((c) => c.ins);

describe("the communes of a zone", () => {
  it("holds the 565 communes of 2025, each code once", () => {
    expect(Object.keys(COMMUNES)).toHaveLength(565);
  });

  it("finds a commune by its French name, accents and case aside", () => {
    expect(codes("liege")).toContain("62063");
    expect(codes("Anvers")[0]).toBe("11002");
  });

  it("finds a commune by its Dutch name", () => {
    expect(codes("Antwerpen")).toContain("11002");
    expect(codes("Elsene")).toContain("21009");
  });

  it("finds a commune by a postcode or its first digits", () => {
    expect(codes("1050")).toContain("21009");
    expect(codes("2400")).toContain("13025");
  });

  it("lists each commune once, with all its postcodes", () => {
    const found = searchCommunes("bruxelles");
    expect(new Set(found.map((c) => c.ins)).size).toBe(found.length);
    expect(postcodesOf("21004")).toEqual(expect.arrayContaining(["1000", "1020", "1120", "1130"]));
  });

  it("knows current codes and refuses others", () => {
    expect(isKnownCommune("21009")).toBe(true);
    expect(communeName("21009")).toBe("Ixelles");
    expect(isKnownCommune("Ixelles")).toBe(false);
    expect(isKnownCommune("00000")).toBe(false);
  });
});
