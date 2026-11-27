/**
 * Give a checktest account its role (`.icm/setup/checktest-accounts.md`).
 *
 *   npm run seed:test-roles -- --email <address> --role <role> --target local|uat
 *
 * The database address comes from the environment of the target, never from
 * the command line: `DATABASE_URL` of `.env.local` for local, and
 * `UAT_DATABASE_URL` of the process environment for uat (the operator's secret
 * store gives it for one command; no file holds it). It refuses an address
 * that is not test+berceo-*@jamienisbet.com and the production database.
 * Exit 0: the account has the role. Exit 1: refused or failed, one line of reason.
 */
import { existsSync } from "node:fs";

import { config } from "dotenv";
import { eq } from "drizzle-orm";

import {
  databaseRefusal,
  LOCAL_ENV_FILE,
  parseSeedArgs,
  seedRole,
  UAT_VARIABLE,
} from "../src/lib/auth/seed-test-roles";

async function main(): Promise<number> {
  const parsed = parseSeedArgs(process.argv.slice(2));
  if (!parsed.ok) {
    console.error(parsed.reason);
    return 1;
  }
  const { args } = parsed;

  if (args.target === "uat") {
    const url = process.env[UAT_VARIABLE];
    if (!url) {
      console.error(`refused: ${UAT_VARIABLE} is not set`);
      return 1;
    }
    process.env.DATABASE_URL = url;
  } else {
    if (!existsSync(LOCAL_ENV_FILE)) {
      console.error(`refused: ${LOCAL_ENV_FILE} does not exist`);
      return 1;
    }
    // The env file wins over the shell for these keys.
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_TARGET_ENV;
    config({ path: LOCAL_ENV_FILE, override: true, quiet: true });
  }

  const refusal = databaseRefusal(process.env);
  if (refusal) {
    console.error(refusal);
    return 1;
  }

  // Import the client after the env is set.
  const { db, users } = await import("../src/db");
  const result = await seedRole(args, {
    roleOf: async (email) => {
      const [row] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return row?.role ?? null;
    },
    makeAdmin: async (email) => {
      await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.email, email));
    },
  });

  if (!result.ok) {
    console.error(result.reason);
    return 1;
  }
  console.log(result.message);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(`failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  },
);
