import { describe, expect, it } from "vitest";

import { communeName, communesOfPostcode } from "@/lib/communes";
import { LOCALITIES } from "@/lib/communes/data";

import {
  communeMeta,
  communesOfParams,
  compareProfessionals,
  metaZone,
  orderProfessionals,
  professionalMeta,
  resolveQuery,
  searchQuery,
  zoneLine,
  zoneNames,
} from "./rules";

/**
 * Spec (recherche-et-fiches-publiques): what a query resolves to (D-11), the
 * order of the results (D-123), the zone line, and the guide's title and meta
 * patterns for the public pages. Written from the acceptance criteria.
 */

describe("a query resolves to communes (D-11)", () => {
  it("a locality picked from the list names its commune", () => {
    expect(resolveQuery("1050|Ixelles")).toEqual({ kind: "communes", ins: ["21009"] });
  });

  it("a typed postcode names every commune it covers, once each", () => {
    // Today every Belgian postcode lies in one commune; the rule holds for any list the data gives.
    const postcodes = [...new Set(LOCALITIES.map(([postcode]) => postcode))];
    for (const postcode of postcodes) {
      const resolved = resolveQuery(postcode);
      expect(resolved).toEqual({ kind: "communes", ins: communesOfPostcode(postcode) });
      if (resolved.kind === "communes") {
        expect(resolved.ins.length).toBeGreaterThan(0);
        expect(new Set(resolved.ins).size).toBe(resolved.ins.length);
      }
    }
    expect(resolveQuery("1050")).toEqual({ kind: "communes", ins: ["21009"] });
  });

  it("a name that is exactly one commune's works like picking it, accents and case ignored", () => {
    expect(resolveQuery("ixelles")).toEqual({ kind: "communes", ins: ["21009"] });
    expect(resolveQuery("  Elsene ")).toEqual({ kind: "communes", ins: ["21009"] });
    expect(resolveQuery("SAINT-GILLES")).toEqual(resolveQuery("saint gilles"));
  });

  it("anything else is unknown, and nothing typed is empty", () => {
    expect(resolveQuery("ixel")).toEqual({ kind: "inconnue" });
    expect(resolveQuery("9999")).toEqual({ kind: "inconnue" });
    expect(resolveQuery("1050|Nulle part")).toEqual({ kind: "inconnue" });
    expect(resolveQuery("")).toEqual({ kind: "vide" });
    expect(resolveQuery("   ")).toEqual({ kind: "vide" });
    expect(resolveQuery(undefined)).toEqual({ kind: "vide" });
  });

  it("a result URL keeps known communes only, once each, and round-trips", () => {
    expect(communesOfParams(["21009", "21009", "99999", "21015"])).toEqual(["21009", "21015"]);
    expect(communesOfParams("21009")).toEqual(["21009"]);
    expect(communesOfParams(undefined)).toEqual([]);
    expect(searchQuery(["21009", "21015"])).toBe("commune=21009&commune=21015");
  });
});

describe("the order of the results (D-123)", () => {
  const a = { id: "a", firstName: "Zoé", nextNight: "2026-10-01" };
  const b = { id: "b", firstName: "Anne", nextNight: "2026-10-03" };
  const c = { id: "c", firstName: "Anne", nextNight: null };
  const d = { id: "d", firstName: "Béatrice", nextNight: null };

  it("puts the soonest indicative night first, then those with none", () => {
    expect(orderProfessionals([c, b, d, a]).map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("breaks an equal night by first name, accents ignored", () => {
    const e = { id: "e", firstName: "Élise", nextNight: "2026-10-01" };
    const f = { id: "f", firstName: "Emma", nextNight: "2026-10-01" };
    const g = { id: "g", firstName: "Delphine", nextNight: "2026-10-01" };
    expect(orderProfessionals([f, e, g]).map((p) => p.id)).toEqual(["g", "e", "f"]);
  });

  it("breaks an equal night and an equal first name by profile id, so the order never moves", () => {
    const x = { id: "0b", firstName: "Marie", nextNight: "2026-10-01" };
    const y = { id: "0a", firstName: "marie", nextNight: "2026-10-01" };
    expect(orderProfessionals([x, y]).map((p) => p.id)).toEqual(["0a", "0b"]);
    expect(compareProfessionals(x, x)).toBe(0);
  });

  it("orders those without a night by first name too", () => {
    expect(orderProfessionals([d, c]).map((p) => p.id)).toEqual(["c", "d"]);
  });
});

describe("the zone", () => {
  it("names the searched commune first, then the rest by name", () => {
    expect(zoneNames(["21015", "21009", "21004"], ["21009"])).toEqual(["Ixelles", "Bruxelles", "Schaerbeek"]);
  });

  it("shows at most three communes on a card, then how many more", () => {
    expect(zoneLine(["Ixelles"])).toBe("Se déplace à Ixelles");
    expect(zoneLine(["A", "B", "C", "D"])).toBe("Se déplace à A, B, C et 1 autre commune");
    expect(zoneLine(["A", "B", "C", "D", "E"])).toBe("Se déplace à A, B, C et 2 autres communes");
  });
});

describe("the public pages' titles and metas (the guide's patterns)", () => {
  it("fills the guide's professional title and meta with her name, profession and zone", () => {
    const meta = professionalMeta({ firstName: "Emma", profession: "sage_femme", communes: ["21009"] });
    expect(meta.title).toBe("Emma, Sage-femme disponible pour gardes de nuit | Berceo");
    expect(meta.description).toBe(
      "Emma est sage-femme, disponible pour des gardes de nuit à domicile dans la zone Ixelles. Profil vérifié par Berceo.",
    );
  });

  it("names her first commune « et environs » when she serves several", () => {
    expect(metaZone(["21015", "21009"])).toBe("Ixelles et environs");
  });

  it("gives every commune page its own title and meta", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const ins of ["21009", "21004", "21015", "25072"]) {
      const name = communeName(ins);
      if (!name) continue;
      const meta = communeMeta(name);
      expect(meta.title).toContain(name);
      titles.add(meta.title);
      descriptions.add(meta.description);
    }
    expect(titles.size).toBe(descriptions.size);
    expect(titles.size).toBeGreaterThan(2);
  });
});
