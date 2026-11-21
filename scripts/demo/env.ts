/**
 * The local demo's own variables (JAM-462): `.env.demo.local`, beside
 * `.env.local`, ignored by git (`.env*`). `npm run demo:db:make` writes it:
 *
 *   DATABASE_URL            the pooled connection of the Neon branch `local/demo`
 *   DATABASE_URL_UNPOOLED   its direct connection
 *   BERCEO_LOCAL_DEMO=1     the demo switch (src/lib/demo/switch.ts)
 *
 * `demo:seed` and `demo:dev` read their database from this file only, never
 * from `.env.local` or the shell. The values are never printed.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse } from "dotenv";

export const DEMO_ENV_FILE = ".env.demo.local";

export type DemoFile = Record<string, string>;

export function readDemoEnv(): DemoFile | null {
  if (!existsSync(DEMO_ENV_FILE)) return null;
  return parse(readFileSync(DEMO_ENV_FILE));
}

export function writeDemoEnv(values: DemoFile): void {
  const lines = [
    "# The local demo database (JAM-462). Written by `npm run demo:db:make`. Never commit.",
    ...Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`),
    "",
  ];
  writeFileSync(DEMO_ENV_FILE, lines.join("\n"), { mode: 0o600 });
}

export function fail(message: string): never {
  console.error(`[demo] ${message}`);
  process.exit(1);
}
