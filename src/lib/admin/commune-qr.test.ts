import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { accessFor } from "@/lib/auth/routing";

import {
  QR_FORMATS,
  QR_OPTIONS,
  QR_PNG_WIDTH,
  communeQrPath,
  qrFileName,
  qrFormat,
  qrHeaders,
  qrRequest,
  qrResponse,
  type QrRenderer,
} from "./commune-qr";

/*
 * Written from the acceptance criteria of the QR code of JAM-361: a founder
 * gets the code of a commune's share link as SVG or PNG, made by the
 * application, good for print.
 */

const ORIGIN = "https://berceo.example";
const query = (text: string) => new URLSearchParams(text);

describe("only a founder gets a code (D-33)", () => {
  const path = "/admin/communes/ixelles/qr";

  it("answers 404 on the route to anyone but an admin", () => {
    expect(communeQrPath("ixelles", "svg").split("?")[0]).toBe(path);
    expect(accessFor("admin", path)).toEqual({ kind: "allow" });
    for (const role of ["parent", "professionnel", null] as const) {
      expect(accessFor(role, path)).toEqual({ kind: "not-found" });
    }
  });

  it("the route calls the guard of the admin pages first, then answers 404 for what it does not know", () => {
    const route = readFileSync(
      fileURLToPath(new URL("../../app/(portail)/admin/communes/[slug]/qr/route.ts", import.meta.url)),
      "utf8",
    );
    const guard = route.indexOf("await requireAccess(ADMIN_COMMUNES_PATH)");
    expect(guard).toBeGreaterThan(-1);
    for (const later of ["await params", "siteOrigin()", "qrResponse(", "notFound()"]) {
      expect(route.indexOf(later)).toBeGreaterThan(guard);
    }
    expect(route).not.toMatch(/from "@\/db/);
  });
});

describe("the formats and the file name", () => {
  it("accepts svg and png, and no other value", () => {
    expect([...QR_FORMATS]).toEqual(["svg", "png"]);
    expect(qrFormat("svg")).toBe("svg");
    expect(qrFormat("png")).toBe("png");
    for (const raw of ["SVG", "jpg", "pdf", "", " svg", null, undefined]) expect(qrFormat(raw)).toBeNull();
  });

  it("names the file with the slug of the commune", () => {
    expect(qrFileName("ixelles", "svg")).toBe("berceo-ixelles.svg");
    expect(qrFileName("saint-josse-ten-noode", "png")).toBe("berceo-saint-josse-ten-noode.png");
  });

  it("gives the address of the image and of a download", () => {
    expect(communeQrPath("ixelles", "svg")).toBe("/admin/communes/ixelles/qr?format=svg");
    expect(communeQrPath("ixelles", "png", true)).toBe("/admin/communes/ixelles/qr?format=png&download=1");
  });
});

describe("the options are good for print", () => {
  it("uses error correction M, a quiet zone of 4 modules and a PNG of 1024 px", () => {
    expect(QR_OPTIONS).toEqual({ errorCorrectionLevel: "M", margin: 4 });
    expect(QR_PNG_WIDTH).toBe(1024);
  });
});

describe("what a request names", () => {
  it("reads the slug of a real commune, a format and a download", () => {
    expect(qrRequest("ixelles", query("format=svg"))).toEqual({
      ins: "21009",
      slug: "ixelles",
      commune: "Ixelles",
      format: "svg",
      download: false,
    });
    expect(qrRequest("ixelles", query("format=png&download=1"))).toMatchObject({ format: "png", download: true });
  });

  it("is a 404 for a slug that names no commune", () => {
    for (const slug of ["atlantide", "", "Ixelles", "21009", "ixelles/..", "constructor"]) {
      expect(qrRequest(slug, query("format=svg"))).toBeNull();
    }
  });

  it("is a 404 for each other input", () => {
    for (const text of [
      "",
      "format=jpg",
      "format=SVG",
      "format=svg&format=png",
      "format=svg&download=0",
      "format=svg&download=true",
      "format=svg&download=1&download=1",
      "format=svg&url=https%3A%2F%2Fevil.example",
      "format=svg&size=9999",
    ]) {
      expect(qrRequest("ixelles", query(text))).toBeNull();
    }
  });
});

describe("the headers", () => {
  it("shows the image inline and saves a download with its file name", () => {
    expect(qrHeaders({ slug: "ixelles", format: "svg", download: false })).toMatchObject({
      "content-type": "image/svg+xml; charset=utf-8",
      "content-disposition": 'inline; filename="berceo-ixelles.svg"',
    });
    expect(qrHeaders({ slug: "ixelles", format: "png", download: true })).toMatchObject({
      "content-type": "image/png",
      "content-disposition": 'attachment; filename="berceo-ixelles.png"',
    });
  });

  it("is private to the founder's browser", () => {
    for (const format of QR_FORMATS) {
      expect(qrHeaders({ slug: "ixelles", format, download: false })["cache-control"]).toMatch(/^private\b/);
    }
  });
});

describe("the response", () => {
  const seen: [string, string][] = [];
  const render: QrRenderer = async (url, format) => {
    seen.push([url, format]);
    return format === "svg" ? "<svg/>" : new Uint8Array([1, 2, 3]);
  };

  it("encodes only the share link that the server makes", async () => {
    seen.length = 0;
    const response = await qrResponse("ixelles", query("format=svg"), ORIGIN, render);
    expect(seen).toEqual([["https://berceo.example/garde-de-nuit/ixelles", "svg"]]);
    expect(response?.status).toBe(200);
    expect(response?.headers.get("content-type")).toBe("image/svg+xml; charset=utf-8");
    expect(await response?.text()).toBe("<svg/>");
  });

  it("sends the bytes of the PNG as an attachment for a download", async () => {
    const response = await qrResponse("ixelles", query("format=png&download=1"), ORIGIN, render);
    expect(response?.headers.get("content-disposition")).toBe('attachment; filename="berceo-ixelles.png"');
    expect([...new Uint8Array(await response!.arrayBuffer())]).toEqual([1, 2, 3]);
  });

  it("draws nothing for a 404", async () => {
    seen.length = 0;
    expect(await qrResponse("atlantide", query("format=svg"), ORIGIN, render)).toBeNull();
    expect(await qrResponse("ixelles", query("format=gif"), ORIGIN, render)).toBeNull();
    expect(seen).toEqual([]);
  });
});
