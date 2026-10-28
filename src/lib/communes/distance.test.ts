import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CENTRES } from "./centres";
import { COMMUNES } from "./data";
import { communesWithin, distanceKm } from "./distance";

/*
 * Spec (communes-centres): every commune carries its official centre from
 * NGI-IGN AdminVector, and the radius of a zone reaches the communes whose
 * centre is within that distance of the centre of one of hers.
 */
const IXELLES = "21009";
const ETTERBEEK = "21005";
const ANVERS = "11002";
const LIEGE = "62063";

/** The distance, NaN for a code with no centre, so a missing centre fails the bound. */
const km = (a: string, b: string) => distanceKm(a, b) ?? Number.NaN;

describe("the centres of the communes", () => {
  it("holds one centre for each of the 565 communes, and no other code", () => {
    expect(Object.keys(CENTRES)).toHaveLength(565);
    expect(Object.keys(CENTRES).sort()).toEqual(Object.keys(COMMUNES).sort());
  });

  it("places every centre inside Belgium", () => {
    for (const [lat, lon] of Object.values(CENTRES)) {
      expect(lat).toBeGreaterThan(49.4);
      expect(lat).toBeLessThan(51.6);
      expect(lon).toBeGreaterThan(2.5);
      expect(lon).toBeLessThan(6.5);
    }
  });
});

describe("the distance between two communes", () => {
  it("measures the straight line between their centres", () => {
    // A tolerance of 0.5 km.
    expect(Math.abs(km(IXELLES, ETTERBEEK) - 1.6)).toBeLessThan(0.5);
    expect(Math.abs(km(IXELLES, ANVERS) - 43.3)).toBeLessThan(0.5);
    expect(Math.abs(km(IXELLES, LIEGE) - 87.5)).toBeLessThan(0.5);
  });

  it("is null for a code with no centre", () => {
    expect(distanceKm(IXELLES, "99999")).toBeNull();
    expect(distanceKm("constructor", IXELLES)).toBeNull();
  });
});

describe("the communes within a distance", () => {
  it("gives her own communes at 0 km", () => {
    expect(communesWithin([IXELLES], 0)).toEqual([IXELLES]);
  });

  it("reaches a commune whose centre is within the distance, and not one beyond it", () => {
    const reached = communesWithin([IXELLES], 50);
    expect(reached).toContain(ETTERBEEK);
    expect(reached).toContain(ANVERS);
    expect(reached).not.toContain(LIEGE);
  });

  it("joins the reach of each of her communes, each code once and sorted", () => {
    const reached = communesWithin([IXELLES, LIEGE], 10);
    expect(reached).toContain(ETTERBEEK);
    expect(reached).toContain(LIEGE);
    expect(new Set(reached).size).toBe(reached.length);
    expect(reached).toEqual([...reached].sort());
  });

  it("reaches every commune at Infinity", () => {
    expect(communesWithin([IXELLES], Infinity)).toHaveLength(565);
  });

  it("keeps a code with no centre, which reaches nothing", () => {
    expect(communesWithin(["99999"], 50)).toEqual(["99999"]);
  });

  it("refuses a negative or non-numeric distance", () => {
    expect(() => communesWithin([IXELLES], -1)).toThrow(RangeError);
    expect(() => communesWithin([IXELLES], Number.NaN)).toThrow(RangeError);
  });
});

/*
 * The centres are server-only: no client component imports them, so the
 * browser bundle does not grow. `server-only` also fails the build on an
 * indirect import.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const USE_CLIENT = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/;
const IMPORTS_CENTRES = /["'](?:[^"']*\/communes|\.)\/(?:centres|distance)["']/;

describe("the centres in the browser", () => {
  it("are imported by no client component", () => {
    const importers = files(src)
      .filter((path) => {
        const text = readFileSync(path, "utf8");
        return USE_CLIENT.test(text) && IMPORTS_CENTRES.test(text);
      })
      .map((path) => relative(src, path));
    expect(importers).toEqual([]);
  });
});
