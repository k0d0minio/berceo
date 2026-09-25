import { describe, expect, it } from "vitest";

import { allCommunes } from "@/lib/communes";

import { sitemapPaths } from "./sitemap";
import {
  allCommunePaths,
  communeOfSlug,
  communePath,
  publicProfessionalPath,
  shortIdOfSlug,
  slugify,
} from "./slugs";

/**
 * Spec (recherche-et-fiches-publiques, D-125, D-127, D-128): a page for every
 * commune of the official list, at a slug unique to it; a professional's page
 * at her first name and a short id, never her surname; the sitemap listing
 * the vitrine, every commune and the validated professionals given.
 */

describe("the commune pages (D-127)", () => {
  it("gives the 565 communes 565 unique slugs, each resolving back to its code", () => {
    const communes = allCommunes();
    expect(communes).toHaveLength(565);
    const paths = allCommunePaths();
    expect(new Set(paths).size).toBe(565);
    for (const { ins } of communes) {
      const path = communePath(ins);
      expect(path).not.toBeNull();
      expect(communeOfSlug(path!.replace("/garde-de-nuit/", ""))).toBe(ins);
    }
  });

  it("slugs a name without accents or punctuation", () => {
    expect(communePath("21009")).toBe("/garde-de-nuit/ixelles");
    expect(communePath("21014")).toBe("/garde-de-nuit/saint-josse-ten-noode");
    expect(slugify("Écaussinnes")).toBe("ecaussinnes");
  });

  it("answers nothing for an unknown slug or code", () => {
    expect(communeOfSlug("atlantide")).toBeNull();
    expect(communePath("99999")).toBeNull();
  });
});

describe("a professional's public page (D-125)", () => {
  const id = "3f0c9a52-6f2e-4a8b-9d7e-1c2b3a4d5e6f";

  it("is her first name slugged, then the first eight characters of her profile id", () => {
    expect(publicProfessionalPath("Marie-Hélène", id)).toBe("/professionnelles/marie-helene-3f0c9a52");
    expect(publicProfessionalPath("Anne Sophie", id)).toBe("/professionnelles/anne-sophie-3f0c9a52");
    expect(publicProfessionalPath("", id)).toBe("/professionnelles/3f0c9a52");
  });

  it("resolves on the short id alone, whatever the first-name part", () => {
    expect(shortIdOfSlug("marie-helene-3f0c9a52")).toBe("3f0c9a52");
    expect(shortIdOfSlug("autre-prenom-3f0c9a52")).toBe("3f0c9a52");
    expect(shortIdOfSlug("3f0c9a52")).toBe("3f0c9a52");
  });

  it("refuses a slug with no valid short id", () => {
    expect(shortIdOfSlug("marie")).toBeNull();
    expect(shortIdOfSlug("marie-3f0c9a5z")).toBeNull();
    expect(shortIdOfSlug("marie3f0c9a52")).toBeNull();
  });
});

describe("the sitemap (D-14, D-128)", () => {
  it("lists the vitrine, every commune page and the professionals given, nothing else", () => {
    const pros = [{ id: "3f0c9a52-6f2e-4a8b-9d7e-1c2b3a4d5e6f", firstName: "Emma" }];
    const paths = sitemapPaths(["/", "/faq"], pros);
    expect(paths.slice(0, 2)).toEqual(["/", "/faq"]);
    expect(paths.filter((p) => p.startsWith("/garde-de-nuit/"))).toHaveLength(565);
    expect(paths.filter((p) => p.startsWith("/professionnelles/"))).toEqual(["/professionnelles/emma-3f0c9a52"]);
    expect(paths).toHaveLength(2 + 565 + 1);
  });
});
