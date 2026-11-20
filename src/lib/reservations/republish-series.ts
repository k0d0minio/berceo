import "server-only";

import { and, eq, inArray, not, sql } from "drizzle-orm";

import { careRequestApplications, careRequests, db } from "@/db";
import { nightAhead, UUID } from "@/lib/demandes/requests";
import { TIME_ZONE } from "@/lib/demandes/rules";

import { republishSeriesResult, type RepublishSeriesResult } from "./republish-series-rules";

/**
 * « Republier ma demande » on a regular request (JAM-353). A regular request
 * is answered whole (JAM-302), so it is republished whole: each open night
 * ahead is marked, and each answer that waits on those nights is declined. The
 * nights, the times and the other values do not change. The caller tells each
 * professional (`notifyDeclined` says a regular request one time). The next
 * digest carries each marked night, because `republished_at` is later than
 * `digest_sent_at` (D-70). A regular request is never urgent, so there is no
 * e-mail at once.
 *
 * One transaction (`db.batch`): the nights are marked first, and the answers
 * are declined only on the nights that this call marked at `now`. Each
 * statement is scoped to the family's own rows, so the id of a different
 * family changes nothing.
 */
export async function republishSeries(
  userId: string,
  seriesId: string,
  now: Date,
): Promise<RepublishSeriesResult> {
  if (!UUID.test(seriesId)) return { ok: false };
  const [marked, declined] = await db.batch([
    republishSeriesStatement(userId, seriesId, now),
    republishSeriesDeclinesAnswers(userId, seriesId, now),
  ]);
  return republishSeriesResult(marked, declined);
}

/**
 * `republishSeries`'s first statement: her open nights ahead of the regular
 * request are marked republished at `now`. Nothing is marked when a night of
 * the request is booked, or when no answer waits on an open night ahead.
 */
export function republishSeriesStatement(userId: string, seriesId: string, now: Date) {
  const booked = sql`exists (
    select 1 from care_requests booked
    where booked.series_id = ${seriesId}
      and booked.family_user_id = ${userId}
      and booked.status = 'attribuee'
  )`;
  const waiting = sql`exists (
    select 1 from care_request_applications a
    join care_requests night on night.id = a.request_id
    where night.series_id = ${seriesId}
      and night.family_user_id = ${userId}
      and night.series_whole
      and night.status = 'ouverte'
      and (night.night_date + night.start_time) > (now() AT TIME ZONE ${TIME_ZONE})
      and a.status = 'en_attente'
  )`;
  return db
    .update(careRequests)
    .set({
      republishedAt: now,
      republishCount: sql`${careRequests.republishCount} + 1`,
      updatedAt: now,
    })
    .where(
      and(
        eq(careRequests.seriesId, seriesId),
        eq(careRequests.familyUserId, userId),
        eq(careRequests.seriesWhole, true),
        eq(careRequests.status, "ouverte"),
        nightAhead,
        not(booked),
        waiting,
      ),
    )
    .returning({ id: careRequests.id });
}

/**
 * `republishSeries`'s second statement: the answers that wait on the nights
 * the first statement marked at `now` become `non_retenue`. A withdrawn,
 * declined or booked answer is left as it is, and so is an answer on a night
 * that was not marked.
 */
export function republishSeriesDeclinesAnswers(userId: string, seriesId: string, now: Date) {
  return db
    .update(careRequestApplications)
    .set({ status: "non_retenue", updatedAt: now })
    .where(
      and(
        eq(careRequestApplications.status, "en_attente"),
        inArray(
          careRequestApplications.requestId,
          db
            .select({ id: careRequests.id })
            .from(careRequests)
            .where(
              and(
                eq(careRequests.seriesId, seriesId),
                eq(careRequests.familyUserId, userId),
                eq(careRequests.seriesWhole, true),
                eq(careRequests.status, "ouverte"),
                eq(careRequests.republishedAt, now),
              ),
            ),
        ),
      ),
    )
    .returning({ id: careRequestApplications.id });
}
