import "server-only";

import { createHash, randomBytes, randomInt } from "node:crypto";
import { and, desc, eq, gt, sql } from "drizzle-orm";

import { db, signInCodes, trustedDevices } from "@/db";

import {
  CODE_LENGTH,
  afterWrongTry,
  codeExpiry,
  codeState,
  deviceExpiry,
  mayResend,
} from "./second-factor";

/*
 * The only reads and writes of `sign_in_codes` and `trusted_devices`
 * (comptes-2fa). The database holds SHA-256 hashes only: never a code, never
 * a device token. The rules are in `second-factor.ts`.
 */

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export type IssuedCode = { outcome: "issued"; code: string } | { outcome: "too-soon" };

/**
 * A new six-digit code for `userId`, replacing any older one, unless one
 * left less than 60 seconds ago. The code goes back to the caller once, to
 * be sent; the row keeps its hash.
 */
export async function issueSignInCode(userId: string, now = new Date()): Promise<IssuedCode> {
  const [last] = await db
    .select({ createdAt: signInCodes.createdAt })
    .from(signInCodes)
    .where(eq(signInCodes.userId, userId))
    .orderBy(desc(signInCodes.createdAt))
    .limit(1);
  if (!mayResend(last?.createdAt ?? null, now)) return { outcome: "too-soon" };

  const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
  await db.batch([
    db.delete(signInCodes).where(eq(signInCodes.userId, userId)),
    db.insert(signInCodes).values({
      userId,
      codeHash: sha256(code),
      expiresAt: codeExpiry(now),
      createdAt: now,
    }),
  ]);
  return { outcome: "issued", code };
}

/** True while `userId` has a code that is neither expired nor dead. */
export async function hasLiveCode(userId: string, now = new Date()): Promise<boolean> {
  const [row] = await db
    .select({ expiresAt: signInCodes.expiresAt, attempts: signInCodes.attempts })
    .from(signInCodes)
    .where(eq(signInCodes.userId, userId))
    .orderBy(desc(signInCodes.createdAt))
    .limit(1);
  return row ? codeState(row, now) === "live" : false;
}

export type CodeCheck = "ok" | "wrong" | "dead" | "expired" | "none";

/**
 * Checks the six digits typed against the user's code. A correct code is
 * consumed. A wrong one counts a try: the fifth ends the code (`dead`).
 */
export async function checkSignInCode(userId: string, code: string, now = new Date()): Promise<CodeCheck> {
  const [row] = await db
    .select()
    .from(signInCodes)
    .where(eq(signInCodes.userId, userId))
    .orderBy(desc(signInCodes.createdAt))
    .limit(1);
  if (!row) return "none";
  const state = codeState(row, now);
  if (state !== "live") return state;

  if (row.codeHash !== sha256(code)) {
    // The try counts whichever request wins the row; the state is read from the count.
    const [updated] = await db
      .update(signInCodes)
      .set({ attempts: sql`${signInCodes.attempts} + 1` })
      .where(eq(signInCodes.id, row.id))
      .returning({ attempts: signInCodes.attempts });
    return afterWrongTry(updated?.attempts ?? row.attempts + 1) === "dead" ? "dead" : "wrong";
  }

  await db.delete(signInCodes).where(eq(signInCodes.id, row.id));
  return "ok";
}

/**
 * Trusts the device for 30 days: the raw token goes to the cookie, its hash
 * to the row. A new row per code, so a second browser never shares a token.
 */
export async function trustDevice(userId: string, now = new Date()): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = deviceExpiry(now);
  await db.insert(trustedDevices).values({ userId, tokenHash: sha256(token), expiresAt, createdAt: now });
  return { token, expiresAt };
}

/** True when the cookie's token names a device of `userId` that is still inside its 30 days. */
export async function isDeviceTrusted(userId: string, token: string | undefined, now = new Date()): Promise<boolean> {
  if (!token) return false;
  const [row] = await db
    .select({ id: trustedDevices.id })
    .from(trustedDevices)
    .where(
      and(
        eq(trustedDevices.userId, userId),
        eq(trustedDevices.tokenHash, sha256(token)),
        gt(trustedDevices.expiresAt, now),
      ),
    )
    .limit(1);
  return Boolean(row);
}
