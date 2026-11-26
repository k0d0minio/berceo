import type { UserRole } from "@/db/schema";

import { normalizeEmail } from "./validation";

/**
 * `npm run seed:test-roles -- --email <address> --role <role> --target local|uat`.
 *
 * The seed script of the BAXTER checktest (`.icm/setup/checktest-accounts.md`).
 * The checktest signs a test account up. This script gives that account its
 * role. Only `admin` is given here: `parent` and `professionnel` come from the
 * sign-up form, and a change of persona would leave the account without its
 * profile rows. For those two roles the script only confirms the role.
 *
 * The decision is pure (the tests hold it). scripts/seed-test-roles.ts wires it
 * to the database of the target.
 */

export const SEED_TARGETS = ["local", "uat"] as const;
export type SeedTarget = (typeof SEED_TARGETS)[number];

const ROLES: readonly UserRole[] = ["parent", "professionnel", "admin"];

/** The only addresses the checktest uses: `test+berceo-<role or run>@jamienisbet.com`. */
const TEST_ADDRESS = /^test\+berceo-[a-z0-9-]+@jamienisbet\.com$/;

/** The env file that holds `DATABASE_URL` for each target. Both are git-ignored. */
export const ENV_FILE: Record<SeedTarget, string> = {
  local: ".env.local",
  uat: ".env.uat.local",
};

export type SeedArgs = { email: string; role: UserRole; target: SeedTarget };

export type ParseResult = { ok: true; args: SeedArgs } | { ok: false; reason: string };

function flag(argv: readonly string[], name: string): string | undefined {
  const inline = argv.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.slice(name.length + 3);
  const at = argv.indexOf(`--${name}`);
  return at >= 0 ? argv[at + 1] : undefined;
}

export function parseSeedArgs(argv: readonly string[]): ParseResult {
  const rawEmail = flag(argv, "email");
  const role = flag(argv, "role");
  const target = flag(argv, "target");
  if (!rawEmail || !role || !target) {
    return {
      ok: false,
      reason: "usage: npm run seed:test-roles -- --email <address> --role <role> --target local|uat",
    };
  }
  const email = normalizeEmail(rawEmail);
  if (!TEST_ADDRESS.test(email)) {
    return { ok: false, reason: "refused: the address is not test+berceo-*@jamienisbet.com" };
  }
  if (!(ROLES as readonly string[]).includes(role)) {
    return { ok: false, reason: `refused: the role is not one of ${ROLES.join(", ")}` };
  }
  if (!(SEED_TARGETS as readonly string[]).includes(target)) {
    return { ok: false, reason: "refused: the target is not local or uat" };
  }
  return { ok: true, args: { email, role: role as UserRole, target: target as SeedTarget } };
}

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Refuses the production database. The env of the target must have a
 * `DATABASE_URL`, must not be a production environment of Vercel, and must not
 * point at the host of `PRODUCTION_DATABASE_URL` when the shell has one.
 */
export function databaseRefusal(env: Record<string, string | undefined>): string | null {
  const host = hostOf(env.DATABASE_URL);
  if (!host) return "refused: the env file of the target has no valid DATABASE_URL";
  if (env.VERCEL_ENV === "production" || env.VERCEL_TARGET_ENV === "production") {
    return "refused: the env file of the target is the production environment";
  }
  const production = hostOf(env.PRODUCTION_DATABASE_URL);
  if (production && production === host) return "refused: DATABASE_URL is the production database";
  return null;
}

export type SeedStore = {
  roleOf: (email: string) => Promise<UserRole | null>;
  makeAdmin: (email: string) => Promise<void>;
};

export type SeedResult = { ok: true; message: string } | { ok: false; reason: string };

export async function seedRole(args: SeedArgs, store: SeedStore): Promise<SeedResult> {
  const before = await store.roleOf(args.email);
  if (before === null) {
    return { ok: false, reason: "failed: no account with that address on this database. The checktest signs it up first" };
  }
  if (before === args.role) {
    return { ok: true, message: `${args.email}: already ${args.role}, nothing changed` };
  }
  if (args.role !== "admin") {
    return {
      ok: false,
      reason: `refused: the account is ${before}. The role ${args.role} comes from the sign-up form, not from this script`,
    };
  }
  await store.makeAdmin(args.email);
  return { ok: true, message: `${args.email}: ${before} -> admin` };
}
