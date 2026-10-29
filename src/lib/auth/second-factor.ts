import type { UserRole } from "@/db/schema";

/**
 * The second factor at sign-in (comptes-2fa), its rules written once. After
 * her password, a professional or a founder types a six-digit code Berceo
 * sent to her e-mail address; a family never does. A correct code trusts the
 * device for 30 days: a trusted device skips the code, never the password.
 * Neon Auth lists MFA as coming soon, so the site makes, sends and checks the
 * code itself (the decision: `.icm/intake/comptes-2fa/_done/comptes-2fa-recherche.md`).
 *
 * Pure, so the rules are a test. The reads and writes of `sign_in_codes` and
 * `trusted_devices` are in `second-factor-store.ts`.
 */

/** Who gives a code: the roles whose space holds personal data of others. */
export function needsSecondFactor(role: UserRole): boolean {
  return role === "professionnel" || role === "admin";
}

/** A code lives 10 minutes. */
export const CODE_LIFETIME_MS = 10 * 60 * 1000;
/** The fifth wrong try ends the code. */
export const CODE_MAX_ATTEMPTS = 5;
/** At most one code per 60 seconds per account. */
export const CODE_RESEND_GAP_MS = 60 * 1000;
/** A device stays trusted 30 days after the code. A sign-in does not extend it. */
export const DEVICE_TRUST_MS = 30 * 24 * 60 * 60 * 1000;

export const CODE_LENGTH = 6;

/** Where a sign-in that needs the code lands, and where the guard sends a session that owes one. */
export const CODE_PATH = "/connexion/code";

/** The cookie holding the raw device token. The database holds its hash only. */
export const DEVICE_COOKIE = "berceo-appareil";

export const DEVICE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  path: "/",
  maxAge: DEVICE_TRUST_MS / 1000,
} as const;

/** The digits typed, with the spaces a reader may add; null unless exactly six digits. */
export function normalizeCode(raw: string): string | null {
  const digits = raw.replace(/\s+/g, "");
  return /^\d{6}$/.test(digits) ? digits : null;
}

export function codeExpiry(now: Date): Date {
  return new Date(now.getTime() + CODE_LIFETIME_MS);
}

export function deviceExpiry(now: Date): Date {
  return new Date(now.getTime() + DEVICE_TRUST_MS);
}

/** True when a new code may leave: no code yet, or the last one is 60 seconds old. */
export function mayResend(lastCreatedAt: Date | null, now: Date): boolean {
  return !lastCreatedAt || now.getTime() - lastCreatedAt.getTime() >= CODE_RESEND_GAP_MS;
}

export type CodeState = "live" | "expired" | "dead";

/** What a stored code is before any try: still live, past its 10 minutes, or ended by five wrong tries. */
export function codeState(row: { expiresAt: Date; attempts: number }, now: Date): CodeState {
  if (row.expiresAt.getTime() <= now.getTime()) return "expired";
  if (row.attempts >= CODE_MAX_ATTEMPTS) return "dead";
  return "live";
}

/** What the code is once `attempts` wrong tries are counted: dead at the fifth, else still live. */
export function afterWrongTry(attempts: number): CodeState {
  return attempts >= CODE_MAX_ATTEMPTS ? "dead" : "live";
}
