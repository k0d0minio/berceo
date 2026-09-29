import "server-only";

import { eq, sql } from "drizzle-orm";

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

/*
 * An orphan is a Neon Auth identity with no `users` row: its sign-up created
 * the identity, then the row's batch failed. It opens nothing and cannot be
 * finished in place (its role and phone were never stored), so the sign-up
 * removes it (D-159, D-160). These two are the only reads and deletes of a
 * `neon_auth` identity the accounts code makes.
 */

/** The Neon Auth identity for an address (lower-cased), and whether a `users` row carries it. */
export async function identityByEmail(
  email: string,
): Promise<{ authUserId: string; hasRow: boolean } | null> {
  const result = await db.execute<{ id: string; has_row: boolean }>(sql`
    select u.id::text as id,
      exists (select 1 from ${users} where ${users.authUserId} = u.id::text) as has_row
    from neon_auth."user" u
    where lower(u.email) = ${email}
    limit 1
  `);
  const [row] = result.rows;
  return row ? { authUserId: row.id, hasRow: row.has_row } : null;
}

/**
 * Deletes the identity only if no `users` row carries its id, in the same
 * statement, so a row written in between is never cut from its identity. Its
 * password (`account`) and sessions go with it (foreign keys on cascade).
 * True when an identity was deleted.
 */
export async function deleteOrphanIdentity(authUserId: string): Promise<boolean> {
  const result = await db.execute<{ id: string }>(sql`
    delete from neon_auth."user"
    where id::text = ${authUserId}
      and not exists (select 1 from ${users} where ${users.authUserId} = ${authUserId})
    returning id::text as id
  `);
  return result.rows.length > 0;
}
