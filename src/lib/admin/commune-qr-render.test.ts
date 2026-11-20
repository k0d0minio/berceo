import { describe, expect, it } from "vitest";

import { renderQr } from "./commune-qr-render";

/*
 * Spec (the QR code of JAM-361): the application draws the code itself, as an
 * SVG and as a PNG of about 1024 px, black on white with its quiet zone.
 */

const LINK = "https://berceo.example/garde-de-nuit/ixelles";
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe("the code of a known link", () => {
  it("is an SVG with the svg root, black on white", async () => {
    const svg = await renderQr(LINK, "svg");
    expect(typeof svg).toBe("string");
    expect(String(svg).trimStart()).toMatch(/^<svg[\s>]/);
    expect(String(svg)).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(String(svg)).toContain("#000000");
    expect(String(svg)).toContain("#ffffff");
  });

  it("is a PNG that starts with the PNG signature, 1024 px wide and high", async () => {
    const png = await renderQr(LINK, "png");
    expect(typeof png).not.toBe("string");
    const bytes = png as Uint8Array;
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
    // The IHDR chunk follows the signature: width and height are big-endian at bytes 16 and 20.
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(view.getUint32(16)).toBe(view.getUint32(20));
    expect(view.getUint32(16)).toBeGreaterThanOrEqual(1000);
    expect(view.getUint32(16)).toBeLessThanOrEqual(1024);
  });

  it("draws the same code for the same link", async () => {
    expect(await renderQr(LINK, "svg")).toBe(await renderQr(LINK, "svg"));
    expect(await renderQr(LINK, "svg")).not.toBe(await renderQr(`${LINK}-b`, "svg"));
  });
});
