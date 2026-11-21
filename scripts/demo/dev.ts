/**
 * The local server on the demo database (JAM-462): `npm run demo:dev`.
 *
 * It reads `.env.demo.local` and starts `next dev` with its variables, which
 * win over `.env.local` (Next.js never overrides a variable the process
 * already has). So the server reads the Neon branch `local/demo`, the demo
 * switch is on, a checktest run signs in through `/api/demo/connexion`, and
 * no e-mail leaves. `npm run dev` stays as it was.
 */
import { spawn } from "node:child_process";

import { DEMO_SWITCH } from "../../src/lib/demo/switch";
import { fail, readDemoEnv } from "./env";

const file = readDemoEnv();
if (!file) fail("no .env.demo.local: run `npm run demo:db:make` first.");
if (file[DEMO_SWITCH] !== "1" || !file.DATABASE_URL) fail(".env.demo.local has no DATABASE_URL or no demo switch.");

const child = spawn("npx", ["next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, ...file },
});
child.on("exit", (code) => process.exit(code ?? 0));
