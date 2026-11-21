/**
 * Makes the local demo database (JAM-462), migrates it, and fills it.
 *
 *   NEON_API_KEY=… npm run demo:db:make               make it, or find it, then migrate and fill
 *   NEON_API_KEY=… npm run demo:db:make -- --recreate delete it and make it again from UAT
 *   npm run demo:db:make                               with no key: migrate and fill the branch
 *                                                      that .env.demo.local already names
 *
 * The database is the Neon branch `local/demo` of the project `uat-berceo`
 * (`.icm/local/database.md`). The branch starts as a copy of UAT's default
 * branch; the seed then empties every table, `neon_auth` included, so no UAT
 * row stays. This script never writes to the default branch: it marks only a
 * branch named `local/demo` that is not default, primary or protected, and the
 * seed refuses any database without that mark.
 *
 * `NEON_API_KEY` is a Neon API key of the operator, from the shell only. It
 * is never stored. The connection strings go to `.env.demo.local` and are
 * never printed.
 */
import { spawnSync } from "node:child_process";
import { neon } from "@neondatabase/serverless";

import { DEMO_BRANCH_NAME, DEMO_MARKER_SCHEMA, DEMO_MARKER_TABLE, mayMarkBranch } from "../../src/lib/demo/seed-guard";
import { DEMO_SWITCH } from "../../src/lib/demo/switch";
import { fail, readDemoEnv, writeDemoEnv } from "./env";

/** The Neon project `uat-berceo`. Never the project `berceo` (production). */
const PROJECT_ID = process.env.NEON_DEMO_PROJECT_ID ?? "dawn-scene-70949411";
const API = "https://console.neon.tech/api/v2";

type Branch = { id: string; name: string; default?: boolean; primary?: boolean; protected?: boolean; current_state?: string };

async function neonApi<T>(method: string, path: string, body?: unknown): Promise<T> {
  const key = process.env.NEON_API_KEY;
  if (!key) fail("NEON_API_KEY is not set.");
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { authorization: `Bearer ${key}`, accept: "application/json", "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) fail(`Neon API ${method} ${path}: ${response.status} ${await response.text()}`);
  return (await response.json()) as T;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function findBranch(): Promise<Branch | null> {
  const { branches } = await neonApi<{ branches: Branch[] }>(
    "GET",
    `/projects/${PROJECT_ID}/branches?search=${encodeURIComponent(DEMO_BRANCH_NAME)}`,
  );
  return branches.find((branch) => branch.name === DEMO_BRANCH_NAME) ?? null;
}

async function waitReady(branchId: string): Promise<Branch> {
  for (let i = 0; i < 60; i++) {
    const { branch } = await neonApi<{ branch: Branch }>("GET", `/projects/${PROJECT_ID}/branches/${branchId}`);
    if (branch.current_state === "ready") return branch;
    await sleep(2000);
  }
  fail("the branch is not ready after two minutes.");
}

async function connectionUris(branchId: string): Promise<{ pooled: string; direct: string }> {
  const { databases } = await neonApi<{ databases: { name: string; owner_name: string }[] }>(
    "GET",
    `/projects/${PROJECT_ID}/branches/${branchId}/databases`,
  );
  const database = databases.find((d) => d.name === "neondb") ?? databases[0];
  if (!database) fail("the branch has no database.");
  const uri = async (pooled: boolean) => {
    const query = new URLSearchParams({
      branch_id: branchId,
      database_name: database.name,
      role_name: database.owner_name,
      pooled: String(pooled),
    });
    const { uri } = await neonApi<{ uri: string }>("GET", `/projects/${PROJECT_ID}/connection_uri?${query}`);
    return uri;
  };
  return { pooled: await uri(true), direct: await uri(false) };
}

async function makeBranch(recreate: boolean): Promise<Branch> {
  let branch = await findBranch();
  if (branch && recreate) {
    if (!mayMarkBranch(branch)) fail(`refused: ${branch.name} is a default, primary or protected branch.`);
    await neonApi("DELETE", `/projects/${PROJECT_ID}/branches/${branch.id}`);
    console.log(`[demo] deleted the branch ${DEMO_BRANCH_NAME}`);
    branch = null;
    await sleep(3000);
  }
  if (!branch) {
    const made = await neonApi<{ branch: Branch }>("POST", `/projects/${PROJECT_ID}/branches`, {
      branch: { name: DEMO_BRANCH_NAME },
      endpoints: [{ type: "read_write" }],
    });
    console.log(`[demo] made the branch ${DEMO_BRANCH_NAME} from UAT's default branch`);
    branch = made.branch;
  }
  branch = await waitReady(branch.id);
  if (!mayMarkBranch(branch)) fail(`refused: ${branch.name} is a default, primary or protected branch.`);
  return branch;
}

async function mark(direct: string, branch: Branch): Promise<void> {
  const sql = neon(direct);
  await sql(`create schema if not exists ${DEMO_MARKER_SCHEMA}`);
  await sql(
    `create table if not exists ${DEMO_MARKER_SCHEMA}.${DEMO_MARKER_TABLE} (
       branch_id text primary key, branch_name text not null, made_at timestamptz not null default now())`,
  );
  await sql(
    `insert into ${DEMO_MARKER_SCHEMA}.${DEMO_MARKER_TABLE} (branch_id, branch_name) values ($1, $2) on conflict (branch_id) do nothing`,
    [branch.id, branch.name],
  );
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv): void {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) fail(`${command} ${args.join(" ")} failed.`);
}

async function main(): Promise<void> {
  const recreate = process.argv.includes("--recreate");

  if (process.env.NEON_API_KEY) {
    const branch = await makeBranch(recreate);
    const { pooled, direct } = await connectionUris(branch.id);
    writeDemoEnv({ DATABASE_URL: pooled, DATABASE_URL_UNPOOLED: direct, [DEMO_SWITCH]: "1" });
    console.log("[demo] wrote .env.demo.local");
    await mark(direct, branch);
    console.log(`[demo] marked ${DEMO_BRANCH_NAME} as the demo database`);
  } else {
    if (recreate) fail("--recreate needs NEON_API_KEY.");
    if (!readDemoEnv()) fail("no .env.demo.local and no NEON_API_KEY. See .icm/local/database.md, The local demo database.");
    console.log("[demo] no NEON_API_KEY: using the branch .env.demo.local names");
  }

  const file = readDemoEnv();
  const direct = file?.DATABASE_URL_UNPOOLED || file?.DATABASE_URL;
  if (!direct) fail(".env.demo.local has no DATABASE_URL.");

  // The seed's guard runs first: it refuses a database without the mark, before any migration.
  run("npx", ["tsx", "--conditions=react-server", "scripts/demo/seed.ts", "--check"], process.env);
  run("npx", ["drizzle-kit", "migrate"], { ...process.env, DATABASE_URL: direct });
  run("npx", ["tsx", "--conditions=react-server", "scripts/demo/seed.ts"], process.env);
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
