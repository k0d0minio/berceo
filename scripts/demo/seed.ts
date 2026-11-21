/**
 * Fills the local demo database (JAM-462) with a full French data set, after
 * it empties every table. Run it again to reset the demo to its first state.
 *
 *   npm run demo:seed            empty and fill
 *   npm run demo:seed -- --check only the guard: exit 0 when the seed may run
 *
 * It reads its database from `.env.demo.local` only, and refuses any database
 * without the demo mark (`src/lib/demo/seed-guard.ts`): never UAT, never
 * production. It calls no Stripe, Resend or Neon Auth: the Stripe ids are
 * made-up `*_demo_*` strings, no e-mail leaves, and no identity is made in
 * Neon Auth (the demo signs in through `/api/demo/connexion`).
 *
 * Every person is invented. The photos and the documents are made from their
 * key (`src/lib/demo/files.ts`). The dates are relative to the day of the
 * seed, so the gardes are past, tonight and to come whenever it runs.
 */
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

import {
  adminJournal,
  appSettings,
  bookings,
  careRequestApplications,
  careRequests,
  conversations,
  credits,
  db,
  familyProfiles,
  favourites,
  messages,
  nightPasses,
  payments,
  professionalAvailability,
  professionalCommunes,
  professionalDeclarations,
  professionalDocuments,
  professionalProfiles,
  professionalReach,
  ratingInvitations,
  ratings,
  subscriptions,
  userConsents,
  users,
  type ChildAge,
  type CreditOrigin,
  type Feeding,
  type Profession,
  type ProfileStatus,
  type SubscriptionPlan,
} from "../../src/db";
import { consentRows } from "../../src/lib/auth/consent";
import { communesWithin } from "../../src/lib/communes/distance";
import { findLocality } from "../../src/lib/communes";
import { demoDocumentKey, demoPhotoKey } from "../../src/lib/demo/files";
import { DEMO_MARKER_SCHEMA, DEMO_MARKER_TABLE, seedRefusal } from "../../src/lib/demo/seed-guard";
import { DEMO_SIGN_IN_PATH, demoAddress, demoEnvFrom } from "../../src/lib/demo/switch";
import { DECLARATIONS, DECLARATIONS_VERSION } from "../../src/lib/professionnelle/rules";
import { fail, readDemoEnv } from "./env";

// ---------------------------------------------------------------------------
// The guard
// ---------------------------------------------------------------------------

async function guard(): Promise<string> {
  const file = readDemoEnv();
  const url = file?.DATABASE_URL;
  let markerBranches: string[] | null = null;
  if (url) {
    const query = neon(file!.DATABASE_URL_UNPOOLED || url);
    const [table] = await query(`select to_regclass('${DEMO_MARKER_SCHEMA}.${DEMO_MARKER_TABLE}') is not null as present`);
    if (table?.present) {
      const rows = await query(`select branch_name from ${DEMO_MARKER_SCHEMA}.${DEMO_MARKER_TABLE}`);
      markerBranches = rows.map((row) => String(row.branch_name));
    }
  }
  const refusal = seedRefusal({
    fileEnv: demoEnvFrom(file ?? {}),
    shellEnv: demoEnvFrom(process.env),
    url,
    markerBranches,
  });
  if (refusal) fail(`refused (${refusal}): this is not the local demo database. See .icm/local/database.md.`);
  return url!;
}

// ---------------------------------------------------------------------------
// Time, in Brussels
// ---------------------------------------------------------------------------

const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());

