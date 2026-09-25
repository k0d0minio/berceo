import type { UserRole } from "@/db/schema";

import { homeFor, landingFor, safeReturnPath } from "./routing";

/**
 * The way back through a family's sign-up (D-129). Sign-up sets a first-party
 * cookie holding a checked `retour`; the e-mail confirmation route, once she is
 * verified and signed in, sends a family there instead of her space and clears
 * it. Same browser only; there is no schema change. A professional's sign-up
 * never sets it and her confirmation never reads it.
 */

export const RETURN_COOKIE = "berceo_retour";

/** One day: long enough to find the e-mail, short enough to forget an abandoned sign-up. */
export const RETURN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  path: "/",
  maxAge: 60 * 60 * 24,
} as const;

/** What sign-up stores: a way back we accept, for a family only; else nothing. */
export function returnToStore(role: UserRole, retour: string | null | undefined): string | null {
  return role === "parent" ? safeReturnPath(retour) : null;
}

/** Where a freshly verified user lands: a family's way back when it still holds, else home. */
export function verifiedLanding(role: UserRole, stored: string | null | undefined): string {
  return role === "parent" ? landingFor(role, stored) : homeFor(role);
}
