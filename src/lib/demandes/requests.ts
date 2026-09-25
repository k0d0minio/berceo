import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { careRequests, db, professionalCommunes, professionalProfiles, users } from "@/db";
import { familyCommune } from "@/lib/famille/profile";

import { isChangeable, TIME_ZONE } from "./rules";
import type { RequestValues } from "./validation";

/**
 * Every read and write of a care request. The family's functions take her id
 * from the session (the caller's `requireAccess`), never from a form, and
 * answer only for her own rows: another family's id reads as not found.
 *
 * What a professional reads is `cardColumns`: the night, the children, the
 * commune. Never the family's id, name, e-mail, phone or address (D-15); the
 * tests hold the list of columns.
 */

/** The columns a request card shows, to the family and to a professional. */
export const cardColumns = {
  id: careRequests.id,
  urgent: careRequests.urgent,
  nightDate: careRequests.nightDate,
  startTime: careRequests.startTime,
  children: careRequests.children,
  babyAgeValue: careRequests.babyAgeValue,
  babyAgeUnit: careRequests.babyAgeUnit,
  communeIns: careRequests.communeIns,
  postcode: careRequests.postcode,
  locality: careRequests.locality,
  createdAt: careRequests.createdAt,
};

/** The family's own view adds the status. */
const familyColumns = { ...cardColumns, status: careRequests.status };

export type RequestCard = {
  id: string;
  urgent: boolean;
  nightDate: string;
  startTime: string;
  children: "un_bebe" | "jumeaux";
  babyAgeValue: number;
  babyAgeUnit: "semaines" | "mois";
  communeIns: string;
  postcode: string;
  locality: string;
  createdAt: Date;
};

export type FamilyRequest = RequestCard & { status: "ouverte" | "annulee" };

/** The night has not started yet, in Brussels (`date + time` is a local timestamp). */
const nightAhead = sql`(${careRequests.nightDate} + ${careRequests.startTime}) > (now() AT TIME ZONE ${TIME_ZONE})`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres' unique_violation: here, a second open request for the same night. */
function isUniqueViolation(error: unknown): boolean {
  const code = (candidate: unknown) =>
    candidate && typeof candidate === "object" && "code" in candidate
      ? (candidate as { code: unknown }).code
      : undefined;
  const cause = error && typeof error === "object" && "cause" in error ? error.cause : undefined;
  return code(error) === "23505" || code(cause) === "23505";
}

/** Logs a failed write without the error itself: Drizzle's message lists the query's parameters. */
export function logWriteError(what: string, context: Record<string, unknown>, error: unknown): void {
  const cause = (error as { cause?: { code?: unknown } } | null)?.cause;
  console.error(`[demandes] ${what}`, {
    ...context,
    error: error instanceof Error ? error.name : typeof error,
    code: typeof cause?.code === "string" ? cause.code : undefined,
  });
}

// ---------------------------------------------------------------------------
// The family
// ---------------------------------------------------------------------------

export type PublishResult =
  | { ok: true; id: string }
  | { ok: false; reason: "commune" | "doublon" };

/**
 * Publishes a request for the family `userId`. The commune is her profile's,
 * copied now (D-53); without one there is nothing to publish.
 */
export async function publishRequest(
  userId: string,
  values: RequestValues,
  urgent: boolean,
  now: Date,
): Promise<PublishResult> {
  const commune = await familyCommune(userId);
  if (!commune) return { ok: false, reason: "commune" };

  try {
    const [row] = await db
      .insert(careRequests)
      .values({
        familyUserId: userId,
        urgent,
        ...values,
        communeIns: commune.ins,
        postcode: commune.postcode,
        locality: commune.locality,
        noMedicalConditionAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: careRequests.id });
    return { ok: true, id: row.id };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "doublon" };
    throw error;
  }
}

/** Her requests: the ones she can still change first, by night, then the others, latest night first. */
export async function familyRequests(userId: string, now: Date): Promise<FamilyRequest[]> {
  const rows = await db
    .select(familyColumns)
    .from(careRequests)
    .where(eq(careRequests.familyUserId, userId));

  const key = (r: FamilyRequest) => `${r.nightDate}T${r.startTime}`;
  const open = rows.filter((r) => isChangeable(r, now)).sort((a, b) => key(a).localeCompare(key(b)));
  const closed = rows.filter((r) => !isChangeable(r, now)).sort((a, b) => key(b).localeCompare(key(a)));
  return [...open, ...closed];
}

