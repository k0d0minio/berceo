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
 *
 * A care request (demande-de-garde) is a family's night: its date, start time,
 * children and commune, never its address or anything about health (D-20).
 * A professional answers it (`care_request_applications`) and the family books
 * one answer (`bookings`, candidature-et-reservation); the address still stays
 * in `family_profiles`, read live for her booking only (D-77).
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
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
// Care requests
// ---------------------------------------------------------------------------

/**
 * `ouverte` until the family cancels it or books an answer (`attribuee`,
 * candidature-et-reservation). The time-driven statuses come with
 * cycle-de-garde-et-annulation (D-17).
 */
export const careRequestStatusEnum = pgEnum("care_request_status", [
  "ouverte",
  "annulee",
  "attribuee",
]);

/** The guide's two options: « Un bébé », « Jumeaux ». */
export const careRequestChildrenEnum = pgEnum("care_request_children", ["un_bebe", "jumeaux"]);

export const babyAgeUnitEnum = pgEnum("baby_age_unit", ["semaines", "mois"]);

/**
 * One night a family asks for (D-20). The commune is copied from her profile
 * when she publishes (D-63), so a later change of profile never moves it, and
 * no address column exists here: a professional only ever learns the commune
 * (D-15). The rules that depend on today (the date windows, a night already
 * started) live in `src/lib/demandes/rules.ts`; the checks below hold the rest.
 * The end of the night is start + 11 hours, never stored.
 */
export const careRequests = pgTable(
  "care_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyUserId: uuid("family_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: careRequestStatusEnum("status").notNull().default("ouverte"),
    /** Fixed at publication (D-60): tonight or tomorrow night. */
    urgent: boolean("urgent").notNull(),
    nightDate: date("night_date").notNull(),
    /** A half hour from 18:00 to 23:00, stored as `HH:MM:SS`. */
    startTime: time("start_time").notNull(),
    children: careRequestChildrenEnum("children").notNull(),
    babyAgeValue: smallint("baby_age_value").notNull(),
    babyAgeUnit: babyAgeUnitEnum("baby_age_unit").notNull(),
    communeIns: text("commune_ins").notNull(),
    postcode: text("postcode").notNull(),
    locality: text("locality").notNull(),
    /** When the family ticked « Mon enfant n'a pas de condition médicale particulière… ». */
    noMedicalConditionAt: timestamp("no_medical_condition_at", { withTimezone: true }).notNull(),
    /** Set when a daily digest carried it (normal requests only); null until then. */
    digestSentAt: timestamp("digest_sent_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    /**
     * The professional the family sent it to « en priorité » (D-71): set once,
     * never changed. She sees it whatever her communes; nobody else waits.
     */
    priorityProfileId: uuid("priority_profile_id").references(() => professionalProfiles.id, {
      onDelete: "set null",
    }),
    prioritySentAt: timestamp("priority_sent_at", { withTimezone: true }),
    /** How many times the family republished it (D-70); keys the urgent e-mail again. */
    republishCount: smallint("republish_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("care_requests_priority_profile_id_idx").on(table.priorityProfileId),
    index("care_requests_commune_status_night_idx").on(
      table.communeIns,
      table.status,
      table.nightDate,
    ),
    index("care_requests_family_user_id_idx").on(table.familyUserId),
    // A family holds at most one open request per night (D-65).
    uniqueIndex("care_requests_one_open_per_night")
      .on(table.familyUserId, table.nightDate)
      .where(sql`${table.status} = 'ouverte'`),
    // What the next digest has to carry.
    index("care_requests_digest_pending_idx")
      .on(table.createdAt)
      .where(sql`${table.digestSentAt} IS NULL AND NOT ${table.urgent}`),
    check(
      "care_requests_start_time_slot",
      sql`${table.startTime} BETWEEN '18:00' AND '23:00' AND date_part('minute', ${table.startTime}) IN (0, 30) AND date_part('second', ${table.startTime}) = 0`,
    ),
    check(
      "care_requests_baby_age_range",
      sql`(${table.babyAgeUnit} = 'semaines' AND ${table.babyAgeValue} BETWEEN 0 AND 12) OR (${table.babyAgeUnit} = 'mois' AND ${table.babyAgeValue} BETWEEN 1 AND 24)`,
    ),
    check(
      "care_requests_cancelled_at",
      sql`(${table.status} = 'annulee') = (${table.cancelledAt} IS NOT NULL)`,
    ),
    // A profile deleted later clears the id and leaves the moment: only a set id needs one.
    check(
      "care_requests_priority_sent_at",
      sql`${table.priorityProfileId} IS NULL OR ${table.prioritySentAt} IS NOT NULL`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Answers and bookings
// ---------------------------------------------------------------------------

/**
 * An answer's life: `en_attente` while the family chooses; `retenue` when she
 * books it; `non_retenue` when she books another, republishes or cancels
 * (D-70, D-76), never to answer that request again; `retiree` when the
 * professional withdraws it, or when she is booked elsewhere that night (D-73).
 */
export const applicationStatusEnum = pgEnum("application_status", [
  "en_attente",
  "retenue",
  "non_retenue",
  "retiree",
]);

/**
 * « Je suis disponible pour cette garde »: one row per professional per
 * request, re-answering after a withdrawal updates it. The rate is hers at
 * the moment she answered (D-74): what the family compares and what a booking
 * carries.
 */
export const careRequestApplications = pgTable(
  "care_request_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => careRequests.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").notNull().default("en_attente"),
    nightRateEur: integer("night_rate_eur").notNull(),
    /** Her latest « Je suis disponible », a re-answer included. */
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
    /** How many times she answered; keys the family's e-mail per answer. */
    answerCount: smallint("answer_count").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("care_request_applications_request_profile_key").on(table.requestId, table.profileId),
    index("care_request_applications_profile_status_idx").on(table.profileId, table.status),
    // One booked answer per request, whatever races.
    uniqueIndex("care_request_applications_one_retenue")
      .on(table.requestId)
      .where(sql`${table.status} = 'retenue'`),
    check(
      "care_request_applications_night_rate_range",
      sql`${table.nightRateEur} BETWEEN 100 AND 300`,
    ),
  ],
);

/**
 * The night two people agreed on. Made from one answer, for one request, and
 * one per professional per night (D-73). It carries no address: the
 * professional reads the family's through `src/lib/famille/` (D-77). Its
 * status, cancellation and the time-driven states come with
 * cycle-de-garde-et-annulation.
 */
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .unique()
      .references(() => careRequests.id, { onDelete: "cascade" }),
    applicationId: uuid("application_id")
      .notNull()
      .unique()
      .references(() => careRequestApplications.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    familyUserId: uuid("family_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The request's night, copied so the index below can hold one garde a night. */
    nightDate: date("night_date").notNull(),
    nightRateEur: integer("night_rate_eur").notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("bookings_profile_night_key").on(table.profileId, table.nightDate),
    index("bookings_family_night_idx").on(table.familyUserId, table.nightDate),
    check("bookings_night_rate_range", sql`${table.nightRateEur} BETWEEN 100 AND 300`),
  ],
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
export type CareRequest = typeof careRequests.$inferSelect;
export type CareRequestStatus = (typeof careRequestStatusEnum.enumValues)[number];
export type CareRequestChildren = (typeof careRequestChildrenEnum.enumValues)[number];
export type BabyAgeUnit = (typeof babyAgeUnitEnum.enumValues)[number];
export type CareRequestApplication = typeof careRequestApplications.$inferSelect;
export type ApplicationStatus = (typeof applicationStatusEnum.enumValues)[number];
export type Booking = typeof bookings.$inferSelect;
