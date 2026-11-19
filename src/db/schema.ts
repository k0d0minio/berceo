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
 * children, their feeding and commune, never its address or anything about
 * health (D-20): the feeding is a care instruction for the night.
 * A professional answers it (`care_request_applications`) and the family books
 * one answer (`bookings`, candidature-et-reservation); the address still stays
 * in `family_profiles`, read live for her booking only (D-77).
 *
 * A professional's indicative availability (disponibilites-indicatives) is the
 * nights she marked available; nothing about a care request reads it (D-12).
 *
 * Each answer carries one conversation between the family and the
 * professional (`conversations`, `messages`, messagerie), open until the
 * night ends (D-89).
 *
 * The service fee (frais-de-service) is one `payments` row per Stripe
 * Checkout opened, linked to the booking its payment made (D-102, D-93).
 *
 * A family's subscription (abonnements-familles) is one `subscriptions` row
 * per Stripe subscription, at most one live per family; her Stripe customer
 * is on `users`.
 *
 * After a garde each side rates the other with stars (avis-etoiles, D-18):
 * `ratings`, four whole scores and no text, and `rating_invitations`, the
 * e-mail that asked for them, once per garde and side.
 *
 * A family keeps her favourite professionals (favoris-marquer) in
 * `favourites`, hers alone.
 *
 * A professional and a founder give a six-digit code after their password
 * (comptes-2fa): `sign_in_codes` holds the live code's hash, `trusted_devices`
 * the hash of each device a correct code trusted for 30 days.
 *
 * The founders' back-office (back-office-admin) suspends and deletes accounts
 * on `users` (a deleted account is anonymised, never removed, D-136) and marks
 * a cancelled garde handled on `bookings`.
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
 * The three personas the engagement names:
 * a parent booking a night, a professional taking the shift, the Berceo team.
 */
export const userRoleEnum = pgEnum("user_role", ["parent", "professionnel", "admin"]);

/**
 * The four family plans of the devis, in its order (abonnements-familles).
 * Declared before `users`, whose `signup_plan` names one.
 */
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["decouverte", "parenthese", "serenite", "premium"]);

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
  /**
   * Set by a founder's « Suspendre le compte » (back-office-admin, D-134): a
   * suspended account opens nothing and is shown to no one. Who did it is an
   * id without a foreign key, like the journal's.
   */
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  suspendedBy: uuid("suspended_by"),
  /** Set by « Supprimer le compte »: the row is anonymised and stays suspended (D-136, D-137). */
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  /**
   * The family's Stripe customer, made at her first subscription Checkout
   * and kept for every later one (abonnements-catalogue-stripe).
   */
  stripeCustomerId: text("stripe_customer_id").unique(),
  /**
   * The plan a family picked on the sign-up form (abonnements-inscription-famille):
   * the Checkout her e-mail confirmation opens, and the one her space asks her
   * to finish. Null for a professional, an admin, and a family who signed up
   * before the plans were part of sign-up.
   */
  signupPlan: subscriptionPlanEnum("signup_plan"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("users_deleted_suspended", sql`${table.deletedAt} IS NULL OR ${table.suspendedAt} IS NOT NULL`),
]);

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
// The second factor at sign-in
// ---------------------------------------------------------------------------

/**
 * The six-digit code a professional or a founder types after her password
 * (comptes-2fa). The site makes it, sends it by e-mail and checks it; Neon
 * Auth never sees it. The row holds the code's SHA-256 only, never the code.
 * At most one live row per user: a new code deletes the older ones. The
 * rules (its life, the tries, the resend gap) are in
 * `src/lib/auth/second-factor.ts`; `second-factor-store.ts` is the only reader
 * and writer. A family never gets a row.
 */
export const signInCodes = pgTable(
  "sign_in_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 of the six digits, hex. */
    codeHash: text("code_hash").notNull(),
    /** Wrong tries so far. The fifth ends the code. */
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sign_in_codes_user_id_idx").on(table.userId)],
);

/**
 * A device a correct code (or a new professional's verification link) trusted
 * for 30 days: the browser holds the raw token in the cookie `berceo-appareil`,
 * the row its SHA-256. A trusted device skips the code, never the password.
 * The row is read once per request by `currentUser()`, for a professional
 * or a founder only.
 */
export const trustedDevices = pgTable(
  "trusted_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 of the random 32-byte token the cookie holds, hex. */
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("trusted_devices_user_id_idx").on(table.userId)],
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

/**
 * The three professions and the two student years (D-7: students are gated by
 * `app_settings`). 0015 renamed `etudiante_sage_femme` to the third year, so
 * the files that carried it moved there (profil-professions-inami).
 */
export const professionEnum = pgEnum("profession", [
  "sage_femme",
  "infirmiere_neonatologie",
  "puericultrice",
  "etudiante_sage_femme_3e",
  "etudiante_sage_femme_4e",
]);

