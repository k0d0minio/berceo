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

/**
 * Whether a `users` row carries the address (lower-cased, as the sign-up
 * stores it). The sign-up asks before it makes an identity, so a known address
 * makes none (JAM-342). Every row counts, a suspended one too: only a deleted
 * account frees its address, because its row no longer carries it (D-136).
 */
export async function userExistsByEmail(email: string): Promise<boolean> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return row !== undefined;
}

/** The constraint a second `users` row for one address breaks (drizzle/0000_users.sql). */
const USERS_EMAIL_UNIQUE = "users_email_unique";

/**
 * True when a write failed on Postgres' unique_violation (23505) for the
 * address: a second sign-up wrote the row between this one's read and its
 * insert (JAM-342). Drizzle may wrap the driver's error, so the cause is read
 * too. A 23505 on a different constraint is not this.
 */
export function isEmailTaken(error: unknown): boolean {
  const cause = error && typeof error === "object" && "cause" in error ? error.cause : undefined;
  return [error, cause].some((candidate) => {
    if (!candidate || typeof candidate !== "object") return false;
    const { code, constraint, message } = candidate as { code?: unknown; constraint?: unknown; message?: unknown };
    if (code !== "23505") return false;
    if (typeof constraint === "string") return constraint === USERS_EMAIL_UNIQUE;
    return typeof message === "string" && message.includes(USERS_EMAIL_UNIQUE);
  });
}

/*
 * An orphan is a Neon Auth identity with no `users` row: its sign-up created
 * the identity, then the row's batch failed. It opens nothing and cannot be
 * finished in place (its role and phone were never stored), so the sign-up
 * removes it (D-159, D-160). These two are the only reads and deletes of a
 * `neon_auth` identity the accounts code makes.
 */

/**
 * How long a new identity is left to its own sign-up. Its `users` row is
 * written right after Neon Auth answers, so a younger identity with no row may
 * be a sign-up still in flight (a second tab, a resubmitted form), never an
 * orphan: deleting it would leave that sign-up's row joined to nothing (D-172).
 */
const SIGN_UP_GRACE = sql`interval '5 minutes'`;

/**
 * The address's (lower-cased) Neon Auth identity when no `users` row carries
 * it, and whether it is past the grace; null when there is none, or when it has
 * its row (a real account).
 */
export async function orphanByEmail(
  email: string,
): Promise<{ authUserId: string; pastGrace: boolean } | null> {
  const result = await db.execute<{ id: string; past_grace: boolean }>(sql`
    select u.id::text as id, u."createdAt" < now() - ${SIGN_UP_GRACE} as past_grace
    from neon_auth."user" u
    where lower(u.email) = ${email}
      and not exists (select 1 from ${users} where ${users.authUserId} = u.id::text)
    limit 1
  `);
  const [row] = result.rows;
  return row ? { authUserId: row.id, pastGrace: row.past_grace } : null;
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
