import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CALENDLY_ORIGIN } from "@/lib/consultation-sommeil/embed";

import nextConfig, { contentSecurityPolicy, securityHeaders } from "../../next.config";

/**
 * Spec (JAM-360): each response of the site has a Content-Security-Policy
 * that permits a frame only from the site and from `https://calendly.com`,
 * refuses the site in a frame of a different origin, and has `object-src`
 * and `base-uri` rules that break no page. It has no script, style, default,
 * connect or form rule. The two other headers are `nosniff` and the referrer
 * policy. The test is here because Vitest runs only the tests below `src/`.
 */

/** The policy as a map: directive → its sources. */
const directives = new Map(
  contentSecurityPolicy.split(";").map((part) => {
    const [name, ...sources] = part.trim().split(/\s+/);
    return [name, sources] as const;
  }),
);

describe("the Content-Security-Policy", () => {
  it("is exactly these four rules", () => {
    expect(contentSecurityPolicy).toBe(
      "frame-src 'self' https://calendly.com; frame-ancestors 'self'; object-src 'self'; base-uri 'self'",
    );
  });

  it("permits a frame only from the site and from Calendly", () => {
    expect(directives.get("frame-src")).toEqual(["'self'", "https://calendly.com"]);
  });

  it("permits the one origin that the consultation page frames", () => {
    expect(directives.get("frame-src")).toContain(CALENDLY_ORIGIN);
  });

  it("refuses the site in a frame of a different origin", () => {
    expect(directives.get("frame-ancestors")).toEqual(["'self'"]);
  });

  it("lets the founders' dossier page show a PDF of the site in an <object>", () => {
    expect(directives.get("object-src")).toEqual(["'self'"]);
    const view = readFileSync(
      fileURLToPath(new URL("../components/admin/document-view.tsx", import.meta.url)),
      "utf8",
    );
    // The reason for 'self' and not 'none'. If the viewer changes, look at the rule again.
    expect(view).toContain("<object data={src}");
    expect(view).toContain("const src = `/api/fichiers/${id}`");
  });

  it("holds the base address to the site", () => {
    expect(directives.get("base-uri")).toEqual(["'self'"]);
  });

  it("has no script, style, default, connect or form rule, and no wildcard", () => {
    for (const name of ["default-src", "script-src", "style-src", "connect-src", "form-action", "child-src", "img-src"]) {
      expect(directives.has(name)).toBe(false);
    }
    expect([...directives.keys()].sort()).toEqual(["base-uri", "frame-ancestors", "frame-src", "object-src"]);
    expect(contentSecurityPolicy).not.toMatch(/\*|unsafe|data:|blob:|http:/);
  });
});

describe("the site's security headers", () => {
  it("are the policy, nosniff and the referrer policy, and no other header", () => {
    expect(securityHeaders).toEqual([
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ]);
  });

  it("have no HSTS: Vercel sets it", () => {
    expect(securityHeaders.map((header) => header.key.toLowerCase())).not.toContain("strict-transport-security");
  });

  it("go on each path of the site", async () => {
    expect(await nextConfig.headers?.()).toEqual([{ source: "/:path*", headers: securityHeaders }]);
  });
});
