/**
 * Drizzle schema for the Berceo database (Neon Postgres).
 *
 * Identity lives in Neon Auth's own `neon_auth` schema, which Neon manages and
 * this file never declares. The app's `users` row carries the persona and the
 * product fields, joined to Neon Auth by `auth_user_id`. Consent is an
 * append-only ledger beside it (`user_consents`), so a new version of the CGU
 * adds a row and the history of what each person accepted is kept (B-06).
 *
 * A professional's file (onboarding-professionnelle) is her profile, the
 * communes she serves, the documents she uploaded and the declarations she
 * accepted, each append-only where the history matters. `app_settings` holds
 * the founders' switches, and `admin_journal` every admin action, immutable.
 */
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { CONTEXT_MAX } from "../lib/famille/limits";

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
// The family's profile
// ---------------------------------------------------------------------------

/**
 * One row per parent, written at the first save of the profile. Kept off
 * `users` because `currentUser()` loads that row on every request and hands it
 * to every page: the address must travel nowhere but its owner's page (D-15).
 * Only `src/lib/famille/` reads `street`, `house_number` and `box`.
 *
 * The commune is a locality of the official list (`src/lib/communes/`): its
 * postcode and name, and the commune's REFNIS code, which is what matching
 * keys on.
 */
export const familyProfiles = pgTable(
  "family_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    communeIns: text("commune_ins").notNull(),
    postcode: text("postcode").notNull(),
    locality: text("locality").notNull(),
    /** The address, optional until a booking is confirmed. */
    street: text("street"),
    houseNumber: text("house_number"),
    box: text("box"),
    /** A short optional line about the family; never health data. */
    context: text("context"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("family_profiles_commune_ins_idx").on(table.communeIns),
    check(
      "family_profiles_context_length",
      sql`char_length(${table.context}) <= ${sql.raw(String(CONTEXT_MAX))}`,
    ),
  ],
);

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

// ---------------------------------------------------------------------------
// The professional's file
// ---------------------------------------------------------------------------

/**
 * Where a professional's file stands. `brouillon` while she fills the four
 * steps, `en_attente` once submitted. The founders' review (stub 5) sets the
 * last three; only a `valide` profile may ever be shown to anyone but its owner
 * and the admins.
 */
export const profileStatusEnum = pgEnum("profile_status", [
  "brouillon",
  "en_attente",
  "complement_demande",
  "valide",
  "refuse",
]);

/** The guide's four professions (D-7: students are gated by `app_settings`). */
export const professionEnum = pgEnum("profession", [
  "sage_femme",
  "infirmiere_neonatologie",
  "puericultrice",
  "etudiante_sage_femme",
]);

export const experienceEnum = pgEnum("experience", [
  "moins_d_un_an",
  "un_a_trois_ans",
  "trois_a_cinq_ans",
  "plus_de_cinq_ans",
]);

/** What an uploaded file is: a qualification document, or her photo. */
export const documentKindEnum = pgEnum("document_kind", [
  "diplome",
  "attestation_inscription",
  "photo",
]);

/** The five step-4 declarations: the cahier des charges' four, and the criminal record (D-6). */
export const declarationEnum = pgEnum("declaration", [
  "documents_authentiques",
  "autorisee_a_exercer",
  "fausse_declaration",
  "verifications",
  "casier_judiciaire",
]);

/**
 * One per professional. The step-2 fields are nullable so a step can be saved
 * half-filled (D-21); whether a step is complete is decided in code
 * (`src/lib/professionnelle/`). The rate and the bio are also held here, so
 * nothing outside 100 to 300 € or over 500 characters is ever stored (D-4).
 */
