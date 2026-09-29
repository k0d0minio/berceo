import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * A suspended account (back-office-admin, D-134) opens nothing and is shown to
 * no one. `currentUser()` refuses it on every request; every reader that could
 * show a professional or a family to someone else, or put them in front of a
 * new request, answer, booking, rating or e-mail, holds it out with
 * `notSuspended` (or reads `suspended` as a flag). A deleted account stays
 * suspended (D-136), so the same predicate hides it too.
 *
 * These two are the only place a reader states the rule (suspension-one-predicate,
 * D-169): `suspension-isolation.test.ts` refuses it written anywhere else.
 *
 * Each takes the column (or expression) holding the user's id, whatever table
 * it is on, and reads `users` under its own alias, so it composes with a query
 * that already joins `users`.
 */
export function suspended(userId: AnyPgColumn | SQL): SQL {
  return sql`exists (select 1 from users as su where su.id = ${userId} and su.suspended_at is not null)`;
}

export function notSuspended(userId: AnyPgColumn | SQL): SQL {
  return sql`not ${suspended(userId)}`;
}

/** Where a suspended account lands: the route that ends its session and shows why. */
export const SUSPENDED_PATH = "/connexion/suspendu";

/**
 * True only inside the batch that suspended `userId` at exactly `at`: the
 * statements a suspension carries (withdrawn answers, cancelled requests) take
 * effect only if the suspension itself did, in the same transaction.
 */
export function suspendedAtExactly(userId: string, at: Date): SQL {
  return sql`exists (select 1 from users as su where su.id = ${userId} and su.suspended_at = ${at.toISOString()}::timestamptz)`;
}

/** The same guard for a deletion: the batch that anonymised `userId` at exactly `at`. */
export function deletedAtExactly(userId: string, at: Date): SQL {
  return sql`exists (select 1 from users as su where su.id = ${userId} and su.deleted_at = ${at.toISOString()}::timestamptz)`;
}
