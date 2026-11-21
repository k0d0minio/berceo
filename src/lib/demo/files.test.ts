import { describe, expect, it } from "vitest";

import { demoDocumentKey, demoFileBytes, demoPdf, demoPhotoKey } from "./files";

const text = (bytes: Uint8Array | null) => (bytes ? new TextDecoder().decode(bytes) : null);

describe("the demo files are made from their key (JAM-462)", () => {
  it("a photo key gives an SVG portrait", () => {
    expect(text(demoFileBytes(demoPhotoKey(3)))).toMatch(/^<svg [^>]*viewBox="0 0 400 400"/);
  });

  it("a document key gives a one-page PDF whose cross-reference table points at each object", () => {
    const pdf = text(demoFileBytes(demoDocumentKey("diplome-sage-femme")))!;
    expect(pdf.startsWith("%PDF-1.4\n")).toBe(true);
    expect(pdf).toContain("(DIPLOME SAGE FEMME) Tj");
    const offsets = [...pdf.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    expect(offsets).toHaveLength(5);
    offsets.forEach((offset, index) => expect(pdf.slice(offset).startsWith(`${index + 1} 0 obj`)).toBe(true));
    const startxref = Number(/startxref\n(\d+)\n/.exec(pdf)![1]);
    expect(pdf.slice(startxref).startsWith("xref\n")).toBe(true);
  });

  it("escapes the PDF's string delimiters", () => {
    expect(text(demoPdf("a (b) \\ c"))).toContain("(a \\(b\\) \\\\ c) Tj");
  });

  it("any other key is not a demo file", () => {
    for (const key of ["demo/photo/x.svg", "demo/document/../a.pdf", "profiles/abc/file.pdf", "demo/photo/1.png"]) {
      expect(demoFileBytes(key)).toBeNull();
    }
  });
});
