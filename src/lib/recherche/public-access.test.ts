import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/server", () => ({ getAuth: () => ({ middleware: () => async () => new Response(null) }) }));

import { config } from "@/proxy";

/**
 * Spec (recherche-et-fiches-publiques, D-14): the public teaser pages and the
 * commune pages are reachable signed out. Only the spaces go through the
 * session proxy; these paths never match it.
 */
function matches(pattern: string, path: string): boolean {
  const base = pattern.replace(/\/:path\*$/, "");
  return path === base || path.startsWith(`${base}/`);
}

describe("the public pages are outside the session proxy", () => {
  it("matches the spaces and neither public page", () => {
    expect(config.matcher).toEqual(["/espace/:path*"]);
    for (const path of ["/professionnelles/emma-3f0c9a52", "/garde-de-nuit/ixelles"]) {
      expect(config.matcher.some((pattern) => matches(pattern, path))).toBe(false);
    }
    expect(config.matcher.some((pattern) => matches(pattern, "/espace/famille/recherche"))).toBe(true);
  });
});
