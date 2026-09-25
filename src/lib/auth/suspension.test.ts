import { beforeAll, describe, expect, it } from "vitest";

/**
 * Spec (back-office-admin, D-134): a suspended account is held out of every
 * reader by one predicate on the column that holds its id. The queries are
 * built, never run.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

describe("notSuspended", () => {
  it("reads users under its own alias, so it composes with a query that joins users", async () => {
    const { db, professionalProfiles, users } = await import("@/db");
    const { eq } = await import("drizzle-orm");
    const { notSuspended } = await import("./suspension");
    const { sql } = db
      .select({ id: professionalProfiles.id })
      .from(professionalProfiles)
      .innerJoin(users, eq(users.id, professionalProfiles.userId))
      .where(notSuspended(professionalProfiles.userId))
      .toSQL();
    expect(sql).toContain(
      'not exists (select 1 from users as su where su.id = "professional_profiles"."user_id" and su.suspended_at is not null)',
    );
  });

  it("sends a suspended session to the route that ends it", async () => {
    const { SUSPENDED_PATH } = await import("./suspension");
    expect(SUSPENDED_PATH).toBe("/connexion/suspendu");
  });
});
