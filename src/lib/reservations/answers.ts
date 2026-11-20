import "server-only";

import { and, asc, count, eq, exists, inArray, sql, type AnyColumn, type SQL } from "drizzle-orm";

import {
  careRequestApplications,
  careRequests,
  db,
  professionalDocuments,
  professionalProfiles,
  users,
  bookings,
  type Profession,
} from "@/db";
import { notSuspended, suspendedAtExactly } from "@/lib/auth/suspension";
import { notesOfProfiles, NO_NOTE, type Note } from "@/lib/avis/ratings";
import { nightAhead, professionalProfileOf, UUID } from "@/lib/demandes/requests";
import { TIME_ZONE } from "@/lib/demandes/rules";
import { withConversation, withSeriesConversation } from "@/lib/messagerie/conversations";

import { answerRefusal, readProposal, type AnswerRefusal, type ApplicationStatus, type Rates } from "./rules";

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

/**
 * Whether a professional reaches a commune (zone-rayon-lecture): « Toute la
 * Belgique », or the commune in `professional_reach`, her own communes
 * included. `answerRequest` reads it before the answer, and its INSERT holds it
 * again. Exported for its test.
 */
export function reachesCommune(profileId: string | SQL, communeIns: AnyColumn | SQL): SQL<boolean> {
  return sql<boolean>`(
    exists (select 1 from professional_profiles zp where zp.id = ${profileId} and zp.zone_whole_belgium)
    or exists (select 1 from professional_reach pr where pr.profile_id = ${profileId} and pr.commune_ins = ${communeIns})
  )`;
}

export type AnswerResult =
  | { ok: true; applicationId: string; answerCount: number }
  | { ok: false; reason: AnswerRefusal | "introuvable" };

/**
 * Records her answer, or says why not. The rules are read first for a precise
 * message (`answerRefusal`), then held again by the INSERT itself, so a request
 * booked or cancelled a moment earlier is never answered. A withdrawn answer is
 * given again on the same row, at her current rate (D-73, D-74). `proposed` is
 * the start she proposes in place of the family's (JAM-306): a half hour of
 * the request's range, refused as « horaire » otherwise. None, or the
 * family's own start, saves no proposal. A re-answer writes it again, so she
 * changes or removes her proposal by answering again.
 */