/** What an uploaded file is: a qualification document, or her photo. */
export const documentKindEnum = pgEnum("document_kind", [
  "diplome",
  "attestation_inscription",
  "photo",
]);

/**
 * The step-4 declarations: the cahier des charges' four, the criminal record (D-6),
 * the change of situation and the charter (onboarding-retour-1).
 */
export const declarationEnum = pgEnum("declaration", [
  "documents_authentiques",
  "autorisee_a_exercer",
  "fausse_declaration",
  "verifications",
  "casier_judiciaire",
  "changement_de_situation",
  "charte",
]);

/**
 * One per professional. The step-2 fields are nullable so a step can be saved
 * half-filled (D-21); whether a step is complete is decided in code
 * (`src/lib/professionnelle/`). The rates, the bio and the trainings are also
 * held here, so no night rate under 130 € (onboarding-retour-1, which lifts
 * D-4's ceiling), no extra hour under 1 €, no bio over 500 characters and no
 * trainings over 300 characters is ever stored.
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
    /** « Formations complémentaires », in her own words (onboarding-retour-1). */
    formationsComplementaires: text("formations_complementaires"),
    nightRateEur: integer("night_rate_eur"),
    /**
     * Her rate for each hour past the night's 11 (onboarding-retour-1). Null on
     * a draft, and on a file validated before the field existed.
     */
    extraHourRateEur: integer("extra_hour_rate_eur"),
    /**
     * How far she travels around her communes (profil-zone-rayon-saisie): 0 is
     * her communes only. `zone_whole_belgium` is « Toute la Belgique », with the
     * radius held at 0. The communes the radius reaches are `professional_reach`.
     */
    zoneRadiusKm: smallint("zone_radius_km").notNull().default(0),
    zoneWholeBelgium: boolean("zone_whole_belgium").notNull().default(false),
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
      "professional_profiles_night_rate_min",
      sql`${table.nightRateEur} IS NULL OR ${table.nightRateEur} >= 130`,
    ),
    check(
      "professional_profiles_extra_hour_rate_min",
      sql`${table.extraHourRateEur} IS NULL OR ${table.extraHourRateEur} >= 1`,
    ),
    check(
      "professional_profiles_bio_length",
      sql`${table.bio} IS NULL OR char_length(${table.bio}) <= 500`,
    ),
    check(
      "professional_profiles_formations_length",
      sql`${table.formationsComplementaires} IS NULL OR char_length(${table.formationsComplementaires}) <= 300`,
    ),
    check(
      "professional_profiles_inami_format",
      sql`${table.inamiNumber} IS NULL OR ${table.inamiNumber} ~ '^[0-9]{11}$'`,
    ),
    check("professional_profiles_zone_radius", sql`${table.zoneRadiusKm} IN (0, 10, 20, 30, 40, 50)`),
    check(
      "professional_profiles_zone_whole_belgium",
      sql`NOT ${table.zoneWholeBelgium} OR ${table.zoneRadiusKm} = 0`,
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
 * Every commune her radius reaches, her own communes included
 * (profil-zone-rayon-saisie), by REFNIS code: `communesWithin` in
 * src/lib/communes/ computes it on the server at each save of her zone, in the
 * batch that writes `professional_communes`. « Toute la Belgique » stores no
 * row: `professional_profiles.zone_whole_belgium` carries it.
 */
export const professionalReach = pgTable(
  "professional_reach",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    communeIns: text("commune_ins").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.communeIns] }),
    index("professional_reach_commune_ins_idx").on(table.communeIns),
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

/**
 * The nights a professional says she is likely free (disponibilites-indicatives,
 * D-12): one row per night marked « Disponible », named by the date of its
 * evening, like a care request's `night_date`. Two states only (D-81): an
 * unmarked night has no row, and « Indisponible » deletes it. Indicative:
 * nothing in the care requests reads this table.
 */
