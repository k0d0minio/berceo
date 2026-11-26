/**
 * Give a checktest account its role (`.icm/setup/checktest-accounts.md`).
 *
 *   npm run seed:test-roles -- --email <address> --role <role> --target local|uat
 *
 * The database address comes from the env file of the target, never from the
 * command line: `.env.local` for local, `.env.uat.local` for uat (pull it with
 * `vercel env pull .env.uat.local --environment=uat`). It refuses an address
 * that is not test+berceo-*@jamienisbet.com and the production database.
 * Exit 0: the account has the role. Exit 1: refused or failed, one line of reason.
 */
import { existsSync } from "node:fs";

import { config } from "dotenv";
import { eq } from "drizzle-orm";

import {
  databaseRefusal,
  ENV_FILE,
  parseSeedArgs,
  seedRole,
} from "../src/lib/auth/seed-test-roles";

async function main(): Promise<number> {
  const parsed = parseSeedArgs(process.argv.slice(2));
  if (!parsed.ok) {
    console.error(parsed.reason);
    return 1;
  }
  const { args } = parsed;

  const file = ENV_FILE[args.target];
  if (!existsSync(file)) {
    console.error(`refused: ${file} does not exist`);
    return 1;
  }
  // The env file of the target wins over the shell for these keys.
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL_TARGET_ENV;
  config({ path: file, override: true, quiet: true });

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
