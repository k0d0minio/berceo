/**
 * Promote an existing Berceo account to admin (D-33).
 *
 *   npm run admin:grant -- --email <address>
 *
 * Runs against the database `DATABASE_URL` names (.env.local, or the shell):
 * point it at the branch of the environment the founder signed up on (uat's
 * `preview/uat`, or production). The founder signs up through
 * /inscription-famille first; this only changes the role. Prints the role
 * before and after; exits 1 on an unknown address or a missing --email.
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";

import { db, users } from "../src/db";
import { emailFromArgs, grantAdmin } from "../src/lib/auth/grant-admin";

config({ path: ".env.local" });
config({ path: ".env" });

async function main(): Promise<number> {
  const result = await grantAdmin(emailFromArgs(process.argv.slice(2)), {
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
    console.error(
      result.reason === "usage"
        ? "usage: npm run admin:grant -- --email <address>"
        : "no account with that address on this database — sign up through /inscription-famille first",
    );
    return 1;
  }

  console.log(
    result.changed
      ? `${result.email}: ${result.before} → admin`
      : `${result.email}: already admin, nothing changed`,
  );
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
