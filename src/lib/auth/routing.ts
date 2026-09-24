import type { UserRole } from "@/db/schema";

/**
 * Where each role lives and who may open what. Pure, so the redirect table in
 * the spec is a test, not a reading of three layouts.
 *
 * - parent → /espace/famille, professionnel → /espace/professionnelle,
 *   admin → /admin.
 * - Another role's space sends you to your own.
 * - /admin answers 404 to anyone but an admin, so it never confirms it exists.
 */

export const SPACES = {
  parent: "/espace/famille",
  professionnel: "/espace/professionnelle",
  admin: "/admin",
} as const satisfies Record<UserRole, string>;

export const SIGN_IN_PATH = "/connexion";

export type Access =
  | { kind: "allow" }
  | { kind: "redirect"; to: string }
  | { kind: "not-found" };

export function homeFor(role: UserRole): string {
  return SPACES[role];
}

function within(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** What `role` gets on `pathname`, for any path under a space or /admin. */
export function accessFor(role: UserRole | null, pathname: string): Access {
  if (within(pathname, SPACES.admin)) {
    return role === "admin" ? { kind: "allow" } : { kind: "not-found" };
  }

  if (role === null) {
    return { kind: "redirect", to: signInWithReturn(pathname) };
  }

  for (const [owner, base] of Object.entries(SPACES) as [UserRole, string][]) {
    if (within(pathname, base)) {
      return owner === role
        ? { kind: "allow" }
        : { kind: "redirect", to: homeFor(role) };
    }
  }

  // Anywhere else under /espace (a space that does not exist) goes home.
  return { kind: "redirect", to: homeFor(role) };
}

/**
 * A `retour` value we are willing to send someone to after signing in: only
 * a path inside a space, never another origin (`//evil`, `https:`, `\`).
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  const pathname = value.split(/[?#]/)[0];
  const isSpace =
    within(pathname, "/espace") || within(pathname, SPACES.admin);
  return isSpace ? value : null;
}

export function signInWithReturn(pathname: string): string {
  const retour = safeReturnPath(pathname);
  return retour
    ? `${SIGN_IN_PATH}?retour=${encodeURIComponent(retour)}`
    : SIGN_IN_PATH;
}

/** Where a signed-in `role` lands: back where it was going, if it may, else home. */
export function landingFor(role: UserRole, retour: string | null | undefined): string {
  const safe = safeReturnPath(retour);
  if (safe && accessFor(role, safe.split(/[?#]/)[0]).kind === "allow") return safe;
  return homeFor(role);
}
