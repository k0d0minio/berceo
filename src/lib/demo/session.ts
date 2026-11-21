import "server-only";

import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";

import { db, users, type User } from "@/db";

import { DEMO_COOKIE, demoEnvFrom, demoSignInAllowed, isDemoAddress } from "./switch";

/*
 * The demo session (JAM-462): on a local development server with the demo
 * switch on, the cookie `berceo-demo` holds the id of a demo account, and
 * `currentUser()` reads it in place of Neon Auth. No call goes to Neon Auth.
 * The walls are in `./switch.ts`; everywhere else this is never active.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True when this request runs in the local demo: the switch is on and the host is local. */
export async function demoSessionActive(): Promise<boolean> {
  const env = demoEnvFrom(process.env);
  if (env.flag !== "1") return false;
  return demoSignInAllowed(env, (await headers()).get("host"));
}

/** The demo account the cookie names, or null. Only a demo address is ever read as signed in. */
export async function demoSessionUser(): Promise<User | null> {
  const id = (await cookies()).get(DEMO_COOKIE)?.value;
  if (!id || !UUID.test(id)) return null;
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!row || !isDemoAddress(row.email)) return null;
  return row;
}

/** The demo account of `email`, for the sign-in route. */
export async function demoAccount(email: string): Promise<User | null> {
  if (!isDemoAddress(email)) return null;
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

/** Ends the demo session: the cookie goes. */
export async function endDemoSession(): Promise<void> {
  (await cookies()).delete(DEMO_COOKIE);
}
