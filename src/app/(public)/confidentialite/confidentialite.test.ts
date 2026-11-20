import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (JAM-352): the privacy page names Calendly as the recipient of the
 * booking data of the sleep consultation, only where the consultation page
 * exists. Nothing renders in these tests (plain Node): the page is read as
 * text. `src/content/legal.test.ts` holds the words.
 */
const page = readFileSync(fileURLToPath(new URL("./page.tsx", import.meta.url)), "utf8");

describe("the privacy page", () => {
  it("shows the block on Calendly only where the consultation page exists", () => {
    expect(page).toContain("{sleepConsultationEnabled() ? (");
    expect(page).toContain("t.consultationSommeil.title");
    expect(page).toContain("t.consultationSommeil.paragraphs.map");
  });

  it("follows the environment on each request", () => {
    expect(page).toContain('export const dynamic = "force-dynamic"');
  });

  it("keeps the placeholder and stays out of search engines", () => {
    expect(page).toContain("<PlaceholderPage title={t.title} text={t.placeholder} />");
    expect(page).toContain("index: false");
  });
});
