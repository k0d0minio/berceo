import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * A suspended account (back-office-admin, D-134) opens nothing and is shown to
 * no one. `currentUser()` refuses it on every request; every reader that could
 * show a professional or a family to someone else, or put them in front of a
 * new request, answer or booking, holds it out with this predicate. A deleted
 * account stays suspended (D-136), so the same predicate hides it too.
 *
 * It takes the column holding the user's id, whatever table it is on, and
 * reads `users` under its own alias, so it composes with a query that already
 * joins `users`.
 */
export function notSuspended(userId: AnyPgColumn | SQL): SQL {
  return sql`not exists (select 1 from users as su where su.id = ${userId} and su.suspended_at is not null)`;
}

/** Where a suspended account lands: the route that ends its session and shows why. */
export const SUSPENDED_PATH = "/connexion/suspendu";