/** The date `offset` days from today, `YYYY-MM-DD`. */
function day(offset: number): string {
  const date = new Date(`${TODAY}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

/** The moment `hh:mm` in Brussels on the day `offset` days from today. */
function at(offset: number, hm: string): Date {
  const date = day(offset);
  const probe = new Date(`${date}T12:00:00Z`);
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Brussels", timeZoneName: "longOffset" })
    .formatToParts(probe)
    .find((part) => part.type === "timeZoneName")!.value.replace("GMT", "");
  return new Date(`${date}T${hm}:00${zone || "+00:00"}`);
}

function plusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function plusMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

// ---------------------------------------------------------------------------
// The rows, built in memory, written in one transaction
// ---------------------------------------------------------------------------

const rows = {
  users: [] as (typeof users.$inferInsert)[],
  familyProfiles: [] as (typeof familyProfiles.$inferInsert)[],
  userConsents: [] as (typeof userConsents.$inferInsert)[],
  professionalProfiles: [] as (typeof professionalProfiles.$inferInsert)[],
  professionalCommunes: [] as (typeof professionalCommunes.$inferInsert)[],
  professionalReach: [] as (typeof professionalReach.$inferInsert)[],
  professionalDocuments: [] as (typeof professionalDocuments.$inferInsert)[],
  professionalDeclarations: [] as (typeof professionalDeclarations.$inferInsert)[],
  professionalAvailability: [] as (typeof professionalAvailability.$inferInsert)[],
  subscriptions: [] as (typeof subscriptions.$inferInsert)[],
  nightPasses: [] as (typeof nightPasses.$inferInsert)[],
  careRequests: [] as (typeof careRequests.$inferInsert)[],
  applications: [] as (typeof careRequestApplications.$inferInsert)[],
  bookings: [] as (typeof bookings.$inferInsert)[],
  payments: [] as (typeof payments.$inferInsert)[],
  conversations: [] as (typeof conversations.$inferInsert)[],
  messages: [] as (typeof messages.$inferInsert)[],
  ratings: [] as (typeof ratings.$inferInsert)[],
  ratingInvitations: [] as (typeof ratingInvitations.$inferInsert)[],
  favourites: [] as (typeof favourites.$inferInsert)[],
  credits: [] as (typeof credits.$inferInsert)[],
  adminJournal: [] as (typeof adminJournal.$inferInsert)[],
};

type Account = { id: string; key: string; email: string; name: string; role: "parent" | "professionnel" | "admin"; note: string };
const accounts: Account[] = [];

function person(
  key: string,
  role: Account["role"],
  firstName: string,
  lastName: string,
  phone: string | null,
  note: string,
  extra: Partial<typeof users.$inferInsert> = {},
): Account {
  const id = randomUUID();
  const email = demoAddress(key);
  const createdAt = at(-60, "10:00");
  rows.users.push({ id, authUserId: `demo-${key}`, email, firstName, lastName, phone, role, createdAt, updatedAt: createdAt, ...extra });
  rows.userConsents.push(...consentRows(id).map((row) => ({ ...row, acceptedAt: createdAt })));
  const account = { id, key, email, name: `${firstName} ${lastName}`, role, note };
  accounts.push(account);
  return account;
}

// --- The founders ----------------------------------------------------------

const camille = person("fondatrice-camille", "admin", "Camille", "Lambert", "+32470000101", "fondatrice");
const elise = person("fondatrice-elise", "admin", "Élise", "Dumont", "+32470000102", "fondatrice");
const founder = (account: Account) => ({ adminUserId: account.id, adminName: account.name });

// --- The families ------------------------------------------------------------

type Family = Account & { commune: { ins: string; postcode: string; locality: string }; street: string; number: string };

function family(
  key: string,
  firstName: string,
  lastName: string,
  phone: string,
  postcode: string,
  locality: string,
  street: string,
  number: string,
  context: string | null,
  plan: SubscriptionPlan | null,
  note: string,
): Family {
  const found = findLocality(postcode, locality);
  if (!found) throw new Error(`unknown locality ${postcode} ${locality}`);
  const account = person(key, "parent", firstName, lastName, phone, note, {
    signupPlan: plan,
    stripeCustomerId: plan || key === "famille-une-nuit" ? `cus_demo_${key.replace(/-/g, "_")}` : null,
    welcomeSentAt: at(-60, "10:05"),
  });
  rows.familyProfiles.push({
    userId: account.id,
    communeIns: found.ins,
    postcode,
    locality,
    street,
    houseNumber: number,
    context,
    createdAt: at(-60, "10:10"),
    updatedAt: at(-60, "10:10"),
  });
  return { ...account, commune: { ins: found.ins, postcode, locality }, street, number };
}

function subscribe(f: Family, plan: SubscriptionPlan, status: "active" | "impayee") {
  const key = f.key.replace(/-/g, "_");
  rows.subscriptions.push({
    userId: f.id,
    plan,
    status,
    stripeCustomerId: `cus_demo_${key}`,
    stripeSubscriptionId: `sub_demo_${key}`,
    stripeCheckoutSessionId: `cs_demo_sub_${key}`,
    currentPeriodEnd: status === "active" ? at(20, "10:00") : at(-2, "10:00"),
    graceEndsAt: status === "impayee" ? at(5, "10:00") : null,
    amountDiscount: 0,
    createdAt: at(-40, "10:20"),
    updatedAt: at(-10, "10:20"),
  });
}

const laura = family("famille-serenite", "Laura", "Janssens", "+32470000201", "1050", "Ixelles", "Rue du Bailli", "42", "Premier enfant, né début octobre.", "serenite", "abonnement Sérénité, la famille principale du film");
const sophie = family("famille-decouverte", "Sophie", "Martin", "+32470000202", "1040", "Etterbeek", "Avenue d'Auderghem", "118", null, "decouverte", "abonnement Découverte");
const julie = family("famille-parenthese", "Julie", "Peeters", "+32470000203", "1180", "Uccle", "Rue Vanderkindere", "7", "Deux enfants, la grande a trois ans.", "parenthese", "abonnement Parenthèse");
const marie = family("famille-premium", "Marie", "Dubois", "+32470000204", "1200", "Woluwe-Saint-Lambert", "Avenue de Broqueville", "55", null, "premium", "abonnement Premium");
const claire = family("famille-une-nuit", "Claire", "Lemaire", "+32470000205", "5000", "Namur", "Rue de Fer", "21", null, null, "plan Une nuit, payé");
const anne = family("famille-impayee", "Anne", "Simon", "+32470000206", "4000", "Liège", "Boulevard d'Avroy", "90", null, "serenite", "abonnement Sérénité impayé, dans son délai de grâce");
const helene = family("famille-sans-abonnement", "Hélène", "Leclercq", "+32470000207", "1030", "Schaerbeek", "Avenue Louis Bertrand", "13", null, null, "sans abonnement");

subscribe(laura, "serenite", "active");
subscribe(sophie, "decouverte", "active");
subscribe(julie, "parenthese", "active");
subscribe(marie, "premium", "active");
subscribe(anne, "serenite", "impayee");
rows.nightPasses.push({
  userId: claire.id,
  status: "payee",
  stripeCustomerId: "cus_demo_famille_une_nuit",
  stripeCheckoutSessionId: "cs_demo_pass_famille_une_nuit",
  stripePaymentIntentId: "pi_demo_pass_famille_une_nuit",
  amountTotal: 1475,
  amountDiscount: 0,
  paidAt: at(-1, "09:30"),
  createdAt: at(-1, "09:20"),
  updatedAt: at(-1, "09:30"),
});

// --- The professionals ---------------------------------------------------------

type Pro = Account & { profileId: string; firstName: string; nightRate: number; extraRate: number };

function professional(input: {
  key: string;
  firstName: string;
  lastName: string;
  phone: string;
  n: number;
  status: ProfileStatus;
  profession: Profession;
  nightRate: number;
  extraRate: number;
  communes: string[];
  radius: 0 | 10 | 20 | 30;
  bio: string;
  formations: string;
  note: string;
  reviewReason?: string;
}): Pro {
  const account = person(input.key, "professionnel", input.firstName, input.lastName, input.phone, input.note);
  const profileId = randomUUID();
  const submittedAt = input.status === "valide" ? at(-45, "14:00") : at(-2, "14:00");
  const reviewedAt = input.status === "valide" ? at(-44, "09:00") : input.status === "complement_demande" ? at(-1, "09:00") : null;
  rows.professionalProfiles.push({
    id: profileId,
    userId: account.id,
    status: input.status,
    profession: input.profession,
    formationsComplementaires: input.formations,
    nightRateEur: input.nightRate,
    extraHourRateEur: input.extraRate,
    zoneRadiusKm: input.radius,
    bio: input.bio,
    inamiNumber: `4${String(input.n).padStart(2, "0")}${String(31_415_926 + input.n * 1_111).slice(0, 8)}`,
    submittedAt,
    reviewReason: input.reviewReason ?? null,
    reviewedAt,
    createdAt: at(-50, "11:00"),
    updatedAt: reviewedAt ?? submittedAt,
  });
  for (const communeIns of input.communes) rows.professionalCommunes.push({ profileId, communeIns });
  for (const communeIns of communesWithin(input.communes, input.radius)) rows.professionalReach.push({ profileId, communeIns });
  rows.professionalDocuments.push(
    {
      profileId,
      kind: "photo",
      storageKey: demoPhotoKey(input.n),
      fileName: "photo.svg",
      contentType: "image/svg+xml",
      sizeBytes: 400,
      uploadedAt: at(-50, "11:10"),
    },
    {
      profileId,
      kind: "diplome",
      storageKey: demoDocumentKey(`diplome-${input.key}`),
      fileName: "diplome.pdf",
      contentType: "application/pdf",
      sizeBytes: 900,
      uploadedAt: at(-50, "11:12"),
    },
  );
  if (input.status !== "complement_demande") {
    rows.professionalDocuments.push({
      profileId,
      kind: "attestation_inscription",
      storageKey: demoDocumentKey(`attestation-${input.key}`),
      fileName: "attestation-inscription.pdf",
      contentType: "application/pdf",
      sizeBytes: 900,
      uploadedAt: at(-50, "11:14"),
    });
  }
  for (const declaration of DECLARATIONS) {
    rows.professionalDeclarations.push({ profileId, declaration, version: DECLARATIONS_VERSION, acceptedAt: submittedAt });
  }
  if (input.status === "valide") {
    for (let offset = 1; offset <= 21; offset++) {
      if ((offset + input.n) % 3 !== 0) rows.professionalAvailability.push({ profileId, nightDate: day(offset), createdAt: at(-3, "18:00") });
    }
    rows.adminJournal.push({ occurredAt: reviewedAt!, action: "profil_valide", subjectUserId: account.id, subjectName: account.name, ...founder(camille) });
  }
  if (input.status === "complement_demande") {
    rows.adminJournal.push({
      occurredAt: reviewedAt!,
      action: "complement_demande",
      subjectUserId: account.id,
      subjectName: account.name,
      detail: input.reviewReason ?? null,
      ...founder(elise),
    });
  }
  return { ...account, profileId, firstName: input.firstName, nightRate: input.nightRate, extraRate: input.extraRate };
}

const amelie = professional({
  key: "pro-amelie", firstName: "Amélie", lastName: "Renard", phone: "+32470000301", n: 0, status: "valide",
  profession: "sage_femme", nightRate: 150, extraRate: 15, communes: ["21009", "21005", "21004"], radius: 10,
  bio: "Sage-femme depuis huit ans, en maternité puis à domicile. J'accompagne les premières semaines avec calme : les tétées de nuit, l'endormissement, et le repos des parents.",
  formations: "Consultante en lactation, portage physiologique.",
  note: "sage-femme validée, Ixelles, Etterbeek, Bruxelles",
});
const nadia = professional({
  key: "pro-nadia", firstName: "Nadia", lastName: "Benali", phone: "+32470000302", n: 1, status: "valide",
  profession: "infirmiere_neonatologie", nightRate: 140, extraRate: 14, communes: ["21016", "21007"], radius: 10,
  bio: "Infirmière en néonatologie, j'ai travaillé six ans en service de soins intensifs néonatals. Je prends le relais la nuit pour que vous puissiez dormir en confiance.",
  formations: "Soins de développement, accompagnement des prématurés.",
  note: "infirmière validée, Uccle et Forest",
});
const ines = professional({
  key: "pro-ines", firstName: "Inès", lastName: "Lambotte", phone: "+32470000303", n: 2, status: "valide",
  profession: "puericultrice", nightRate: 135, extraRate: 12, communes: ["21018", "21019"], radius: 0,
  bio: "Puéricultrice en crèche puis en garde à domicile. J'aime les nuits tranquilles, les rituels du coucher et les petits carnets de nuit que je laisse aux parents au matin.",
  formations: "Massage bébé, sommeil du jeune enfant.",
  note: "puéricultrice validée, Woluwe-Saint-Lambert et Woluwe-Saint-Pierre",
});
const charlotte = professional({
  key: "pro-charlotte", firstName: "Charlotte", lastName: "Gilson", phone: "+32470000304", n: 3, status: "valide",
  profession: "sage_femme", nightRate: 160, extraRate: 16, communes: ["92094"], radius: 20,
  bio: "Sage-femme libérale à Namur. Je suis les familles du retour à la maison jusqu'aux trois mois de l'enfant, de jour comme de nuit.",
  formations: "Rééducation périnéale, allaitement.",
  note: "sage-femme validée, Namur et 20 km",
});
const sarah = professional({
  key: "pro-sarah", firstName: "Sarah", lastName: "Collignon", phone: "+32470000305", n: 4, status: "valide",
  profession: "infirmiere_neonatologie", nightRate: 145, extraRate: 15, communes: ["62063"], radius: 20,
  bio: "Infirmière pédiatrique et néonatale à Liège. Je veille sur les nuits des nouveau-nés et je transmets aux parents ce que j'ai observé.",
  formations: "Réanimation néonatale, portage.",
  note: "infirmière validée, Liège et 20 km",
});
professional({
  key: "pro-lea", firstName: "Léa", lastName: "Fontaine", phone: "+32470000306", n: 5, status: "en_attente",
  profession: "sage_femme", nightRate: 140, extraRate: 14, communes: ["21015"], radius: 10,
  bio: "Jeune sage-femme, deux ans en salle de naissance. Je souhaite accompagner les familles la nuit, dans le calme.",
  formations: "Hypnonaissance.",
  note: "dossier en attente de vérification",
});
professional({
  key: "pro-manon", firstName: "Manon", lastName: "Hubert", phone: "+32470000307", n: 6, status: "complement_demande",
  profession: "puericultrice", nightRate: 130, extraRate: 12, communes: ["21004"], radius: 0,
  bio: "Puéricultrice, dix ans en crèche à Bruxelles. Disponible les nuits de semaine.",
  formations: "Premiers secours pédiatriques.",
  note: "complément demandé par les fondatrices",
  reviewReason: "Merci d'ajouter votre attestation d'inscription.",
});

// --- Requests, answers, conversations, gardes ---------------------------------

type Request = { id: string; family: Family; nightDate: string; startTime: string; createdAt: Date };

function request(input: {
  family: Family;
  offset: number;
  start: string;
  createdOffset: number;
  children: ChildAge[];
  feedings: Feeding[];
  extraHours?: number;
  reason?: string;
  status?: "ouverte" | "attribuee" | "annulee";
  cancelledAt?: Date;
  requestedStart?: string;
  priority?: Pro;
  series?: string;
}): Request {
  const id = randomUUID();
  const createdAt = at(input.createdOffset, "20:15");
  const f = input.family;
  rows.careRequests.push({
    id,
    familyUserId: f.id,
    status: input.status ?? "ouverte",
    urgent: input.offset - input.createdOffset <= 1,
    nightDate: day(input.offset),
    startTime: `${input.start}:00`,
    requestedStartTime: input.requestedStart ? `${input.requestedStart}:00` : null,
    extraHours: input.extraHours ?? 0,
    childAges: input.children,
    feedings: input.feedings,
    communeIns: f.commune.ins,
    postcode: f.commune.postcode,
    locality: f.commune.locality,
    nightStreet: f.street,
    nightHouseNumber: f.number,
    reason: input.reason ?? null,
    noMedicalConditionAt: createdAt,
    digestSentAt: input.offset - input.createdOffset > 1 ? at(input.createdOffset + 1, "08:00") : null,
    cancelledAt: input.status === "annulee" ? (input.cancelledAt ?? at(input.createdOffset + 1, "12:00")) : null,
    priorityProfileId: input.priority?.profileId ?? null,
    prioritySentAt: input.priority ? createdAt : null,
    seriesId: input.series ?? null,
    seriesWhole: Boolean(input.series),
    createdAt,
    updatedAt: createdAt,
  });
  return { id, family: f, nightDate: day(input.offset), startTime: input.start, createdAt };
}

type Answer = { id: string; request: Request; pro: Pro; answeredAt: Date };

function answer(r: Request, pro: Pro, status: "en_attente" | "retenue" | "non_retenue" | "retiree", minutesAfter: number, proposed?: string): Answer {
  const id = randomUUID();
  const answeredAt = plusMinutes(r.createdAt, minutesAfter);
  rows.applications.push({
    id,
    requestId: r.id,
    profileId: pro.profileId,
    status,
    nightRateEur: pro.nightRate,
    extraHourRateEur: pro.extraRate,
    proposedStartTime: proposed ? `${proposed}:00` : null,
    answeredAt,
    createdAt: answeredAt,
    updatedAt: answeredAt,
  });
  return { id, request: r, pro, answeredAt };
}

type Line = ["famille" | "professionnelle", string, number];

/** The answer's conversation: Berceo's amorce, the people's lines (minutes after the answer), and « bonne garde » once booked. */
function conversation(a: Answer, lines: Line[], bookedAt?: Date, readByBoth = true): void {
  const id = randomUUID();
  rows.messages.push({ conversationId: id, author: "berceo", berceoKey: "amorce", createdAt: a.answeredAt });
  let last = a.answeredAt;
  for (const [author, body, minutes] of lines) {
    const createdAt = plusMinutes(a.answeredAt, minutes);
    rows.messages.push({ conversationId: id, author, body, createdAt });
    if (createdAt > last) last = createdAt;
  }
  if (bookedAt) {
    rows.messages.push({ conversationId: id, author: "berceo", berceoKey: "bonne_garde", createdAt: bookedAt });
    if (bookedAt > last) last = bookedAt;
  }
  rows.conversations.push({
    id,
    applicationId: a.id,
    requestId: a.request.id,
    profileId: a.pro.profileId,
    familyUserId: a.request.family.id,
    familyLastReadAt: readByBoth ? last : a.answeredAt,
    professionalLastReadAt: last,
    lastMessageAt: last,
    createdAt: a.answeredAt,
    updatedAt: last,
  });
}

let paymentCount = 0;

type Garde = { bookingId: string; paymentId: string; amountCents: number; answer: Answer; confirmedAt: Date };

/** A booking made by its paid fee. */
function book(a: Answer, minutesAfterAnswer: number, extra: Partial<typeof bookings.$inferInsert> = {}): Garde {
  const bookingId = randomUUID();
  const paymentId = randomUUID();
  const confirmedAt = plusMinutes(a.answeredAt, minutesAfterAnswer);
  const amountCents = a.pro.nightRate * 3;
  paymentCount += 1;
  rows.payments.push({
    id: paymentId,
    requestId: a.request.id,
    applicationId: a.id,
    familyUserId: a.request.family.id,
    bookingId,
    nightDate: a.request.nightDate,
    nightRateEur: a.pro.nightRate,
    amountCents,
    status: "payee",
    stripeSessionId: `cs_demo_fee_${paymentCount}`,
    stripePaymentIntentId: `pi_demo_fee_${paymentCount}`,
    expiresAt: plusMinutes(confirmedAt, 28),
    paidAt: confirmedAt,
    createdAt: plusMinutes(confirmedAt, -2),
    updatedAt: confirmedAt,
  });
  rows.bookings.push({
    id: bookingId,
    requestId: a.request.id,
    applicationId: a.id,
    profileId: a.pro.profileId,
    familyUserId: a.request.family.id,
    nightDate: a.request.nightDate,
    nightRateEur: a.pro.nightRate,
    extraHourRateEur: a.pro.extraRate,
    confirmedAt,
    createdAt: confirmedAt,
    ...extra,
  });
  return { bookingId, paymentId, amountCents, answer: a, confirmedAt };
}

/** Both sides' stars on a past garde, and the invitations that asked for them. */
function rate(g: Garde, nightEnd: Date, family: [number, number, number, number] | null, pro: [number, number, number, number] | null): void {
  const familyUser = g.answer.request.family;
  const proUser = g.answer.pro;
  rows.ratingInvitations.push(
    { bookingId: g.bookingId, side: "famille", sentAt: plusMinutes(nightEnd, 120) },
    { bookingId: g.bookingId, side: "professionnelle", sentAt: plusMinutes(nightEnd, 120) },
  );
  if (family) {
    const [score1, score2, score3, score4] = family;
    rows.ratings.push({ bookingId: g.bookingId, raterSide: "famille", raterUserId: familyUser.id, ratedUserId: proUser.id, score1, score2, score3, score4, createdAt: plusMinutes(nightEnd, 300) });
  }
  if (pro) {
    const [score1, score2, score3, score4] = pro;
    rows.ratings.push({ bookingId: g.bookingId, raterSide: "professionnelle", raterUserId: proUser.id, ratedUserId: familyUser.id, score1, score2, score3, score4, createdAt: plusMinutes(nightEnd, 360) });
  }
}

function credit(f: Family, g: Garde | null, origin: CreditOrigin, issuedAt: Date, extra: Partial<typeof credits.$inferInsert> = {}): void {
  rows.credits.push({
    familyUserId: f.id,
    amountCents: g?.amountCents ?? 450,
    origin,
    paymentId: g?.paymentId ?? null,
    bookingId: g?.bookingId ?? null,
    issuedAt,
    expiresAt: plusMonths(issuedAt, 24),
    createdAt: issuedAt,
    updatedAt: issuedAt,
    ...extra,
  });
}

const newborn = (weeks: number): ChildAge[] => [{ value: weeks, unit: "semaines" }];

// Laura (Sérénité, Ixelles): two answers to compare, one with an adapted schedule.
{
  const r = request({
    family: laura, offset: 3, start: "20:30", createdOffset: -1, children: newborn(6), feedings: ["allaitement_maternel"],
    extraHours: 1, reason: "Nous souhaitons dormir une nuit complète avant la reprise du travail.",
  });
  const a1 = answer(r, amelie, "en_attente", 95);
  conversation(a1, [
    ["professionnelle", "Bonjour Laura, je suis disponible pour cette nuit. Souhaitez-vous que je vienne un peu plus tôt pour faire connaissance avec votre bébé ?", 2],
    ["famille", "Bonjour Amélie, merci pour votre réponse. Oui, avec plaisir, vers 20 h si cela vous convient.", 40],
    ["professionnelle", "Parfait, je note 20 h. Pensez à préparer le lait tiré au réfrigérateur pour la deuxième tétée.", 55],
  ]);
  const a2 = answer(r, nadia, "en_attente", 180, "21:30");
  conversation(a2, [["professionnelle", "Bonjour, je peux venir à partir de 21 h 30 seulement, j'ai proposé cet horaire.", 3]], undefined, false);
}

// Laura: a regular request, three nights answered at once, one at an adapted time.
{
  const series = randomUUID();
  const nights = [7, 9, 11].map((offset) =>
    request({ family: laura, offset, start: "21:00", createdOffset: -2, children: [{ value: 3, unit: "mois" }, { value: 3, unit: "mois" }], feedings: ["lait_infantile"], series }),
  );
  const answers = nights.map((r, index) => answer(r, amelie, "en_attente", 240, index === 1 ? "22:00" : undefined));
  conversation(answers[answers.length - 1], [
    ["professionnelle", "Bonjour Laura, je peux prendre les trois nuits. Le mercredi, je propose 22 h, je termine une garde de jour.", 2],
    ["famille", "Très bien pour nous. Les jumeaux boivent toutes les trois heures environ.", 120],
  ]);
}

// Laura: a past garde with Amélie, rated by both sides.
{
  const r = request({ family: laura, offset: -10, start: "20:00", createdOffset: -16, children: newborn(3), feedings: ["allaitement_mixte"], status: "attribuee" });
  const a = answer(r, amelie, "retenue", 60);
  const g = book(a, 300, { reminderSentAt: at(-11, "10:00") });
  conversation(a, [
    ["famille", "Bonjour Amélie, le code de la porte d'entrée est sur la boîte aux lettres.", 320],
    ["professionnelle", "Merci, à mardi soir.", 340],
  ], g.confirmedAt);
  rate(g, at(-9, "07:00"), [5, 5, 5, 5], [5, 4, 5, 5]);
}

// Laura: a credit a founder granted by hand.
credit(laura, null, "geste_berceo", at(-6, "11:00"), { grantedByUserId: camille.id, note: "Geste après un retard de réponse." });
rows.adminJournal.push({ occurredAt: at(-6, "11:00"), action: "credit_accorde", subjectUserId: laura.id, subjectName: laura.name, detail: "4,50 €", ...founder(camille) });
rows.favourites.push({ familyUserId: laura.id, profileId: amelie.profileId, createdAt: at(-9, "09:00") }, { familyUserId: laura.id, profileId: ines.profileId, createdAt: at(-5, "21:00") });

// Marie (Premium, Woluwe-Saint-Lambert): a garde to come at an adapted time, a past one, one Berceo cancelled.
{
  const r = request({
    family: marie, offset: 5, start: "21:30", requestedStart: "20:30", createdOffset: -3, children: newborn(10), feedings: ["allaitement_maternel", "lait_infantile"], status: "attribuee",
  });
  const a = answer(r, ines, "retenue", 120, "21:30");
  const g = book(a, 600);
  conversation(a, [
    ["professionnelle", "Bonjour Marie, je ne peux arriver qu'à 21 h 30 ce soir-là, je vous l'ai proposé.", 1],
    ["famille", "C'est d'accord, mon mari couchera la petite avant.", 400],
    ["professionnelle", "Merci. Je vous laisserai un carnet de nuit au matin.", 420],
  ], g.confirmedAt);
}
{
  const r = request({ family: marie, offset: -20, start: "20:00", createdOffset: -25, children: newborn(4), feedings: ["allaitement_maternel"], status: "attribuee" });
  const a = answer(r, ines, "retenue", 90);
  const g = book(a, 200, { reminderSentAt: at(-21, "10:00") });
  conversation(a, [["famille", "Merci pour cette nuit, nous avons enfin dormi.", 8000]], g.confirmedAt);
  rate(g, at(-19, "07:00"), [5, 5, 4, 5], null);
}
{
  const r = request({ family: marie, offset: 12, start: "20:00", createdOffset: -4, children: newborn(11), feedings: ["lait_infantile"], status: "annulee", cancelledAt: at(-1, "15:00") });
  const a = answer(r, ines, "retenue", 60);
  const note = "Annulée pour Berceo : la professionnelle est indisponible, la famille est prévenue par téléphone.";
  const g = book(a, 120, {
    status: "annulee", cancelledAt: at(-1, "15:00"), cancelledBy: "berceo", cancelledByUserId: camille.id, cancellationKind: "annulation",
    cancellationNote: note, reportHandledAt: at(-1, "15:00"), reportHandledBy: camille.id,
  });
  conversation(a, [], g.confirmedAt);
  credit(marie, g, "annulation_berceo", at(-1, "15:00"));
  rows.adminJournal.push({ occurredAt: at(-1, "15:00"), action: "garde_annulee_berceo", subjectUserId: marie.id, subjectName: marie.name, detail: note, ...founder(camille) });
}

// Julie (Parenthèse, Uccle): tonight's garde, a past one, one she cancelled, and a priority request.
{
  const r = request({ family: julie, offset: 0, start: "22:00", createdOffset: -1, children: newborn(2), feedings: ["allaitement_maternel"], status: "attribuee" });
  const a = answer(r, nadia, "retenue", 30);
  const g = book(a, 60, { reminderSentAt: at(-1, "10:00") });
  conversation(a, [
    ["famille", "Bonsoir Nadia, la petite dort dans notre chambre, nous préparons le lit d'appoint pour vous.", 70],
    ["professionnelle", "Merci Julie, j'arrive à 22 h.", 90],
  ], g.confirmedAt);
}
{
  const r = request({ family: julie, offset: -15, start: "21:00", createdOffset: -20, children: newborn(5), feedings: ["allaitement_mixte"], status: "attribuee" });
  const a = answer(r, nadia, "retenue", 45);
  const g = book(a, 180, { reminderSentAt: at(-16, "10:00") });
  conversation(a, [], g.confirmedAt);
  rate(g, at(-14, "08:00"), [5, 4, 5, 5], [5, 5, 5, 4]);
}
{
  const r = request({ family: julie, offset: 9, start: "20:30", createdOffset: -5, children: newborn(4), feedings: ["allaitement_maternel"], status: "annulee", cancelledAt: at(-1, "18:00") });
  const a = answer(r, nadia, "retenue", 60);
  const g = book(a, 120, { status: "annulee", cancelledAt: at(-1, "18:00"), cancelledBy: "famille", cancelledByUserId: julie.id, cancellationKind: "annulation", cancellationReason: "imprevu" });
  conversation(a, [["famille", "Je suis désolée, nous devons annuler, ma mère vient finalement nous aider.", 5560]], g.confirmedAt);
  credit(julie, g, "annulation_famille", at(-1, "18:00"));
}
request({ family: julie, offset: 6, start: "20:00", createdOffset: -1, children: newborn(5), feedings: ["allaitement_maternel"], priority: nadia });

// Sophie (Découverte, Etterbeek): an urgent request, one she cancelled, and a garde the professional cancelled.
request({ family: sophie, offset: 1, start: "19:30", createdOffset: 0, children: newborn(1), feedings: ["allaitement_maternel"], reason: "Mon conjoint est en déplacement cette semaine." });
request({ family: sophie, offset: 4, start: "21:00", createdOffset: -3, children: newborn(1), feedings: ["lait_infantile"], status: "annulee", cancelledAt: at(-2, "09:00") });
{
  const r = request({ family: sophie, offset: 8, start: "20:00", createdOffset: -6, children: newborn(2), feedings: ["allaitement_maternel"], status: "annulee", cancelledAt: at(-1, "08:30") });
  const a = answer(r, amelie, "retenue", 80);
  const g = book(a, 240, { status: "annulee", cancelledAt: at(-1, "08:30"), cancelledBy: "professionnelle", cancelledByUserId: amelie.id, cancellationKind: "annulation", cancellationReason: "malade" });
  conversation(a, [["professionnelle", "Je suis malade et je dois annuler, je suis vraiment navrée. Votre crédit est sur votre compte.", 6400]], g.confirmedAt);
  credit(sophie, g, "annulation_professionnelle", at(-1, "08:30"));
}

// Claire (Une nuit, Namur): her paid night pass opens one garde, to come.
{
  const r = request({ family: claire, offset: 2, start: "20:00", createdOffset: -1, children: newborn(8), feedings: ["lait_infantile"], status: "attribuee" });
  const a = answer(r, charlotte, "retenue", 50);
  const g = book(a, 100);
  conversation(a, [["professionnelle", "Bonjour Claire, à jeudi. Avez-vous un tire-lait ou faut-il que j'apporte des biberons ?", 110]], g.confirmedAt, false);
}

// Anne (Sérénité impayée, Liège): an absence reported and contested (litige), and a past garde rated.
{
  const r = request({ family: anne, offset: -4, start: "20:00", createdOffset: -9, children: newborn(7), feedings: ["allaitement_maternel"], status: "annulee", cancelledAt: at(-3, "08:00") });
  const a = answer(r, sarah, "retenue", 70);
  const g = book(a, 160, {
    status: "annulee", cancelledAt: at(-3, "08:00"), cancelledBy: "professionnelle", cancelledByUserId: anne.id, cancellationKind: "absence",
    disputedAt: at(-3, "11:00"), disputedByUserId: sarah.id, reminderSentAt: at(-5, "10:00"),
  });
  conversation(a, [
    ["famille", "Nous vous avons attendue toute la soirée.", 7140],
    ["professionnelle", "Je suis venue à 20 h et personne n'a ouvert, j'ai sonné plusieurs fois.", 7160],
  ], g.confirmedAt);
  credit(anne, g, "absence_professionnelle", at(-3, "08:00"), { voidedAt: at(-3, "11:00") });
}
{
  const r = request({ family: anne, offset: -25, start: "21:00", createdOffset: -30, children: newborn(2), feedings: ["allaitement_maternel"], status: "attribuee" });
  const a = answer(r, sarah, "retenue", 40);
  const g = book(a, 100, { reminderSentAt: at(-26, "10:00") });
  conversation(a, [], g.confirmedAt);
  rate(g, at(-24, "08:00"), [4, 5, 5, 4], [5, 5, 4, 5]);
}

// Hélène has no subscription: her space invites her to choose a plan.
void helene;
void elise;

// ---------------------------------------------------------------------------
// Empty, then fill
// ---------------------------------------------------------------------------

const TABLES = [
  "users", "family_profiles", "user_consents", "sign_in_codes", "trusted_devices", "professional_profiles",
  "professional_communes", "professional_reach", "professional_documents", "professional_declarations",
  "professional_availability", "care_requests", "care_request_applications", "bookings", "conversations", "messages",
  "payments", "subscriptions", "night_passes", "ratings", "rating_invitations", "favourites", "credits",
  "credit_spends", "app_settings", "admin_journal",
];

async function main(): Promise<void> {
  const url = await guard();
  if (process.argv.includes("--check")) return;
  process.env.DATABASE_URL = url;

  await db.batch([
    db.execute(sql.raw(`alter table admin_journal disable trigger admin_journal_no_truncate`)),
    db.execute(sql.raw(`truncate table ${TABLES.map((t) => `"${t}"`).join(", ")} cascade`)),
    db.execute(sql.raw(`alter table admin_journal enable trigger admin_journal_no_truncate`)),
  ]);
  // The copy of UAT's identities goes too: the demo makes none.
  try {
    await db.execute(sql.raw(`do $$ begin
      if to_regclass('neon_auth.user') is not null then execute 'truncate table neon_auth."user" cascade'; end if;
    end $$`));
  } catch (error) {
    console.warn("[demo] neon_auth not emptied:", error instanceof Error ? error.message : error);
  }
  console.log("[demo] emptied every table");

  await db.batch([
    db.insert(users).values(rows.users),
    db.insert(familyProfiles).values(rows.familyProfiles),
    db.insert(userConsents).values(rows.userConsents),
    db.insert(professionalProfiles).values(rows.professionalProfiles),
    db.insert(professionalCommunes).values(rows.professionalCommunes),
    db.insert(professionalReach).values(rows.professionalReach),
    db.insert(professionalDocuments).values(rows.professionalDocuments),
    db.insert(professionalDeclarations).values(rows.professionalDeclarations),
    db.insert(professionalAvailability).values(rows.professionalAvailability),
    db.insert(subscriptions).values(rows.subscriptions),
    db.insert(nightPasses).values(rows.nightPasses),
    db.insert(careRequests).values(rows.careRequests),
    db.insert(careRequestApplications).values(rows.applications),
    db.insert(bookings).values(rows.bookings),
    db.insert(payments).values(rows.payments),
    db.insert(conversations).values(rows.conversations),
    db.insert(messages).values(rows.messages),
    db.insert(ratings).values(rows.ratings),
    db.insert(ratingInvitations).values(rows.ratingInvitations),
    db.insert(favourites).values(rows.favourites),
    db.insert(credits).values(rows.credits),
    db.insert(appSettings).values({ key: "delai_annulation_heures", value: 24 }),
    db.insert(adminJournal).values(rows.adminJournal),
  ]);

  const counts = Object.entries(rows).map(([name, list]) => `${name} ${list.length}`).join(", ");
  console.log(`[demo] filled: ${counts}`);
  console.log("\nThe demo accounts. Sign in on http://localhost:3000 with `npm run demo:dev` running:\n");
  for (const account of accounts) {
    console.log(`  ${account.role.padEnd(13)} ${account.name.padEnd(18)} ${account.email.padEnd(44)} ${account.note}`);
    console.log(`  ${"".padEnd(13)} http://localhost:3000${DEMO_SIGN_IN_PATH}?compte=${account.key}`);
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => fail(error instanceof Error ? (error.stack ?? error.message) : String(error)),
);