export const professionalAvailability = pgTable(
  "professional_availability",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    nightDate: date("night_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Also the index of the « Prochaines disponibilités » read.
  (table) => [primaryKey({ columns: [table.profileId, table.nightDate] })],
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

/** The guide's two options, « Un bébé », « Jumeaux », and the founders' « Triplés » (demande-retour-1). */
export const careRequestChildrenEnum = pgEnum("care_request_children", ["un_bebe", "jumeaux", "triples"]);

/** How the children are fed (demande-retour-1): a care instruction for the night, not health data. */
export const feedingEnum = pgEnum("feeding", [
  "allaitement_maternel",
  "lait_infantile",
  "allaitement_mixte",
]);

export const babyAgeUnitEnum = pgEnum("baby_age_unit", ["semaines", "mois"]);

/**
 * One night a family asks for (D-20). The commune and the night's address come
 * from the form, prefilled from her profile (demande-adresse-de-la-nuit, D-63
 * superseded), so a later change of profile never moves them. A professional
 * only ever learns the commune (D-15): only `src/lib/famille/` names the
 * `night_*` columns, and a test holds it. The rules that depend on today (the date windows, a night already
 * started) live in `src/lib/demandes/rules.ts`; the checks below hold the rest.
 * The end of the night is start + 11 hours + `extra_hours`, never stored
 * (`endTime` in the rules, `nightEnd` in `src/lib/demandes/night-end.ts`).
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
    /** Whole hours the family adds to the 11-hour night, 0 to 6 (feedback round 1). */
    extraHours: smallint("extra_hours").notNull().default(0),
    children: careRequestChildrenEnum("children").notNull(),
    babyAgeValue: smallint("baby_age_value").notNull(),
    babyAgeUnit: babyAgeUnitEnum("baby_age_unit").notNull(),
    /** Asked from demande-retour-1 on; null on a request published before. */
    feeding: feedingEnum("feeding"),
    communeIns: text("commune_ins").notNull(),
    postcode: text("postcode").notNull(),
    locality: text("locality").notNull(),
    /**
     * The night's address in the commune above. Null on a request published
     * before demande-adresse-de-la-nuit: the reveal reads her profile's then.
     */
    nightStreet: text("night_street"),
    nightHouseNumber: text("night_house_number"),
    nightBox: text("night_box"),
    /**
     * The family's optional answer to « Pourquoi souhaitez-vous être accompagné(e) la nuit ? »
     * (demande-motif-facultatif, D-20 superseded for this one field), 300 characters at most.
     * Never a card column: only the professional's request page and the founders' list read it.
     */
    reason: text("reason"),
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
    /**
     * When the family last republished it, and how many times (D-70): a normal
     * one republished after its digest is carried by the next one, and the
     * count keys the urgent e-mail again.
     */
    republishedAt: timestamp("republished_at", { withTimezone: true }),
    republishCount: smallint("republish_count").notNull().default(0),
    /**
     * The nights the family published together as « Nuits régulières »
     * (demande-nuits-regulieres): one request per night, one shared id. Null on
     * a one-off night. Each night keeps its own status, answers and booking.
     */
    seriesId: uuid("series_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("care_requests_priority_profile_id_idx").on(table.priorityProfileId),
    index("care_requests_series_id_idx").on(table.seriesId),
    index("care_requests_commune_status_night_idx").on(
      table.communeIns,
      table.status,
      table.nightDate,
    ),
    index("care_requests_family_user_id_idx").on(table.familyUserId),
    // A family holds at most one open or booked request per night (D-65,
    // widened by D-156): a cancelled one frees the night.
    uniqueIndex("care_requests_one_open_per_night")
      .on(table.familyUserId, table.nightDate)
      .where(sql`${table.status} in ('ouverte', 'attribuee')`),
    // What the next digest has to carry.
    index("care_requests_digest_pending_idx")
      .on(table.createdAt)
      .where(sql`${table.digestSentAt} IS NULL AND NOT ${table.urgent}`),
    check(
      "care_requests_start_time_slot",
      sql`${table.startTime} BETWEEN '18:00' AND '23:00' AND date_part('minute', ${table.startTime}) IN (0, 30) AND date_part('second', ${table.startTime}) = 0`,
    ),
    check("care_requests_extra_hours_range", sql`${table.extraHours} BETWEEN 0 AND 6`),
    check("care_requests_reason_length", sql`char_length(${table.reason}) <= 300`),
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
 * request, re-answering after a withdrawal updates it. The rates are hers at
 * the moment she answered (D-74): what the family compares and what a booking
 * carries. An answer given before the 130 € floor keeps its rate, so the
 * floor here stays 100 €.
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
    /** Her extra hour's rate when she answered; null when her profile had none. */
    extraHourRateEur: integer("extra_hour_rate_eur"),
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
    check("care_request_applications_night_rate_min", sql`${table.nightRateEur} >= 100`),
    check(
      "care_request_applications_extra_hour_rate_min",
      sql`${table.extraHourRateEur} IS NULL OR ${table.extraHourRateEur} >= 1`,
    ),
  ],
);

/**
 * A garde's stored status (D-109): `confirmee` from the payment, `annulee` once
 * either side cancels it or reports the other absent. À venir, en cours and
 * terminée are read from the night and the clock (`src/lib/gardes/rules.ts`),
 * never stored.
 */
export const bookingStatusEnum = pgEnum("booking_status", ["confirmee", "annulee"]);

/** One side of a garde: the side a cancellation is recorded against (D-105, D-106). */
export const bookingSideEnum = pgEnum("booking_side", ["famille", "professionnelle"]);

/** How a garde ended early: cancelled before its start, or an absence reported after it (D-106). */
export const cancellationKindEnum = pgEnum("cancellation_kind", ["annulation", "absence"]);

/**
 * Why a side cancelled its garde (annulations-delai-et-motif, the answers
 * [9.2]): one choice from its side's short list, never free text (D-20). The
 * family's are `plus_besoin`, `imprevu`, `autre_solution`; the professional's
 * `malade`, `empechement`, `indisponible`; `autre` is both sides'. The lists
 * are `CANCELLATION_REASONS` in `src/lib/gardes/rules.ts`.
 */
export const cancellationReasonEnum = pgEnum("cancellation_reason", [
  "plus_besoin",
  "imprevu",
  "autre_solution",
  "malade",
  "empechement",
  "indisponible",
  "autre",
]);

/**
 * The night two people agreed on. Made from one answer, for one request, and
 * one confirmed garde per professional per night (D-73). It carries no
 * address: the professional reads the family's through `src/lib/famille/`
 * (D-77). `src/lib/gardes/` writes its cancellation: `cancelled_by` is the side
 * responsible (the absent one for an absence), `cancelled_by_user_id` who
 * clicked (D-105, D-106), and `cancellation_reason` the reason that side chose
 * when it cancelled; an absence has none, and neither has a garde cancelled
 * before annulations-delai-et-motif. `disputed_at` marks an absence the side
 * reported absent contested: the garde is in « litige », and the founders
 * decide its fee (annulations-table, the answers [9.3]).
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
    /** The answer's extra hour's rate, copied with its night rate. */
    extraHourRateEur: integer("extra_hour_rate_eur"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }).notNull().defaultNow(),
    status: bookingStatusEnum("status").notNull().default("confirmee"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: bookingSideEnum("cancelled_by"),
    cancelledByUserId: uuid("cancelled_by_user_id").references(() => users.id, { onDelete: "set null" }),
    cancellationKind: cancellationKindEnum("cancellation_kind"),
    cancellationReason: cancellationReasonEnum("cancellation_reason"),
    /** When the reminder of the day before claimed it (D-108); null until then. */
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    /**
     * A founder's « Marquer comme traité » on a cancelled garde (back-office-admin,
     * D-139); `src/lib/admin/` writes it, and only on a cancelled garde. A
     * contest clears it, so the litige waits in « À traiter » (annulations-table).
     */
    reportHandledAt: timestamp("report_handled_at", { withTimezone: true }),
    reportHandledBy: uuid("report_handled_by").references(() => users.id, { onDelete: "set null" }),
    /** When the side reported absent contested the report (annulations-table); null otherwise. */
    disputedAt: timestamp("disputed_at", { withTimezone: true }),
    disputedByUserId: uuid("disputed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One confirmed garde per professional per night: a cancelled one frees it.
    uniqueIndex("bookings_profile_night_key")
      .on(table.profileId, table.nightDate)
      .where(sql`${table.status} = 'confirmee'`),
    index("bookings_family_night_idx").on(table.familyUserId, table.nightDate),
    // What the next reminder has to carry.
    index("bookings_reminder_pending_idx")
      .on(table.nightDate)
      .where(sql`${table.status} = 'confirmee' AND ${table.reminderSentAt} IS NULL`),
    // The founders' list of reported absences.
    index("bookings_absence_idx")
      .on(table.cancelledAt)
      .where(sql`${table.cancellationKind} = 'absence'`),
    // The founders' « Signalements à traiter »: cancelled gardes nobody has marked handled.
    index("bookings_reports_pending_idx")
      .on(table.cancelledAt)
      .where(sql`${table.status} = 'annulee' AND ${table.reportHandledAt} IS NULL`),
    check("bookings_night_rate_min", sql`${table.nightRateEur} >= 100`),
    // Only a reported absence can be contested.
    check("bookings_dispute_on_absence", sql`${table.disputedAt} IS NULL OR ${table.cancellationKind} = 'absence'`),
    check(
      "bookings_extra_hour_rate_min",
      sql`${table.extraHourRateEur} IS NULL OR ${table.extraHourRateEur} >= 1`,
    ),
    check("bookings_report_handled", sql`${table.reportHandledAt} IS NULL OR ${table.status} = 'annulee'`),
    check("bookings_cancelled_at", sql`(${table.status} = 'annulee') = (${table.cancelledAt} IS NOT NULL)`),
    check(
      "bookings_cancellation",
      sql`(${table.cancelledAt} IS NULL) = (${table.cancelledBy} IS NULL) AND (${table.cancelledAt} IS NULL) = (${table.cancellationKind} IS NULL)`,
    ),
    check(
      "bookings_cancellation_reason",
      sql`${table.cancellationReason} IS NULL OR ${table.cancellationKind} = 'annulation'`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

/** Who wrote a message: one of the two people, or Berceo's own two (D-87). */
export const messageAuthorEnum = pgEnum("message_author", ["berceo", "famille", "professionnelle"]);

/**
 * Berceo's two messages (D-87), stored as keys and rendered from
 * `src/content/messagerie.ts`, so a revision of the words reaches every
 * conversation: the guide's amorce when she answers, the cahier des charges'
 * « excellente garde » when the family books her.
 */
export const berceoMessageEnum = pgEnum("berceo_message", ["amorce", "bonne_garde"]);

/**
 * One conversation per answer (D-16, D-91): the family who owns the request
 * and the professional who answered it, nobody else. It is made with the
 * answer, and a re-answer after a withdrawal finds the same one. The request,
 * the profile and the family are copied from the answer for the list queries.
 * Each side's read marker is the last time it opened the conversation; whether
 * it still accepts messages is read from the request (D-89), never stored.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .unique()
      .references(() => careRequestApplications.id, { onDelete: "cascade" }),
    requestId: uuid("request_id")
      .notNull()
      .references(() => careRequests.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    familyUserId: uuid("family_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    familyLastReadAt: timestamp("family_last_read_at", { withTimezone: true }),
    professionalLastReadAt: timestamp("professional_last_read_at", { withTimezone: true }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("conversations_family_last_message_idx").on(table.familyUserId, table.lastMessageAt),
    index("conversations_profile_last_message_idx").on(table.profileId, table.lastMessageAt),
    index("conversations_request_id_idx").on(table.requestId),
  ],
);

/**
 * A message: the people's carry their text (1 to 2 000 characters, plain) and
 * the id their browser gave it, so a retried send inserts once; Berceo's carry
 * a key and no text, at most one of each per conversation.
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    author: messageAuthorEnum("author").notNull(),
    body: text("body"),
    berceoKey: berceoMessageEnum("berceo_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
    uniqueIndex("messages_one_berceo_key")
      .on(table.conversationId, table.berceoKey)
      .where(sql`${table.berceoKey} IS NOT NULL`),
    check(
      "messages_berceo_key",
      sql`(${table.author} = 'berceo') = (${table.berceoKey} IS NOT NULL)`,
    ),
    check("messages_body_or_key", sql`(${table.body} IS NULL) = (${table.berceoKey} IS NOT NULL)`),
    check(
      "messages_body_length",
      sql`${table.body} IS NULL OR char_length(${table.body}) BETWEEN 1 AND 2000`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// The service fee
// ---------------------------------------------------------------------------

/**
 * A fee's life (D-102, D-103, D-92 to D-94): `en_attente` while its Checkout is open (read as
 * expired once `expires_at` passes, D-92); `payee` once Stripe reports it paid;
 * `expiree` when abandoned or expired; `echouee` when an asynchronous payment
 * failed; `remboursee` once refunded; `remboursement_echoue` when Stripe
 * reported the refund failed.
 */
export const paymentStatusEnum = pgEnum("payment_status", [
  "en_attente",
  "payee",
  "expiree",
  "echouee",
  "remboursee",
  "remboursement_echoue",
]);

/**
 * Why a fee was refunded (D-94): the professional cancelled (stub 11), the
 * booking could no longer be made (D-103), the founders' button (D-101), or a
 * refund made in Stripe's dashboard.
 */
export const refundReasonEnum = pgEnum("refund_reason", [
  "annulation_professionnelle",
  "reservation_impossible",
  "berceo",
  "stripe",
]);

/**
 * One row per fee (D-99, D-93): a Stripe Checkout opened for the 3 % fee, or
 * a fee that Berceo credits pay whole (credits-au-paiement). The fee is
 * a money record: every link is set null, never cascaded, so deleting an
 * account never deletes what was paid, and the night and the rate are kept
 * on the row. `src/lib/paiements/` reads and writes it; `acceptAnswer` alone
 * sets `booking_id`, in the booking's own transaction. `credit_cents` is the
 * part a family's credit paid; Stripe asks `amount_cents - credit_cents`. A
 * fee the credit pays whole has no Checkout, so no session.
 */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id").references(() => careRequests.id, { onDelete: "set null" }),
    applicationId: uuid("application_id").references(() => careRequestApplications.id, {
      onDelete: "set null",
    }),
    familyUserId: uuid("family_user_id").references(() => users.id, { onDelete: "set null" }),
    /** The booking this payment made, once made (D-102). */
    bookingId: uuid("booking_id")
      .unique()
      .references(() => bookings.id, { onDelete: "set null" }),
    nightDate: date("night_date").notNull(),
    /** The answer's rate the fee was computed from (D-74). */
    nightRateEur: integer("night_rate_eur").notNull(),
    /** 3 % of the rate, in cents: rate × 3 (D-99). */
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("eur"),
    status: paymentStatusEnum("status").notNull().default("en_attente"),
    /** The part of the fee a Berceo credit paid (credits-au-paiement); 0 when none did. */
    creditCents: integer("credit_cents").notNull().default(0),
    /** Null only for a fee a credit pays whole: it opens no Checkout. */
    stripeSessionId: text("stripe_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeRefundId: text("stripe_refund_id"),
    /** When the Checkout closes on its own (30 minutes, D-92). */
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    refundReason: refundReasonEnum("refund_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One open Checkout per request (D-92).
    uniqueIndex("payments_one_open_per_request")
      .on(table.requestId)
      .where(sql`${table.status} = 'en_attente'`),
    index("payments_created_at_idx").on(table.createdAt),
    index("payments_payment_intent_idx").on(table.stripePaymentIntentId),
    // 3 % of a rate from 100 €, with no ceiling (onboarding-retour-1).
    check("payments_amount_min", sql`${table.amountCents} >= 300`),
    check("payments_currency", sql`${table.currency} = 'eur'`),
    // The credit pays the whole fee, or leaves Stripe at least its 0,50 € minimum (credits-au-paiement).
    check(
      "payments_credit_range",
      sql`${table.creditCents} >= 0 AND (${table.creditCents} = ${table.amountCents} OR ${table.amountCents} - ${table.creditCents} >= 50)`,
    ),
    check(
      "payments_session_or_credit",
      sql`(${table.stripeSessionId} IS NULL) = (${table.creditCents} = ${table.amountCents})`,
    ),
    check(
      "payments_paid_at",
      sql`(${table.status} IN ('payee', 'remboursee', 'remboursement_echoue')) = (${table.paidAt} IS NOT NULL)`,
    ),
    check("payments_refund_pair", sql`(${table.refundedAt} IS NULL) = (${table.refundReason} IS NULL)`),
    check(
      "payments_refunded",
      sql`${table.status} NOT IN ('remboursee', 'remboursement_echoue') OR ${table.refundedAt} IS NOT NULL`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

/**
 * A subscription's life, read from Stripe (`src/lib/abonnements/rules.ts`):
 * `en_attente` while its Checkout is open or its first payment pending;
 * `active` once paid; `impayee` after a failed renewal, with its grace period;
 * `terminee` once cancelled, ended, or never paid.
 */
export const subscriptionStatusEnum = pgEnum("subscription_status", ["en_attente", "active", "impayee", "terminee"]);

/**
 * One row per Stripe subscription a family started, from the Checkout that
 * opened it. A money record like `payments`: the family's link is set null,
 * never cascaded, and an ended row is kept. At most one live row (`en_attente`,
 * `active`, `impayee`) per family. `src/lib/abonnements/` alone reads and
 * writes it.
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    plan: subscriptionPlanEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("en_attente"),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    /** Null until Stripe creates the subscription at the Checkout's payment. */
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    /** The Checkout this row was opened by; a new Checkout while `en_attente` replaces it. */
    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
    /** The end of the period paid: the renewal date. */
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    /** 7 days after the first failed renewal; set while `impayee` only. */
    graceEndsAt: timestamp("grace_ends_at", { withTimezone: true }),
    /** When a cancellation set in Stripe's portal ends the subscription; null while it renews. */
    cancelsAt: timestamp("cancels_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    /**
     * The promotion code the family typed on the Checkout (JAM-304), read once
     * from the completed Checkout, with the discount of the first payment in
     * cents. `amountDiscount` is null until that read, 0 without a code.
     */
    promotionCode: text("promotion_code"),
    amountDiscount: integer("amount_discount"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("subscriptions_one_live_per_family")
      .on(table.userId)
      .where(sql`${table.status} IN ('en_attente', 'active', 'impayee')`),
    check("subscriptions_grace", sql`(${table.status} = 'impayee') = (${table.graceEndsAt} IS NOT NULL)`),
    check(
      "subscriptions_period",
      sql`${table.status} NOT IN ('active', 'impayee') OR ${table.currentPeriodEnd} IS NOT NULL`,
    ),
    check("subscriptions_ended", sql`(${table.status} = 'terminee') = (${table.endedAt} IS NOT NULL)`),
  ],
);

/**
 * A one-night pass's life (JAM-304): `en_attente` while its Checkout is open,
 * `payee` once Stripe reports the payment, `terminee` when the Checkout closed
 * unpaid. Whether a paid pass still opens anything is read from the clock and
 * the family's bookings (`nightPassOpen` in `src/lib/abonnements/rules.ts`),
 * never stored.
 */
export const nightPassStatusEnum = pgEnum("night_pass_status", ["en_attente", "payee", "terminee"]);

/**
 * One row per Checkout of the one-night plan (JAM-304): a one-off payment that
 * opens what a subscription opens, for one booking. A money record like
 * `subscriptions`: the family's link is set null, never cascaded. At most one
 * Checkout open per family. `src/lib/abonnements/` alone reads and writes it.
 */
export const nightPasses = pgTable(
  "night_passes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    status: nightPassStatusEnum("status").notNull().default("en_attente"),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    /** The amount paid in cents, after the discount; set once paid. */
    amountTotal: integer("amount_total"),
    /** The promotion code typed on the Checkout, and its discount in cents (0 without one). */
    promotionCode: text("promotion_code"),
    amountDiscount: integer("amount_discount"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("night_passes_one_open_checkout_per_family")
      .on(table.userId)
      .where(sql`${table.status} = 'en_attente'`),
    index("night_passes_user_id_idx").on(table.userId),
    check("night_passes_paid", sql`(${table.status} = 'payee') = (${table.paidAt} IS NOT NULL)`),
    check("night_passes_ended", sql`(${table.status} = 'terminee') = (${table.endedAt} IS NOT NULL)`),
  ],
);

// ---------------------------------------------------------------------------
// Ratings
// ---------------------------------------------------------------------------

/** The side of the person who rates: the family rates the professional, and the other way round. */
export const ratingSideEnum = pgEnum("rating_side", ["famille", "professionnelle"]);

/**
 * One side's stars on one garde (D-18, D-115): four criteria, each 1 to 5, in
 * the order `src/lib/avis/rules.ts` fixes for the side; never any text. One
 * per side per garde, never edited (D-117). It counts in the rated person's
 * note once both sides have rated or 14 days after the night ends (D-116),
 * read at query time. `src/lib/avis/` is its only reader and writer.
 */
export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    raterSide: ratingSideEnum("rater_side").notNull(),
    raterUserId: uuid("rater_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ratedUserId: uuid("rated_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score1: smallint("score_1").notNull(),
    score2: smallint("score_2").notNull(),
    score3: smallint("score_3").notNull(),
    score4: smallint("score_4").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("ratings_booking_side_key").on(table.bookingId, table.raterSide),
    index("ratings_rated_user_idx").on(table.ratedUserId),
    index("ratings_created_idx").on(table.createdAt),
    check("ratings_score_1", sql`${table.score1} BETWEEN 1 AND 5`),
    check("ratings_score_2", sql`${table.score2} BETWEEN 1 AND 5`),
    check("ratings_score_3", sql`${table.score3} BETWEEN 1 AND 5`),
    check("ratings_score_4", sql`${table.score4} BETWEEN 1 AND 5`),
  ],
);

/**
 * The invitation to rate a garde, once per garde and side (D-120): the row is
 * the claim, taken just before the send and removed when the send fails.
 */
export const ratingInvitations = pgTable(
  "rating_invitations",
  {
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    side: ratingSideEnum("side").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.bookingId, table.side] })],
);

// ---------------------------------------------------------------------------
// Favourites
// ---------------------------------------------------------------------------

/**
 * A family's favourite professionals (favoris-marquer): one row per family and
 * profile she marked « Ajouter à mes professionnelles ». Hers alone: neither
 * the professional nor the founders read it. `src/lib/favoris/` is its only
 * reader and writer. A deleted account is anonymised, not removed (D-136), so
 * the deletion removes these rows itself; the cascades serve a removed row.
 */
export const favourites = pgTable(
  "favourites",
  {
    familyUserId: uuid("family_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.familyUserId, table.profileId] }),
    index("favourites_profile_id_idx").on(table.profileId),
  ],
);

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

/**
 * Why a credit exists (credits-registre, the answers [9.2]): the lines of the
 * founders' table that turn a fee into a credit, and a founder's hand.
 * `annulation_famille`: the family cancelled more than the delay before the
 * start. `annulation_professionnelle` and `absence_professionnelle`: the
 * professional cancelled, or did not come. `annulation_berceo`: Berceo
 * cancelled the garde. `geste_berceo`: a founder granted it by hand. The end
 * of a garde writes the first three (annulations-table); the founders write
 * the last two (`annulations-back-office`).
 */
export const creditOriginEnum = pgEnum("credit_origin", [
  "annulation_famille",
  "annulation_professionnelle",
  "absence_professionnelle",
  "annulation_berceo",
  "geste_berceo",
]);

/**
 * A Berceo credit (credits-registre): a fee kept for a later garde, 24 months
 * from its issue (the answers [9.2]). A money record like a payment: every
 * link is set null, never cascaded, and the amount stays on the row.
 * `spent_cents` grows as later fees take from it (`credits-au-paiement`); a
 * credit is spent once it equals `amount_cents`, and expired once
 * `expires_at` passes (`src/lib/credits/rules.ts`). `voided_at` marks a credit
 * a contested absence cancelled (annulations-table): what is left on it pays
 * nothing more, and the row stays. A garde holds one live credit at most.
 * `src/lib/credits/` holds the only statements on it (`isolation.test.ts`).
 */
export const credits = pgTable(
  "credits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyUserId: uuid("family_user_id").references(() => users.id, { onDelete: "set null" }),
    /** The fee's amount in cents (`payments.amount_cents`), never a night rate. */
    amountCents: integer("amount_cents").notNull(),
    spentCents: integer("spent_cents").notNull().default(0),
    origin: creditOriginEnum("origin").notNull(),
    /** The fee the credit comes from, when one does. */
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    /** The garde whose cancellation or absence made it, when one did. */
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    /** The founder who granted it by hand (`geste_berceo`). */
    grantedByUserId: uuid("granted_by_user_id").references(() => users.id, { onDelete: "set null" }),
    /** The founders' note, when they wrote one. */
    note: text("note"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** When a contested absence cancelled it (annulations-table); null while it stands. */
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("credits_family_user_id_idx").on(table.familyUserId),
    // One live credit per garde: a second end of the same garde issues nothing.
    uniqueIndex("credits_booking_live_key")
      .on(table.bookingId)
      .where(sql`${table.bookingId} IS NOT NULL AND ${table.voidedAt} IS NULL`),
    check("credits_amount_positive", sql`${table.amountCents} > 0`),
    check("credits_spent_range", sql`${table.spentCents} >= 0 AND ${table.spentCents} <= ${table.amountCents}`),
    check("credits_expiry_after_issue", sql`${table.expiresAt} > ${table.issuedAt}`),
  ],
);

/**
 * Where a credit's part of a fee stands (credits-au-paiement). `reservee`: an
 * open Checkout holds it. `confirmee`: the fee is paid. `liberee`: the cents
 * went back to the credit, after a Checkout that closed unpaid or a refund.
 */
export const creditSpendStatusEnum = pgEnum("credit_spend_status", ["reservee", "confirmee", "liberee"]);

/**
 * One row per credit a fee takes from (credits-au-paiement): which credit,
 * which fee, how many cents, and where the take stands. The take adds to
 * `credits.spent_cents` in the same statement; a release subtracts it in the
 * same statement. A money record: no link cascades. `src/lib/credits/` holds
 * the only statements on it (`isolation.test.ts`).
 */
export const creditSpends = pgTable(
  "credit_spends",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creditId: uuid("credit_id")
      .notNull()
      .references(() => credits.id),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id),
    cents: integer("cents").notNull(),
    status: creditSpendStatusEnum("status").notNull().default("reservee"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // A fee takes from one credit once.
    uniqueIndex("credit_spends_credit_payment_key").on(table.creditId, table.paymentId),
    index("credit_spends_payment_id_idx").on(table.paymentId),
    // A take that found its credit changed writes 0, and this check rolls the whole batch back.
    check("credit_spends_cents_positive", sql`${table.cents} > 0`),
  ],
);

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/**
 * The founders' settings, one row per key. No row means the default.
 * Today: `etudiantes_admises` (D-7, off by default) and `delai_annulation_heures`
 * (annulations-delai-et-motif, 24 by default; the migration writes its row).
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
  "frais_rembourses",
  // back-office-admin (D-134 to D-139)
  "compte_suspendu",
  "compte_reactive",
  "compte_supprime",
  "utilisateur_contacte",
  "signalement_traite",
  // annulations-delai-et-motif
  "reglage_delai_annulation",
  // JAM-304: the promotion codes
  "code_promo_cree",
  "code_promo_desactive",
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
export type SignInCode = typeof signInCodes.$inferSelect;
export type TrustedDevice = typeof trustedDevices.$inferSelect;
export type ConsentDocument = (typeof consentDocumentEnum.enumValues)[number];
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type ProfileStatus = (typeof profileStatusEnum.enumValues)[number];
export type Profession = (typeof professionEnum.enumValues)[number];
export type DocumentKind = (typeof documentKindEnum.enumValues)[number];
export type AdminAction = (typeof adminActionEnum.enumValues)[number];
export type AdminJournalEntry = typeof adminJournal.$inferSelect;
export type Declaration = (typeof declarationEnum.enumValues)[number];
export type ProfessionalDocument = typeof professionalDocuments.$inferSelect;
export type ProfessionalAvailability = typeof professionalAvailability.$inferSelect;
export type CareRequest = typeof careRequests.$inferSelect;
export type CareRequestStatus = (typeof careRequestStatusEnum.enumValues)[number];
export type CareRequestChildren = (typeof careRequestChildrenEnum.enumValues)[number];
export type BabyAgeUnit = (typeof babyAgeUnitEnum.enumValues)[number];
export type Feeding = (typeof feedingEnum.enumValues)[number];
export type CareRequestApplication = typeof careRequestApplications.$inferSelect;
export type ApplicationStatus = (typeof applicationStatusEnum.enumValues)[number];
export type Booking = typeof bookings.$inferSelect;
export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];
export type BookingSide = (typeof bookingSideEnum.enumValues)[number];
export type CancellationKind = (typeof cancellationKindEnum.enumValues)[number];
export type CancellationReason = (typeof cancellationReasonEnum.enumValues)[number];
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageAuthor = (typeof messageAuthorEnum.enumValues)[number];
export type BerceoMessage = (typeof berceoMessageEnum.enumValues)[number];
export type Payment = typeof payments.$inferSelect;
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type RefundReason = (typeof refundReasonEnum.enumValues)[number];
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionPlan = (typeof subscriptionPlanEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
export type NightPass = typeof nightPasses.$inferSelect;
export type NightPassStatus = (typeof nightPassStatusEnum.enumValues)[number];
export type Rating = typeof ratings.$inferSelect;
export type RatingSide = (typeof ratingSideEnum.enumValues)[number];
export type Favourite = typeof favourites.$inferSelect;
export type Credit = typeof credits.$inferSelect;
export type CreditOrigin = (typeof creditOriginEnum.enumValues)[number];
export type CreditSpend = typeof creditSpends.$inferSelect;
export type CreditSpendStatus = (typeof creditSpendStatusEnum.enumValues)[number];
