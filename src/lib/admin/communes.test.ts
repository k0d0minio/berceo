import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { accessFor } from "@/lib/auth/routing";
import { communeOfSlug } from "@/lib/recherche/slugs";

import {
  ADMIN_COMMUNES_PATH,
  COMMUNES_PAGE_SIZE,
  communeRows,
  communeShareUrl,
  matchingCommunes,
  professionalsServing,
} from "./communes";

/*
 * Written from the acceptance criteria of JAM-361: the founders list the
 * communes, see how many validated professionals serve each one, and get the
 * share link of its public page.
 */

const ORIGIN = "https://berceo.example";
const IXELLES = "21009";
const BRUXELLES = "21004";
const none = { everywhere: 0, byCommune: new Map<string, number>() };

describe("only a founder reads the page (D-33)", () => {
  it("answers 404 on /admin/communes to anyone but an admin", () => {
    expect(ADMIN_COMMUNES_PATH).toBe("/admin/communes");
    expect(accessFor("admin", ADMIN_COMMUNES_PATH)).toEqual({ kind: "allow" });
    for (const role of ["parent", "professionnel", null] as const) {
      expect(accessFor(role, ADMIN_COMMUNES_PATH)).toEqual({ kind: "not-found" });
    }
  });

  it("the page calls the guard of the admin pages before it reads, and queries no table itself", () => {
    const page = readFileSync(
      fileURLToPath(new URL("../../app/(portail)/admin/communes/page.tsx", import.meta.url)),
      "utf8",
    );
    const guard = page.indexOf("await requireAccess(ADMIN_COMMUNES_PATH)");
    expect(guard).toBeGreaterThan(-1);
    expect(page.indexOf("await servingCounts()")).toBeGreaterThan(guard);
    expect(page).not.toMatch(/from "@\/db/);
    expect(page).toContain("index: false");
  });
});

describe("the list of communes", () => {
  it("lists the 565 communes on pages of 50 when the search is empty", () => {
    expect(matchingCommunes("")).toHaveLength(565);
    expect(matchingCommunes("   ")).toHaveLength(565);
    const first = communeRows("", 1, none, ORIGIN);
    expect(first.total).toBe(565);
    expect(first.pages).toBe(12);
    expect(first.rows).toHaveLength(COMMUNES_PAGE_SIZE);
    expect(communeRows("", 12, none, ORIGIN).rows).toHaveLength(15);
  });

  it("reads a page after the last one as the last one, and a page before the first as the first", () => {
    expect(communeRows("", 99, none, ORIGIN).page).toBe(12);
    expect(communeRows("", 0, none, ORIGIN).page).toBe(1);
    expect(communeRows("ixelles", 3, none, ORIGIN).page).toBe(1);
  });

  it("gives each commune its name and each of its postcodes", () => {
    const { rows } = communeRows("bruxelles", 1, none, ORIGIN);
    const bruxelles = rows.find((row) => row.ins === BRUXELLES);
    expect(bruxelles?.name).toBe("Bruxelles");
    expect(bruxelles?.postcodes).toEqual(expect.arrayContaining(["1000", "1020", "1120", "1130"]));
  });

  it("a row holds the commune, a count and the link, and no name of a person", () => {
    const { rows } = communeRows("ixelles", 1, none, ORIGIN);
    expect(Object.keys(rows[0]).sort()).toEqual(["ins", "name", "postcodes", "professionals", "shareUrl"]);
  });
});

describe("the search by name or postcode", () => {
  const ins = (q: string) => matchingCommunes(q).map((c) => c.ins);

  it("finds a commune by a part of its name, accents and case ignored", () => {
    expect(ins("ixel")).toContain(IXELLES);
    expect(ins("IXELLES")).toContain(IXELLES);
    expect(ins("liege")).toEqual(ins("Liège"));
    expect(ins("liege").length).toBeGreaterThan(0);
  });

  it("finds a commune by its other official name and by one of its localities", () => {
    expect(ins("elsene")).toContain(IXELLES);
    expect(ins("laken")).toContain(BRUXELLES);
  });

  it("finds each commune of a postcode, and of a postcode prefix", () => {
    expect(ins("1050")).toContain(IXELLES);
    expect(ins("105")).toContain(IXELLES);
    expect(ins("1000")).toEqual([BRUXELLES]);
  });

  it("lists a commune once, and nothing for a search that names none", () => {
    const found = ins("10");
    expect(new Set(found).size).toBe(found.length);
    expect(ins("zzzz")).toEqual([]);
    expect(communeRows("zzzz", 1, none, ORIGIN)).toMatchObject({ rows: [], pages: 1, total: 0 });
  });
});

describe("the number of validated professionals (the rule of the search)", () => {
  const counts = { everywhere: 2, byCommune: new Map([[IXELLES, 3]]) };

  it("adds « Toute la Belgique » to the reach of the commune", () => {
    expect(professionalsServing(counts, IXELLES)).toBe(5);
    expect(professionalsServing(counts, BRUXELLES)).toBe(2);
    expect(professionalsServing(none, IXELLES)).toBe(0);
  });

  it("puts the communes with the most professionals first, then the names in French order", () => {
    const { rows } = communeRows("", 1, counts, ORIGIN);
    expect(rows[0]).toMatchObject({ ins: IXELLES, professionals: 5 });
    const rest = rows.slice(1);
    expect(rest.every((row) => row.professionals === 2)).toBe(true);
    const names = rest.map((row) => row.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" })));
  });

  it("keeps the same order inside a search", () => {
    const { rows } = communeRows("10", 1, counts, ORIGIN);
    expect(rows[0].ins).toBe(IXELLES);
  });
});

describe("the share link", () => {
  it("is the origin of the site and the path of the public page", () => {
    expect(communeShareUrl(ORIGIN, IXELLES)).toBe("https://berceo.example/garde-de-nuit/ixelles");
    expect(communeShareUrl("https://uat.berceo.example/", IXELLES)).toBe(
      "https://uat.berceo.example/garde-de-nuit/ixelles",
    );
  });

  it("is null for a code that names no commune", () => {
    expect(communeShareUrl(ORIGIN, "00000")).toBeNull();
    expect(communeShareUrl(ORIGIN, "constructor")).toBeNull();
  });

  it("names a page that exists, for each of the 565 communes", () => {
    for (let page = 1; page <= 12; page += 1) {
      for (const row of communeRows("", page, none, ORIGIN).rows) {
        const url = new URL(row.shareUrl);
        expect(url.origin).toBe(ORIGIN);
        expect(communeOfSlug(url.pathname.replace("/garde-de-nuit/", ""))).toBe(row.ins);
      }
    }
  });
});
