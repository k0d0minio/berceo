import type { NextRequest } from "next/server";

import { isCronRequest } from "@/lib/cron";
import { isReminderTime } from "@/lib/gardes/rules";
import { sendReminders } from "@/lib/gardes/notify";

/*
 * The reminder of the day before (cycle-de-garde-et-annulation, D-108). Called
 * by .github/workflows/gardes-rappel.yml at 08:00, 08:30, 09:00 and 09:30 UTC
 * on UAT and on production (Vercel Cron never runs on the `uat` environment);
 * it sends only between 10:00 and 10:59 in Brussels, where two of the calls
 * land, summer or winter, and each garde is claimed once, so a second call
 * sends nothing more.
 * Refused without `CRON_SECRET` as a bearer token (the digest's secret, D-68),
 * and when no secret of at least 16 characters is set (`src/lib/cron.ts`, D-153).
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!isCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "unauthorised" }, { status: 401, headers });
  }

  const now = new Date();
  if (!isReminderTime(now)) return Response.json({ sent: false, reason: "hors-horaire" }, { headers });

  try {
    const outcome = await sendReminders(now, request.nextUrl.origin);
    return Response.json({ sent: true, ...outcome }, { headers });
  } catch (error) {
    console.error("[gardes] reminders failed", {
      error: error instanceof Error ? error.name : typeof error,
    });
    return Response.json({ error: "reminders failed" }, { status: 500, headers });
  }
}
