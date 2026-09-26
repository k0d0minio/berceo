import "server-only";

import { cache } from "react";

import type { User } from "@/db";

import { getAuth } from "./server";
import { userByAuthId } from "./users";

/**
 * Who is asking, in one read per request: the Neon Auth session joined to the
 * app's `users` row. Every page and action asks here, never the session alone,
 * because the role lives on the row.
 *
 * - `signed-out`: no session.
 * - `unverified`: a session whose e-mail is not confirmed (Neon Auth should
 *   not issue one, but a space must not open if it does).
 * - `no-row`: an identity with no `users` row, e.g. a sign-up whose row write
 *   failed. It opens nothing and is logged.
 * - `suspended`: a founder suspended the account (back-office-admin, D-134).
 *   It opens nothing; its session ends on the next page (`SUSPENDED_PATH`).
 */
export type CurrentUser =
  | { status: "signed-out" }
  | { status: "unverified"; email: string }
  | { status: "no-row"; authUserId: string }
  | { status: "suspended"; user: User }
  | { status: "ok"; user: User };

export const currentUser = cache(async (): Promise<CurrentUser> => {
  const { data } = await getAuth().getSession();
  const identity = data?.user;
  if (!identity) return { status: "signed-out" };

  if (!identity.emailVerified) {
    return { status: "unverified", email: identity.email };
  }

  const row = await userByAuthId(identity.id);

  if (!row) {
    console.error("[comptes] signed-in identity has no users row", {
      authUserId: identity.id,
    });
    return { status: "no-row", authUserId: identity.id };
  }

  if (row.suspendedAt) return { status: "suspended", user: row };
  return { status: "ok", user: row };
});