/** One of her requests, or null: an unknown id and another family's id read the same. */
export async function ownRequest(userId: string, id: string): Promise<FamilyRequest | null> {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select(familyColumns)
    .from(careRequests)
    .where(and(eq(careRequests.id, id), eq(careRequests.familyUserId, userId)))
    .limit(1);
  return row ?? null;
}

/** Only her own open request whose night has not started changes. */
function changeable(userId: string, id: string) {
  return and(
    eq(careRequests.id, id),
    eq(careRequests.familyUserId, userId),
    eq(careRequests.status, "ouverte"),
    nightAhead,
  );
}

export type ChangeResult = "ok" | "nonModifiable" | "doublon";

/** Saves an edit: the night, the start, the children, the age. Never the commune or the urgency. */
export async function updateRequest(
  userId: string,
  id: string,
  values: RequestValues,
  now: Date,
): Promise<ChangeResult> {
  if (!UUID.test(id)) return "nonModifiable";
  try {
    const updated = await db
      .update(careRequests)
      .set({ ...values, updatedAt: now })
      .where(changeable(userId, id))
      .returning({ id: careRequests.id });
    return updated.length > 0 ? "ok" : "nonModifiable";
  } catch (error) {
    if (isUniqueViolation(error)) return "doublon";
    throw error;
  }
}

/** Cancels her open request; it leaves every professional's list at once. */
export async function cancelRequest(userId: string, id: string, now: Date): Promise<ChangeResult> {
  if (!UUID.test(id)) return "nonModifiable";
  const cancelled = await db
    .update(careRequests)
    .set({ status: "annulee", cancelledAt: now, updatedAt: now })
    .where(changeable(userId, id))
    .returning({ id: careRequests.id });
  return cancelled.length > 0 ? "ok" : "nonModifiable";
}

// ---------------------------------------------------------------------------
// The professional
// ---------------------------------------------------------------------------

export type ProfessionalView =
  | { validated: false }
  | { validated: true; requests: RequestCard[] };

/**
 * The open requests in the communes she serves, urgent first, then newest
 * first. Only a validated profile sees any (D-5, D-10).
 */
export async function professionalRequests(userId: string): Promise<ProfessionalView> {
  const [profile] = await db
    .select({ id: professionalProfiles.id, status: professionalProfiles.status })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  if (!profile || profile.status !== "valide") return { validated: false };

  const requests = await db
    .select(cardColumns)
    .from(careRequests)
    .where(
      and(
        eq(careRequests.status, "ouverte"),
        nightAhead,
        inArray(
          careRequests.communeIns,
          db
            .select({ ins: professionalCommunes.communeIns })
            .from(professionalCommunes)
            .where(eq(professionalCommunes.profileId, profile.id)),
        ),
      ),
    )
    .orderBy(desc(careRequests.urgent), desc(careRequests.createdAt));

  return { validated: true, requests };
}

export type Recipient = { profileId: string; email: string; firstName: string; communeIns: string };

/** Every validated professional serving one of `communes`, once per commune she serves there. */
export async function professionalsServing(communes: string[]): Promise<Recipient[]> {
  if (communes.length === 0) return [];
  return db
    .select({
      profileId: professionalProfiles.id,
      email: users.email,
      firstName: users.firstName,
      communeIns: professionalCommunes.communeIns,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .innerJoin(professionalCommunes, eq(professionalCommunes.profileId, professionalProfiles.id))
    .where(
      and(eq(professionalProfiles.status, "valide"), inArray(professionalCommunes.communeIns, communes)),
    );
}

/** A request by id, whoever published it, for the urgent e-mail. Card columns only. */
export async function requestForNotice(
  id: string,
): Promise<(RequestCard & { status: "ouverte" | "annulee" }) | null> {
  const [row] = await db.select(familyColumns).from(careRequests).where(eq(careRequests.id, id)).limit(1);
  return row ?? null;
}

/**
 * Claims every normal request no digest has carried yet, open and ahead:
 * marks it and returns it. One UPDATE, so two calls racing never claim the
 * same request twice.
 */
export async function claimDigestRequests(now: Date): Promise<RequestCard[]> {
  return db
    .update(careRequests)
    .set({ digestSentAt: now })
    .where(
      and(
        sql`${careRequests.digestSentAt} IS NULL`,
        eq(careRequests.urgent, false),
        eq(careRequests.status, "ouverte"),
        nightAhead,
      ),
    )
    .returning(cardColumns);
}
