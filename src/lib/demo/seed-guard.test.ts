import { describe, expect, it } from "vitest";

import { DEMO_BRANCH_NAME, mayMarkBranch, seedRefusal, type SeedFacts } from "./seed-guard";

const OK: SeedFacts = {
  fileEnv: { flag: "1" },
  shellEnv: { nodeEnv: undefined },
  url: "postgresql://demo@ep-demo.eu-central-1.aws.neon.tech/neondb",
  markerBranches: [DEMO_BRANCH_NAME],
};

describe("the demo seed refuses every database but the local demo one (JAM-462)", () => {
  it("runs on the marked demo branch", () => {
    expect(seedRefusal(OK)).toBeNull();
  });

  it("refuses with no connection in .env.demo.local", () => {
    expect(seedRefusal({ ...OK, url: undefined })).toBe("no-url");
  });

  it("refuses when .env.demo.local does not turn the switch on", () => {
    expect(seedRefusal({ ...OK, fileEnv: {} })).toBe("switch-off");
  });

  it("refuses inside a Vercel build or a production build", () => {
    expect(seedRefusal({ ...OK, shellEnv: { vercel: "1" } })).toBe("vercel-or-production");
    expect(seedRefusal({ ...OK, shellEnv: { vercelEnv: "preview" } })).toBe("vercel-or-production");
    expect(seedRefusal({ ...OK, shellEnv: { nodeEnv: "production" } })).toBe("vercel-or-production");
  });

  it("refuses a database without the marker: UAT and production never have it", () => {
    expect(seedRefusal({ ...OK, markerBranches: null })).toBe("no-marker");
    expect(seedRefusal({ ...OK, markerBranches: [] })).toBe("no-marker");
  });

  it("refuses a marker that names another branch", () => {
    expect(seedRefusal({ ...OK, markerBranches: ["main"] })).toBe("wrong-branch");
    expect(seedRefusal({ ...OK, markerBranches: [DEMO_BRANCH_NAME, "main"] })).toBe("wrong-branch");
  });
});

describe("make-db marks only the demo branch", () => {
  it("marks local/demo", () => {
    expect(mayMarkBranch({ name: DEMO_BRANCH_NAME, default: false, primary: false, protected: false })).toBe(true);
  });

  it("never marks a default, primary or protected branch, or another name", () => {
    expect(mayMarkBranch({ name: "main", default: true, primary: true })).toBe(false);
    expect(mayMarkBranch({ name: DEMO_BRANCH_NAME, default: true })).toBe(false);
    expect(mayMarkBranch({ name: DEMO_BRANCH_NAME, primary: true })).toBe(false);
    expect(mayMarkBranch({ name: DEMO_BRANCH_NAME, protected: true })).toBe(false);
    expect(mayMarkBranch({ name: "local/bursts" })).toBe(false);
  });
});
