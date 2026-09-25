import "server-only";

import { and, asc, count, eq, exists, sql } from "drizzle-orm";

import {
  careRequestApplications,
  careRequests,
  db,
  professionalCommunes,
  professionalDocuments,
  professionalProfiles,
  users,
  bookings,
  type Profession,
} from "@/db";
import { notesOfProfiles, NO_NOTE, type Note } from "@/lib/avis/ratings";
import { nightAhead, professionalProfileOf, UUID } from "@/lib/demandes/requests";
import { TIME_ZONE } from "@/lib/demandes/rules";
import { withConversation } from "@/lib/messagerie/conversations";

import { answerRefusal, type AnswerRefusal, type ApplicationStatus } from "./rules";

/**
 * Every read and write of an answer (« Je suis disponible pour cette garde »).
 * The professional's functions take her user id from the session; the
 * family's take hers, and answer only for her own requests. What a family
 * reads of a professional is her first name, profession, photo and answered
 * rate: never her surname, e-mail or phone before a booking (D-75).
 */

/** Her latest photo's file id, for `/api/fichiers/[id]`: parents may read it once she is validated. */
export const photoId = sql<string | null>`(
  select ${professionalDocuments.id} from ${professionalDocuments}
  where ${professionalDocuments.profileId} = ${professionalProfiles.id}
    and ${professionalDocuments.kind} = 'photo'
  order by ${professionalDocuments.uploadedAt} desc
  limit 1
)`;

export type AnswerResult =
  | { ok: true; applicationId: string; answerCount: number }
  | { ok: false; reason: AnswerRefusal | "introuvable" };

/**
 * Records her answer, or says why not. The rules are read first for a precise
 * message (`answerRefusal`), then held again by the INSERT itself, so a request
 * booked or cancelled a moment earlier is never answered. A withdrawn answer is
 * given again on the same row, at her current rate (D-73, D-74).
 */
export async function answerRequest(userId: string, requestId: string, now: Date): Promise<AnswerResult> {
  if (!UUID.test(requestId)) return { ok: false, reason: "introuvable" };
  const profile = await professionalProfileOf(userId);
  if (!profile) return { ok: false, reason: "nonValide" };

  const [row] = await db
    .select({
      status: careRequests.status,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      priorityProfileId: careRequests.priorityProfileId,
      servesCommune: sql<boolean>`exists (
        select 1 from ${professionalCommunes}
        where ${professionalCommunes.profileId} = ${profile.id}
          and ${professionalCommunes.communeIns} = ${careRequests.communeIns}
      )`,
      bookedThatNight: sql<boolean>`exists (
        select 1 from ${bookings}
        where ${bookings.profileId} = ${profile.id} and ${bookings.nightDate} = ${careRequests.nightDate}
          and ${bookings.status} = 'confirmee'
      )`,
      answer: careRequestApplications.status,
    })
    .from(careRequests)
    .leftJoin(
      careRequestApplications,
      and(
        eq(careRequestApplications.requestId, careRequests.id),
        eq(careRequestApplications.profileId, profile.id),
      ),
    )
    .where(eq(careRequests.id, requestId))
    .limit(1);
  if (!row) return { ok: false, reason: "introuvable" };

  const refusal = answerRefusal(
    {
      profile,
      request: row,
      servesCommune: row.servesCommune,
      answer: row.answer,
      bookedThatNight: row.bookedThatNight,
    },
    now,
  );
  if (refusal) return { ok: false, reason: refusal };

  const at = now.toISOString();
  // The answer and its conversation, with Berceo's amorce, in one statement (messagerie, D-87).
  const written = await db.execute<{ id: string; answer_count: number }>(withConversation(sql`
    insert into care_request_applications
      (request_id, profile_id, night_rate_eur, answered_at, created_at, updated_at)
    select r.id, p.id, p.night_rate_eur, ${at}::timestamptz, ${at}::timestamptz, ${at}::timestamptz
    from care_requests r, professional_profiles p
    where r.id = ${requestId}
      and p.id = ${profile.id}
      and p.status = 'valide'
      and not exists (select 1 from users su where su.id = p.user_id and su.suspended_at is not null)
      and p.night_rate_eur is not null
      and r.status = 'ouverte'
      and (r.night_date + r.start_time) > (now() at time zone ${TIME_ZONE})
      and (
        r.priority_profile_id = p.id
        or exists (
          select 1 from professional_communes pc
          where pc.profile_id = p.id and pc.commune_ins = r.commune_ins
        )
      )
      and not exists (
        select 1 from bookings b
        where b.profile_id = p.id and b.night_date = r.night_date and b.status = 'confirmee'
      )
    on conflict (request_id, profile_id) do update
      set status = 'en_attente',
          night_rate_eur = excluded.night_rate_eur,
          answered_at = excluded.answered_at,
          answer_count = care_request_applications.answer_count + 1,
          updated_at = excluded.updated_at
      where care_request_applications.status = 'retiree'
    returning id, answer_count, request_id, profile_id
  `, at));
  const [answer] = written.rows;
  // The request moved between the read and the write: booked, cancelled, answered twice.
  if (!answer) return { ok: false, reason: "fermee" };
  return { ok: true, applicationId: answer.id, answerCount: Number(answer.answer_count) };
}

/**
 * Withdraws her waiting answer while the request is open and ahead (D-73). No
 * e-mail; she leaves the family's list at once.
 */
