import { describe, expect, it } from "vitest";

import { reachOf } from "./reach";

/*
 * Spec (profil-zone-rayon-saisie): each save of her zone stores the communes
 * her radius reaches. At 0 km they are her communes. « Toute la Belgique »
 * stores none, because her profile carries the flag.
 */
const IXELLES = "21009";
const ETTERBEEK = "21005";
const ANVERS = "11002";
const LIEGE = "62063";

describe("the communes her zone reaches", () => {
  it("equals her communes at 0 km", () => {
    expect(reachOf([LIEGE, IXELLES], { radiusKm: 0, wholeBelgium: false })).toEqual([IXELLES, LIEGE]);
  });

  it("adds every commune within her radius, her own included", () => {
    const reach = reachOf([IXELLES], { radiusKm: 10, wholeBelgium: false });
    expect(reach).toContain(IXELLES);
    expect(reach).toContain(ETTERBEEK);
    expect(reach).not.toContain(ANVERS);
    expect(reachOf([IXELLES], { radiusKm: 50, wholeBelgium: false })).toContain(ANVERS);
  });

  it("stores no commune for « Toute la Belgique »", () => {
    expect(reachOf([IXELLES], { radiusKm: 0, wholeBelgium: true })).toEqual([]);
  });

  it("reaches nothing while she has no commune", () => {
    expect(reachOf([], { radiusKm: 50, wholeBelgium: false })).toEqual([]);
  });
});
