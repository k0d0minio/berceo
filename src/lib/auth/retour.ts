import type { UserRole } from "@/db/schema";
import { SUBSCRIPTION_START_PATH } from "@/lib/abonnements/paths";
import type { SignupChoice } from "@/lib/abonnements/rules";

import { homeFor, landingFor, safeReturnPath } from "./routing";

/**
 * The way back through a family's sign-up (D-129). Sign-up sets a first-party
 * cookie holding a checked `retour`; the e-mail confirmation route, once she is
 * verified and signed in, sends a family there instead of her space and clears
 * it. Same browser only; there is no schema change. A professional's sign-up
 * never sets it and her confirmation never reads it.
 *
 * A family who picked a plan at sign-up goes to its Checkout first
 * (abonnements-inscription-famille). The cookie then stays, and the
 * subscription's return page sends her on to the way back once she paid.
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

/**
 * Where a freshly verified user lands: a family with a plan, its Checkout;
 * else a family's way back when it still holds; else home.
 */
export function verifiedLanding(
  role: UserRole,
  stored: string | null | undefined,
  signupPlan: SignupChoice | null = null,
): string {
  if (role !== "parent") return homeFor(role);
  return signupPlan ? SUBSCRIPTION_START_PATH : landingFor(role, stored);
}

/** Where a family lands once her first payment went through: her way back when it still holds, else null. */
export function paidLanding(stored: string | null | undefined): string | null {
  return safeReturnPath(stored) ? landingFor("parent", stored) : null;
}
