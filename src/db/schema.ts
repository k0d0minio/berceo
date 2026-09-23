/**
 * Drizzle schema for the Berceo database (Neon Postgres).
 *
 * One table for now: `users`, the people on either side of the marketplace and
 * the team behind it. The authentication provider is not chosen yet, so this
 * row carries identity and role only — the credential or external-id column is
 * a later migration, once the provider is decided (`.icm/_shared/project-rules.md`
 * → The factory → Migrations). Nothing else lives here until a spec says so.
 */
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

/**
 * The three personas the engagement names (`.icm/project.json` → `personas`):
 * a parent booking a night, a professional taking the shift, the Berceo team.
 */
export const userRoleEnum = pgEnum("user_role", ["parent", "professionnel", "admin"]);

/**
 * Every account, whichever side of the marketplace it is on.
 *
 * No default role: an insert says which persona it creates, so a row can never
 * silently become a parent or a professional by omission.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Sign-in identity. Stored lower-cased so lookups are case-insensitive. */
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
