import { demoSwitchOn, type DemoEnv } from "./switch";

/**
 * The walls of the demo seed (JAM-462). The seed empties every table before it
 * fills them, so it runs only on the local demo database:
 *
 * 1. It reads its connection from `.env.demo.local` only, never from
 *    `.env.local` or the shell (the script holds that part).
 * 2. That file turns the demo switch on, and the shell is not a Vercel build
 *    and not a production build (`demoSwitchOn`).
 * 3. The database carries the demo marker: the table `berceo_demo.marker`,
 *    which only `npm run demo:db:make` writes, on the Neon branch `local/demo`
 *    that it made itself. UAT and production never have it.
 * 4. The Neon branch named in the marker is not a default branch.
 */

/** The schema and table of the marker. */
export const DEMO_MARKER_SCHEMA = "berceo_demo";
export const DEMO_MARKER_TABLE = "marker";

/** The Neon branch of `uat-berceo` the demo lives on. */
export const DEMO_BRANCH_NAME = "local/demo";

export type SeedFacts = {
  /** The variables of `.env.demo.local`, as the four the switch reads. */
  fileEnv: DemoEnv;
  /** The variables of the shell, as the four the switch reads. */
  shellEnv: DemoEnv;
  /** `DATABASE_URL` from `.env.demo.local`. */
  url: string | undefined;
  /** What the marker table holds: the branch names written, or null when it does not exist. */
  markerBranches: string[] | null;
};

export type SeedRefusal =
  | "no-url"
  | "switch-off"
  | "vercel-or-production"
  | "no-marker"
  | "wrong-branch";

/** Why the seed must not run, or null when it may. */
export function seedRefusal(facts: SeedFacts): SeedRefusal | null {
  if (!facts.url) return "no-url";
  if (facts.fileEnv.flag !== "1") return "switch-off";
  if (!demoSwitchOn({ ...facts.shellEnv, flag: "1" })) return "vercel-or-production";
  if (!facts.markerBranches || facts.markerBranches.length === 0) return "no-marker";
  if (!facts.markerBranches.every((name) => name === DEMO_BRANCH_NAME)) return "wrong-branch";
  return null;
}

/** Whether `make-db` may write the marker on a branch: the demo branch, and never a default or protected one. */
export function mayMarkBranch(branch: { name: string; default?: boolean; primary?: boolean; protected?: boolean }): boolean {
  return branch.name === DEMO_BRANCH_NAME && !branch.default && !branch.primary && !branch.protected;
}