export async function answerRequest(
  userId: string,
  requestId: string,
  now: Date,
  proposed: string | null = null,
): Promise<AnswerResult> {
  if (!UUID.test(requestId)) return { ok: false, reason: "introuvable" };
  const profile = await professionalProfileOf(userId);
  if (!profile) return { ok: false, reason: "nonValide" };

  const [row] = await db
    .select({
      status: careRequests.status,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      priorityProfileId: careRequests.priorityProfileId,
      servesCommune: reachesCommune(profile.id, careRequests.communeIns),
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

  const proposal = readProposal(row.startTime, proposed);
  if (!proposal.ok) return { ok: false, reason: "horaire" };
  const refusal = answerRefusal(
    {
      profile,
      request: row,
      servesCommune: row.servesCommune,
      answer: row.answer,
      bookedThatNight: row.bookedThatNight,
      proposedStartTime: proposal.proposed,
    },
    now,
  );
  if (refusal) return { ok: false, reason: refusal };

  const at = now.toISOString();
  // The answer and its conversation, with Berceo's amorce, in one statement (messagerie, D-87).
  const written = await db.execute<{ id: string; answer_count: number }>(withConversation(sql`
    insert into care_request_applications
      (request_id, profile_id, night_rate_eur, extra_hour_rate_eur, proposed_start_time, answered_at, created_at, updated_at)
    select r.id, p.id, p.night_rate_eur, p.extra_hour_rate_eur,
           -- Her proposed start (JAM-306): never the family's own start.
           nullif(${proposal.proposed}::time, r.start_time),
           ${at}::timestamptz, ${at}::timestamptz, ${at}::timestamptz
    from care_requests r, professional_profiles p
    where r.id = ${requestId}
      and p.id = ${profile.id}
      and p.status = 'valide'
      and ${notSuspended(sql`p.user_id`)}
      and p.night_rate_eur is not null
      and r.status = 'ouverte'
      -- A night of a regular request is answered with all its nights (JAM-302, answerSeries).
      and not r.series_whole
      and (r.night_date + r.start_time) > (now() at time zone ${TIME_ZONE})
      and (r.night_date + coalesce(${proposal.proposed}::time, r.start_time)) > (now() at time zone ${TIME_ZONE})
      and (
        r.priority_profile_id = p.id
        or ${reachesCommune(sql`p.id`, sql`r.commune_ins`)}
      )
      and not exists (
        select 1 from bookings b
        where b.profile_id = p.id and b.night_date = r.night_date and b.status = 'confirmee'
      )
    on conflict (request_id, profile_id) do update
      set status = 'en_attente',
          night_rate_eur = excluded.night_rate_eur,
          extra_hour_rate_eur = excluded.extra_hour_rate_eur,
          proposed_start_time = excluded.proposed_start_time,
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

export type SeriesAnswerResult =
  | { ok: true; applicationId: string; answerCount: number }
  | { ok: false; reason: AnswerRefusal | "introuvable" };

/**
 * Her proposed start for the night `nightId` of a regular request (JAM-306),
 * as SQL: the value of the list for that night, or null. Exported for its test.
 */
export function seriesProposal(proposed: readonly (readonly [string, string])[], nightId: SQL = sql`ok.id`): SQL {
  if (proposed.length === 0) return sql`null::time`;
  const values = sql.join(
    proposed.map(([id, start]) => sql`(${id}::uuid, ${start}::time)`),
    sql`, `,
  );
  return sql`(select h.start from (values ${values}) as h(request_id, start) where h.request_id = ${nightId})`;
}

/** The open nights ahead of a regular request answered as one (JAM-302), as a subquery. */
function openSeriesNights(seriesId: string): SQL {
  return sql`
    select r.id, r.night_date, r.start_time, r.commune_ins, r.priority_profile_id
    from care_requests r
    where r.series_id = ${seriesId} and r.series_whole
      and r.status = 'ouverte'
      and (r.night_date + r.start_time) > (now() at time zone ${TIME_ZONE})
  `;
}

/**
 * Her answer to a regular request (JAM-302): all its open nights ahead, or
 * none. Each night is read with `answerRefusal`, the first refusal is hers. The
 * INSERT holds the rules again and writes every night or no night: a night
 * booked, cancelled or answered a moment earlier refuses the whole answer
 * (Q5: a night she is booked keeps her from answering). One conversation is
 * made, on the last night's answer, so it stays open until the last night ends
 * (messagerie, D-87). The returned answer is the first night's: the family's
 * e-mail names it.
 */
export async function answerSeries(
  userId: string,
  seriesId: string,
  now: Date,
  /** The start she proposes for a night, by request id (JAM-306). A night with none keeps the family's. */
  proposals: ReadonlyMap<string, string> = new Map(),
): Promise<SeriesAnswerResult> {
  if (!UUID.test(seriesId)) return { ok: false, reason: "introuvable" };
  const profile = await professionalProfileOf(userId);
  if (!profile) return { ok: false, reason: "nonValide" };

  const nights = await db
    .select({
      id: careRequests.id,
      status: careRequests.status,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      priorityProfileId: careRequests.priorityProfileId,
      servesCommune: reachesCommune(profile.id, careRequests.communeIns),
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
    .where(and(eq(careRequests.seriesId, seriesId), eq(careRequests.seriesWhole, true), eq(careRequests.status, "ouverte"), nightAhead));
  if (nights.length === 0) return { ok: false, reason: "introuvable" };

  // Her proposals, read night by night (JAM-306). A proposal for a night that is not of this request is ignored.
  const proposed: [string, string][] = [];
  for (const night of nights) {
    const proposal = readProposal(night.startTime, proposals.get(night.id));
    if (!proposal.ok) return { ok: false, reason: "horaire" };
    if (proposal.proposed) proposed.push([night.id, proposal.proposed]);
    const refusal = answerRefusal(
      {
        profile,
        request: night,
        servesCommune: night.servesCommune,
        answer: night.answer,
        bookedThatNight: night.bookedThatNight,
        proposedStartTime: proposal.proposed,
      },
      now,
    );
    if (refusal) return { ok: false, reason: refusal };
  }

  const at = now.toISOString();
  const open = openSeriesNights(seriesId);
  // The nights she may answer: the same rules as `answerRequest`'s INSERT, night by night.
  const answerable = sql`
    select n.id, n.night_date, n.start_time from (${open}) n, professional_profiles p
    where p.id = ${profile.id}
      and p.status = 'valide'
      and ${notSuspended(sql`p.user_id`)}
      and p.night_rate_eur is not null
      and (n.priority_profile_id = p.id or ${reachesCommune(sql`p.id`, sql`n.commune_ins`)})
      and not exists (
        select 1 from bookings b
        where b.profile_id = p.id and b.night_date = n.night_date and b.status = 'confirmee'
      )
      and not exists (
        select 1 from care_request_applications x
        where x.request_id = n.id and x.profile_id = p.id and x.status <> 'retiree'
      )
  `;
  // Every night or none: the INSERT writes only when she may answer each open night.
  const written = await db.execute<{ id: string; answer_count: number; night_date: string }>(
    withSeriesConversation(
      sql`
        insert into care_request_applications
          (request_id, profile_id, night_rate_eur, extra_hour_rate_eur, proposed_start_time, answered_at, created_at, updated_at)
        select ok.id, p.id, p.night_rate_eur, p.extra_hour_rate_eur,
               nullif(${seriesProposal(proposed)}, ok.start_time),
               ${at}::timestamptz, ${at}::timestamptz, ${at}::timestamptz
        from (${answerable}) ok, professional_profiles p
        where p.id = ${profile.id}
          and (select count(*) from (${answerable}) a) = (select count(*) from (${open}) n)
          -- A start she proposes before the family's must be ahead too: one such night refuses the whole answer.
          and not exists (
            select 1 from (${answerable}) late
            where (late.night_date + coalesce(${seriesProposal(proposed, sql`late.id`)}, late.start_time)) <= (now() at time zone ${TIME_ZONE})
          )
        on conflict (request_id, profile_id) do update
          set status = 'en_attente',
              night_rate_eur = excluded.night_rate_eur,
              extra_hour_rate_eur = excluded.extra_hour_rate_eur,
              proposed_start_time = excluded.proposed_start_time,
              answered_at = excluded.answered_at,
              answer_count = care_request_applications.answer_count + 1,
              updated_at = excluded.updated_at
          where care_request_applications.status = 'retiree'
        returning id, answer_count, request_id, profile_id
      `,
      at,
    ),
  );
  const [first] = written.rows;
  // A night moved between the read and the write: booked, cancelled, answered.
  if (!first) return { ok: false, reason: "fermee" };
  return { ok: true, applicationId: first.id, answerCount: Number(first.answer_count) };
}

/**
 * Withdraws her waiting answer on every open night ahead of a regular request
 * (JAM-302), while the request is open: she answered all its nights at once.
 */
export async function withdrawSeries(userId: string, seriesId: string, now: Date): Promise<boolean> {
  if (!UUID.test(seriesId)) return false;
  const profile = await professionalProfileOf(userId);
  if (!profile) return false;
  const updated = await db
    .update(careRequestApplications)
    .set({ status: "retiree", updatedAt: now })
    .where(
      and(
        eq(careRequestApplications.profileId, profile.id),
        eq(careRequestApplications.status, "en_attente"),
        inArray(
          careRequestApplications.requestId,
          db
            .select({ id: careRequests.id })
            .from(careRequests)
            .where(
              and(
                eq(careRequests.seriesId, seriesId),
                eq(careRequests.seriesWhole, true),
                eq(careRequests.status, "ouverte"),
                nightAhead,
              ),
            ),
        ),
      ),
    )
    .returning({ id: careRequestApplications.id });
  return updated.length > 0;
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
            .where(
              and(
                eq(careRequests.id, requestId),
                eq(careRequests.status, "ouverte"),
                nightAhead,
                // Her answer on a regular request is withdrawn for all its nights (JAM-302, withdrawSeries).
                eq(careRequests.seriesWhole, false),
              ),
            ),
        ),
      ),
    )
    .returning({ id: careRequestApplications.id });
  return updated.length > 0;
}

/**
 * A suspension's part here (back-office-admin, D-134): every answer of hers
 * still waiting becomes `retiree`, as if she had withdrawn it, in the
 * suspension's own batch and only if that batch suspended her at `at`.
 */
export function suspensionWithdrawsAnswers(userId: string, at: Date) {
  return db
    .update(careRequestApplications)
    .set({ status: "retiree", updatedAt: at })
    .where(
      and(
        eq(careRequestApplications.status, "en_attente"),
        inArray(
          careRequestApplications.profileId,
          db
            .select({ id: professionalProfiles.id })
            .from(professionalProfiles)
            .where(eq(professionalProfiles.userId, userId)),
        ),
        suspendedAtExactly(userId, at),
      ),
    )
    .returning({ id: careRequestApplications.id });
}

/**
 * True only inside the batch that moved her profile out of `valide` at exactly
 * `at` (reservations-reponse-suspendue, D-146): a reopening that changed
 * nothing, or a profile still `valide`, withdraws nothing.
 */
function reopenedAtExactly(profileId: string, at: Date): SQL {
  return sql`exists (select 1 from professional_profiles as rp where rp.id = ${profileId}::uuid and rp.status <> 'valide' and rp.updated_at = ${at.toISOString()}::timestamptz)`;
}

/**
 * A reopening's part here (reservations-reponse-suspendue, D-146): every answer
 * of hers still waiting becomes `retiree`, as if she had withdrawn it, in the
 * reopening's own batch and only if that batch moved her profile out of
 * `valide` at `at`. Once validated again she answers afresh, at her current
 * rate, on the request's current night.
 */
export function reopeningWithdrawsAnswers(profileId: string, at: Date) {
  return db
    .update(careRequestApplications)
    .set({ status: "retiree", updatedAt: at })
    .where(
      and(
        eq(careRequestApplications.status, "en_attente"),
        eq(careRequestApplications.profileId, profileId),
        reopenedAtExactly(profileId, at),
      ),
    )
    .returning({ id: careRequestApplications.id });
}

/** What her waiting answer saved: its rates (JAM-344) and the start she proposed, if any (JAM-306). */
export type SavedAnswer = Rates & { proposedStartTime: string | null };

/**
 * The rates and the proposed start saved on her own waiting answers to these requests, by request id
 * (JAM-344): what the family reads of her, so her list and the request page
 * show her the same amount. Only her answers, by her user id, and only those
 * still `en_attente`: a withdrawn answer is given again at her current rate
 * (D-74). For a regular request, pass each night's id: an answer is one row for
 * each night.
 */
export async function savedRatesOfAnswers(
  userId: string,
  requestIds: readonly string[],
): Promise<Map<string, SavedAnswer>> {
  const ids = requestIds.filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const rows = await savedRatesQuery(userId, ids);
  return new Map(
    rows.map((row) => [
      row.requestId,
      {
        nightRateEur: row.nightRateEur,
        extraHourRateEur: row.extraHourRateEur,
        proposedStartTime: row.proposedStartTime,
      },
    ]),
  );
}

/** `savedRatesOfAnswers`' query, built and not run. */
export function savedRatesQuery(userId: string, requestIds: string[]) {
  return db
    .select({
      requestId: careRequestApplications.requestId,
      nightRateEur: careRequestApplications.nightRateEur,
      extraHourRateEur: careRequestApplications.extraHourRateEur,
      proposedStartTime: careRequestApplications.proposedStartTime,
    })
    .from(careRequestApplications)
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .where(
      and(
        eq(professionalProfiles.userId, userId),
        eq(careRequestApplications.status, "en_attente"),
        inArray(careRequestApplications.requestId, requestIds),
      ),
    );
}

/** An answer as the family compares it. */
export type Applicant = {
  applicationId: string;
  profileId: string;
  firstName: string;
  profession: Profession | null;
  nightRateEur: number;
  extraHourRateEur: number | null;
  photoId: string | null;
  answeredAt: Date;
  /** The start she proposes for the night in place of the family's (JAM-306); null for none. */
  proposedStartTime: string | null;
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
      extraHourRateEur: careRequestApplications.extraHourRateEur,
      photoId,
      answeredAt: careRequestApplications.answeredAt,
      proposedStartTime: careRequestApplications.proposedStartTime,
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

/** An answer to a regular request (JAM-302): one professional for all its open nights ahead. */
export type SeriesApplicant = Applicant & {
  /** Her answer on each open night ahead, in night order, with the start she proposes for it (JAM-306). */
  nights: {
    requestId: string;
    applicationId: string;
    nightDate: string;
    nightRateEur: number;
    startTime: string;
    extraHours: number;
    proposedStartTime: string | null;
  }[];
};

/**
 * « Les professionnelles qui ont répondu à votre demande » for a regular
 * request (JAM-302): the professionals whose answer waits on every one of its
 * open nights ahead, earliest first. One who no longer covers every night (she
 * was booked elsewhere one of them, Q5) is not offered.
 */
export async function familySeriesAnswers(userId: string, seriesId: string): Promise<SeriesApplicant[]> {
  if (!UUID.test(seriesId)) return [];
  const open = and(
    eq(careRequests.seriesId, seriesId),
    eq(careRequests.seriesWhole, true),
    eq(careRequests.status, "ouverte"),
    nightAhead,
  );
  const [nights, rows] = await Promise.all([
    db.select({ id: careRequests.id }).from(careRequests).where(and(open, eq(careRequests.familyUserId, userId))),
    db
      .select({
        applicationId: careRequestApplications.id,
        requestId: careRequests.id,
        nightDate: careRequests.nightDate,
        startTime: careRequests.startTime,
        extraHours: careRequests.extraHours,
        proposedStartTime: careRequestApplications.proposedStartTime,
        profileId: professionalProfiles.id,
        firstName: users.firstName,
        profession: professionalProfiles.profession,
        nightRateEur: careRequestApplications.nightRateEur,
        extraHourRateEur: careRequestApplications.extraHourRateEur,
        photoId,
        answeredAt: careRequestApplications.answeredAt,
      })
      .from(careRequestApplications)
      .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
      .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
      .innerJoin(users, eq(users.id, professionalProfiles.userId))
      .where(and(open, waitingOnHers(userId)))
      .orderBy(asc(careRequestApplications.answeredAt)),
  ]);
  if (nights.length === 0) return [];

  const byProfile = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byProfile.get(row.profileId);
    if (list) list.push(row);
    else byProfile.set(row.profileId, [row]);
  }
  const complete = [...byProfile.values()].filter((list) => list.length === nights.length);
  const notes = await notesOfProfiles(complete.map((list) => list[0].profileId));
  return complete.map((list) => {
    const sorted = [...list].sort((a, b) => a.nightDate.localeCompare(b.nightDate));
    const [first] = sorted;
    return {
      applicationId: first.applicationId,
      profileId: first.profileId,
      firstName: first.firstName,
      profession: first.profession,
      nightRateEur: first.nightRateEur,
      extraHourRateEur: first.extraHourRateEur,
      photoId: first.photoId,
      answeredAt: first.answeredAt,
      proposedStartTime: first.proposedStartTime,
      note: notes.get(first.profileId) ?? NO_NOTE,
      nights: sorted.map((row) => ({
        requestId: row.requestId,
        applicationId: row.applicationId,
        nightDate: row.nightDate,
        nightRateEur: row.nightRateEur,
        startTime: row.startTime,
        extraHours: row.extraHours,
        proposedStartTime: row.proposedStartTime,
      })),
    };
  });
}

/**
 * How many answers professionals ever gave on her request, whatever their
 * state, and on every night of it when it is a regular request (JAM-302, Q4):
 * one answer locks editing.
 */
export async function answersEver(userId: string, requestId: string): Promise<number> {
  if (!UUID.test(requestId)) return 0;
  const result = await db.execute<{ n: number }>(sql`
    select count(*)::integer as n
    from care_request_applications a
    join care_requests ar on ar.id = a.request_id
    join care_requests self on self.id = ${requestId} and self.family_user_id = ${userId}
    where ar.id = self.id or (self.series_whole and ar.series_id = self.series_id)
  `);
  return Number(result.rows[0]?.n ?? 0);
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
): Promise<{
  applicationId: string;
  status: ApplicationStatus;
  nightRateEur: number;
  extraHourRateEur: number | null;
  /** The start she proposes in place of the family's (JAM-306); null for none. */
  proposedStartTime: string | null;
} | null> {
  if (!UUID.test(requestId) || !UUID.test(profileId)) return null;
  const [row] = await db
    .select({
      applicationId: careRequestApplications.id,
      status: careRequestApplications.status,
      nightRateEur: careRequestApplications.nightRateEur,
      extraHourRateEur: careRequestApplications.extraHourRateEur,
      proposedStartTime: careRequestApplications.proposedStartTime,
    })
    .from(careRequestApplications)
    .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .where(
      and(
        eq(careRequestApplications.requestId, requestId),
        eq(careRequestApplications.profileId, profileId),
        waitingOnHers(userId),
        // A regular request is booked for all its nights, from its own page (JAM-302).
        eq(careRequests.seriesWhole, false),
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
          // A regular request is not republished night by night (JAM-302): it is cancelled and published again.
          sql`not ${careRequests.seriesWhole}`,
          exists(waiting),
        ),
      )
      .returning({ id: careRequests.id, urgent: careRequests.urgent }),
    republishDeclinesAnswers(userId, requestId, now),
  ]);

  const [request] = marked;
  if (!request) return { ok: false };
  return { ok: true, urgent: request.urgent, declined: declined.map((a) => a.id) };
}

/**
 * `republishRequest`'s second statement: every answer still waiting on her
 * request becomes `non_retenue`, only if the first statement marked it
 * republished at `now`. A withdrawn, declined or booked answer is left as it
 * is (D-70).
 */
export function republishDeclinesAnswers(userId: string, requestId: string, now: Date) {
  return db
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
    .returning({ id: careRequestApplications.id });
}
