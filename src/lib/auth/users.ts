import "server-only";

import { eq } from "drizzle-orm";

import { db, users, type User } from "@/db";

/**
 * The app's `users` row for a Neon Auth identity, or null when the sign-up
 * never wrote one. The one read of that join: `currentUser()`, sign-in and the
 * verification confirmer all ask here, and each decides what a missing row
 * means for it (and logs it).
 */
export async function userByAuthId(authUserId: string): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.authUserId, authUserId)).limit(1);
  return row ?? null;
}
