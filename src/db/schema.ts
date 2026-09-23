/**
 * Drizzle schema for the Berceo database (Neon Postgres).
 *
 * Identity lives in Neon Auth's own `neon_auth` schema, which Neon manages and
 * this file never declares. The app's `users` row carries the persona and the
 * product fields, joined to Neon Auth by `auth_user_id`. Consent is an
 * append-only ledger beside it (`user_consents`), so a new version of the CGU
 * adds a row and the history of what each person accepted is kept (B-06).
 */
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

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
 * silently become a parent or a professional by omission. The role is the only
 * source of the persona; Neon Auth's own `role` field is not used.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * The Neon Auth user id (`neon_auth.user.id`). No foreign key: that schema
   * is Neon's, and Drizzle does not own it.
   */
  authUserId: text("auth_user_id").notNull().unique(),
  /** Sign-in identity. Stored lower-cased so lookups are case-insensitive. */
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  /**
   * E.164. Required by both sign-up forms, nullable here so an admin account
   * granted from the command line needs none. Never verified by SMS (D-27).
   */
  phone: text("phone"),
  role: userRoleEnum("role").notNull(),
  /** Set once, when the family's welcome e-mail leaves; null until then. */
  welcomeSentAt: timestamp("welcome_sent_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Consent
// ---------------------------------------------------------------------------

/** The two documents a sign-up accepts: the CGU and the privacy policy. */
export const consentDocumentEnum = pgEnum("consent_document", [
  "cgu",
  "confidentialite",
]);

/**
 * One row per document accepted, never updated: the version and the moment,
 * so the founders can show what each person agreed to and when.
 */
export const userConsents = pgTable(
  "user_consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    document: consentDocumentEnum("document").notNull(),
    version: text("version").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("user_consents_user_id_idx").on(table.userId)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserConsent = typeof userConsents.$inferSelect;
export type ConsentDocument = (typeof consentDocumentEnum.enumValues)[number];
