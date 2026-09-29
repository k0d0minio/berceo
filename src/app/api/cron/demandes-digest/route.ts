import type { NextRequest } from "next/server";

import { isCronRequest } from "@/lib/cron";
import { sendRequestDigest } from "@/lib/demandes/notify";

/*
 * The daily digest of new normal requests (D-61, D-62). Called by
 * .github/workflows/demandes-digest.yml at 16:00 and 17:00 UTC on UAT and on
 * production (Vercel Cron never runs on the `uat` environment); it sends only
 * from 18:00 in Brussels and once a day at most, so the second call of the day
 * sends nothing more. Refused without `CRON_SECRET` as a
 * bearer token (one value shared by UAT and production, D-68), and when no
 * secret of at least 16 characters is set (`src/lib/cron.ts`, D-153).
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!isCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "unauthorised" }, { status: 401, headers });
  }

  try {
    const outcome = await sendRequestDigest(new Date(), request.nextUrl.origin);
    return Response.json(outcome, { headers });
  } catch (error) {
    console.error("[demandes] digest failed", {
      error: error instanceof Error ? error.name : typeof error,
    });
    return Response.json({ error: "digest failed" }, { status: 500, headers });
  }
}