export const professionalProfiles = pgTable(
  "professional_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    status: profileStatusEnum("status").notNull().default("brouillon"),
    profession: professionEnum("profession"),
    /** Keys of the draft list in `src/lib/professionnelle/`. */
    specialisations: text("specialisations").array().notNull().default(sql`'{}'::text[]`),
    experience: experienceEnum("experience"),
    nightRateEur: integer("night_rate_eur"),
    bio: text("bio"),
    /** Eleven digits, never shown to families. */
    inamiNumber: text("inami_number"),
    /** Set when she submits, and again when a change sends a validated file back to review. */
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    /**
     * The founders' last word on the file (verification-back-office): the reason
     * of a complément or a refusal, which she reads in her e-mail and her space,
     * cleared on validation; and when the last decision was taken. A refused
     * file's documents are purged thirty days after `reviewed_at`.
     */
    reviewReason: text("review_reason"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "professional_profiles_night_rate_range",
      sql`${table.nightRateEur} IS NULL OR (${table.nightRateEur} BETWEEN 100 AND 300)`,
    ),
    check(
      "professional_profiles_bio_length",
      sql`${table.bio} IS NULL OR char_length(${table.bio}) <= 500`,
    ),
    check(
      "professional_profiles_inami_format",
      sql`${table.inamiNumber} IS NULL OR ${table.inamiNumber} ~ '^[0-9]{11}$'`,
    ),
  ],
);

/**
 * The communes she serves, by REFNIS (INS) code (D-11), the key the family's
 * commune carries too (`family_profiles.commune_ins`); the register is
 * src/lib/communes/.
 */
export const professionalCommunes = pgTable(
  "professional_communes",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    communeIns: text("commune_ins").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.communeIns] }),
    index("professional_communes_commune_ins_idx").on(table.communeIns),
  ],
);

/**
 * Every file she uploaded and still has: her documents and her photo. The
 * object lives in the private bucket under `storage_key`; a replaced or removed
 * file loses its row and its object at once.
 */
export const professionalDocuments = pgTable(
  "professional_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    kind: documentKindEnum("kind").notNull(),
    storageKey: text("storage_key").notNull().unique(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("professional_documents_profile_id_idx").on(table.profileId)],
);

/**
 * One row per declaration accepted, never updated: the wording version and the
 * moment (B-07). A file sent back to review appends a fresh set.
 */
export const professionalDeclarations = pgTable(
  "professional_declarations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    declaration: declarationEnum("declaration").notNull(),
    version: text("version").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("professional_declarations_profile_id_idx").on(table.profileId)],
);

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/**
 * The founders' switches, one row per key. No row means the default (off).
 * Today: `etudiantes_admises` (D-7).
 */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
});

// ---------------------------------------------------------------------------
// The admin journal
// ---------------------------------------------------------------------------

/** What an admin did (the guide's "Journal des actions administratives"). */
export const adminActionEnum = pgEnum("admin_action", [
  "profil_valide",
  "complement_demande",
  "profil_refuse",
  "reglage_etudiantes",
  "documents_supprimes",
]);

/**
 * One row per admin action, never changed: a trigger in the migration refuses
 * any UPDATE, DELETE or TRUNCATE, and the code has no path to either. The
 * account concerned and the administrator are ids with their names as they
 * were, without foreign keys, so deleting an account later never rewrites an
 * entry. No administrator means Berceo did it (the purge).
 */
export const adminJournal = pgTable(
  "admin_journal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    action: adminActionEnum("action").notNull(),
    subjectUserId: uuid("subject_user_id"),
    subjectName: text("subject_name"),
    adminUserId: uuid("admin_user_id"),
    adminName: text("admin_name"),
    /** The reason given, or the switch's new value. */
    detail: text("detail"),
  },
  (table) => [
    index("admin_journal_occurred_at_idx").on(table.occurredAt),
    index("admin_journal_subject_user_id_idx").on(table.subjectUserId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type FamilyProfile = typeof familyProfiles.$inferSelect;
export type UserConsent = typeof userConsents.$inferSelect;
export type ConsentDocument = (typeof consentDocumentEnum.enumValues)[number];
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type ProfileStatus = (typeof profileStatusEnum.enumValues)[number];
export type Profession = (typeof professionEnum.enumValues)[number];
export type Experience = (typeof experienceEnum.enumValues)[number];
export type DocumentKind = (typeof documentKindEnum.enumValues)[number];
export type AdminAction = (typeof adminActionEnum.enumValues)[number];
export type AdminJournalEntry = typeof adminJournal.$inferSelect;
export type Declaration = (typeof declarationEnum.enumValues)[number];
export type ProfessionalDocument = typeof professionalDocuments.$inferSelect;