export async function withdrawAnswer(userId: string, requestId: string, now: Date): Promise<boolean> {
  if (!UUID.test(requestId)) return false;
  const profile = await professionalProfileOf(userId);
  if (!profile) return false;
  const updated = await db
    .update(careRequestApplications)
    .set({ status: "retiree", updatedAt: now })
    .where(
      and(
        eq(careRequestApplications.requestId, requestId),
        eq(careRequestApplications.profileId, profile.id),
        eq(careRequestApplications.status, "en_attente"),
        exists(
          db
            .select({ id: careRequests.id })
            .from(careRequests)
            .where(and(eq(careRequests.id, requestId), eq(careRequests.status, "ouverte"), nightAhead)),
        ),
      ),
    )
    .returning({ id: careRequestApplications.id });
  return updated.length > 0;
}

/** An answer as the family compares it. */
export type Applicant = {
  applicationId: string;
  profileId: string;
  firstName: string;
  profession: Profession | null;
  nightRateEur: number;
  photoId: string | null;
  answeredAt: Date;
  /** Her note and gardes count (avis-etoiles, D-119). */
  note: Note;
};

/** Only answers still waiting, of professionals still validated and not suspended (D-134), on her own request. */
function waitingOnHers(userId: string) {
  return and(
    eq(careRequestApplications.status, "en_attente"),
    eq(professionalProfiles.status, "valide"),
    notSuspended(professionalProfiles.userId),
    eq(careRequests.familyUserId, userId),
  );
}

/**
 * « Les professionnelles qui ont répondu à votre demande »: the waiting
 * answers on her request, earliest first. Another family's request reads empty.
 */
export async function familyAnswers(userId: string, requestId: string): Promise<Applicant[]> {
  if (!UUID.test(requestId)) return [];
  const rows = await db
    .select({
      applicationId: careRequestApplications.id,
      profileId: professionalProfiles.id,
      firstName: users.firstName,
      profession: professionalProfiles.profession,
      nightRateEur: careRequestApplications.nightRateEur,
      photoId,
      answeredAt: careRequestApplications.answeredAt,
    })
    .from(careRequestApplications)
    .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(and(eq(careRequestApplications.requestId, requestId), waitingOnHers(userId)))
    .orderBy(asc(careRequestApplications.answeredAt));
  const notes = await notesOfProfiles(rows.map((row) => row.profileId));
  return rows.map((row) => ({ ...row, note: notes.get(row.profileId) ?? NO_NOTE }));
}

/** How many answers wait on each of her requests (« 2 réponses »), by request id. */
export async function pendingCounts(userId: string): Promise<Map<string, number>> {
  const rows = await db
    .select({ requestId: careRequestApplications.requestId, n: count() })
    .from(careRequestApplications)
    .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .where(waitingOnHers(userId))
    .groupBy(careRequestApplications.requestId);
  return new Map(rows.map((r) => [r.requestId, Number(r.n)]));
}

/**
 * The answer of one professional on one of her requests, when it still waits:
 * what her profile page needs to offer « Accepter et réserver ».
 */
export async function waitingAnswerOf(
  userId: string,
  requestId: string,
  profileId: string,
): Promise<{ applicationId: string; status: ApplicationStatus; nightRateEur: number } | null> {
  if (!UUID.test(requestId) || !UUID.test(profileId)) return null;
  const [row] = await db
    .select({
      applicationId: careRequestApplications.id,
      status: careRequestApplications.status,
      nightRateEur: careRequestApplications.nightRateEur,
    })
    .from(careRequestApplications)
    .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .where(
      and(
        eq(careRequestApplications.requestId, requestId),
        eq(careRequestApplications.profileId, profileId),
        waitingOnHers(userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export type RepublishResult =
  | { ok: true; urgent: boolean; declined: string[] }
  | { ok: false };

/**
 * « Republier ma demande » (D-70): on her open request ahead with at least one
 * waiting answer, every waiting answer is declined and the request goes out
 * again (the caller sends the urgent e-mail; a normal one waits for the next
 * digest, which carries a request republished since its last one). One
 * transaction: the request is marked first, and the answers are declined only
 * if it was.
 */
export async function republishRequest(userId: string, requestId: string, now: Date): Promise<RepublishResult> {
  if (!UUID.test(requestId)) return { ok: false };
  const waiting = db
    .select({ id: careRequestApplications.id })
    .from(careRequestApplications)
    .where(
      and(
        eq(careRequestApplications.requestId, careRequests.id),
        eq(careRequestApplications.status, "en_attente"),
      ),
    );

  const [marked, declined] = await db.batch([
    db
      .update(careRequests)
      .set({
        republishedAt: now,
        republishCount: sql`${careRequests.republishCount} + 1`,
        updatedAt: now,
      })
      .where(
        and(
          eq(careRequests.id, requestId),
          eq(careRequests.familyUserId, userId),
          eq(careRequests.status, "ouverte"),
          nightAhead,
          exists(waiting),
        ),
      )
      .returning({ id: careRequests.id, urgent: careRequests.urgent }),
    db
      .update(careRequestApplications)
      .set({ status: "non_retenue", updatedAt: now })
      .where(
        and(
          eq(careRequestApplications.requestId, requestId),
          eq(careRequestApplications.status, "en_attente"),
          exists(
            db
              .select({ id: careRequests.id })
              .from(careRequests)
              .where(
                and(
                  eq(careRequests.id, requestId),
                  eq(careRequests.familyUserId, userId),
                  eq(careRequests.republishedAt, now),
                ),
              ),
          ),
        ),
      )
      .returning({ id: careRequestApplications.id }),
  ]);

  const [request] = marked;
  if (!request) return { ok: false };
  return { ok: true, urgent: request.urgent, declined: declined.map((a) => a.id) };
}
