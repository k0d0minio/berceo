import { describe, expect, it } from "vitest";

import { COMMUNES, LOCALITIES } from "./data";
import {
  communeName,
  findLocality,
  localityLabel,
  localityValue,
  parseLocalityValue,
  searchLocalities,
} from "./index";

const labels = (query: string) => searchLocalities(query, 50).map(localityLabel);

describe("the commune reference", () => {
  it("finds a locality by postcode prefix", () => {
    expect(labels("105")).toContain("1050 Ixelles");
  });

  it("finds a locality by part of its name, accents and case ignored", () => {
    expect(labels("ixel")).toContain("1050 Ixelles");
    expect(labels("IXEL")).toContain("1050 Ixelles");
    expect(labels("liege")).toContain("4000 Liège");
  });

  it("finds a locality by its other official name", () => {
    expect(labels("elsene")).toContain("1050 Ixelles");
  });

  it("returns nothing for an empty query", () => {
    expect(searchLocalities("   ")).toEqual([]);
  });

  it("looks a locality up by postcode and name, with its commune's INS code", () => {
    expect(findLocality("1050", "Ixelles")).toEqual({
      postcode: "1050",
      locality: "Ixelles",
      ins: "21009",
      commune: "Ixelles",
    });
    expect(findLocality("1050", "Nowhere")).toBeNull();
  });

  it.each([
    ["Brussels", "1050", "Ixelles", "21009"],
    ["Wallonia", "4000", "Liège", "62063"],
    ["Flanders", "2800", "Malines", "12025"],
  ])("carries the right INS code in %s", (_region, postcode, locality, ins) => {
    expect(findLocality(postcode, locality)?.ins).toBe(ins);
  });

  it("places a locality in its 2025 merged commune", () => {
    const melle = findLocality("9090", "Melle");
    expect(melle?.ins).toBe("44088");
    expect(melle?.commune).toBe("Merelbeke-Melle");
  });

  it("round-trips the form value and refuses one that names no entry", () => {
    const ixelles = findLocality("1050", "Ixelles")!;
    expect(parseLocalityValue(localityValue(ixelles))).toEqual(ixelles);
    expect(parseLocalityValue("1050|Bruxelles-sur-Mer")).toBeNull();
    expect(parseLocalityValue("Ixelles")).toBeNull();
  });

  it("names a commune by its code", () => {
    expect(communeName("21009")).toBe("Ixelles");
    expect(communeName("99999")).toBeNull();
  });

  it("points every locality at a known commune", () => {
    for (const [, , ins] of LOCALITIES) expect(COMMUNES[ins]).toBeDefined();
    expect(Object.keys(COMMUNES)).toHaveLength(565);
  });
});
