import type { UserRole } from "@/db/schema";

import { normalizeEmail } from "./validation";

/**
 * `npm run admin:grant -- --email <address>` (D-33): no one signs up as an
 * admin. A founder signs up through /inscription-famille, then the operator
 * promotes that account on the database `DATABASE_URL` points at. The address
 * is typed on the command line and never committed.
 *
 * The decision is pure (the tests hold it); scripts/grant-admin.ts wires it to
 * the database.
 */

export type GrantStore = {
  roleOf: (email: string) => Promise<UserRole | null>;
  makeAdmin: (email: string) => Promise<void>;
};

export type GrantResult =
  | { ok: true; email: string; before: UserRole; changed: boolean }
  | { ok: false; reason: "usage" | "unknown" };

export function emailFromArgs(argv: readonly string[]): string | null {
  const flag = argv.indexOf("--email");
  const inline = argv.find((arg) => arg.startsWith("--email="));
  const raw = inline ? inline.slice("--email=".length) : flag >= 0 ? argv[flag + 1] : undefined;
  return raw ? normalizeEmail(raw) : null;
}

export async function grantAdmin(
  email: string | null,
  store: GrantStore,
): Promise<GrantResult> {
  if (!email) return { ok: false, reason: "usage" };

  const before = await store.roleOf(email);
  if (before === null) return { ok: false, reason: "unknown" };
  if (before === "admin") return { ok: true, email, before, changed: false };

  await store.makeAdmin(email);
  return { ok: true, email, before, changed: true };
}
