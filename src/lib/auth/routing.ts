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
export const FAMILY_SIGN_UP_PATH = "/inscription-famille";

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
  const pathname = pathnameOf(value);
  const isSpace =
    within(pathname, "/espace") || within(pathname, SPACES.admin);
  return isSpace ? value : null;
}

/** A path without its query or fragment: what the role checks read. */
export function pathnameOf(path: string): string {
  return path.split(/[?#]/)[0];
}

/**
 * A page's own path with the query it was opened with, for the way back
 * through sign-in: a family sent to sign in from a search returns to that
 * search, not the bare page. `undefined` values are dropped, arrays repeated.
 */
export function withQuery(
  path: string,
  params: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    for (const one of Array.isArray(value) ? value : [value]) query.append(key, one);
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

export function signInWithReturn(pathname: string): string {
  const retour = safeReturnPath(pathname);
  return retour
    ? `${SIGN_IN_PATH}?retour=${encodeURIComponent(retour)}`
    : SIGN_IN_PATH;
}

/**
 * An account page's address carrying the way back (`retour`), when the way
 * back is one we accept; the bare page otherwise. Sign-in and family sign-up
 * link to each other with it, so a visitor sent to sign in from a full
 * profile can create her account instead and still return (D-129).
 */
export function withReturn(page: string, retour: string | null | undefined): string {
  const safe = safeReturnPath(retour);
  return safe ? `${page}?retour=${encodeURIComponent(safe)}` : page;
}

/** Where a signed-in `role` lands: back where it was going, if it may, else home. */
export function landingFor(role: UserRole, retour: string | null | undefined): string {
  const safe = safeReturnPath(retour);
  if (safe && accessFor(role, pathnameOf(safe)).kind === "allow") return safe;
  return homeFor(role);
}
