import { timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { sendRequestDigest } from "@/lib/demandes/notify";

/*
 * The daily digest of new normal requests (D-51, D-52). Called by
 * .github/workflows/demandes-digest.yml at 16:00 and 17:00 UTC on UAT and on
 * production (Vercel Cron never runs on the `uat` environment); it sends only
 * from 18:00 in Brussels, and each request goes in one digest at most, so the
 * second call of the day sends nothing more. Refused without `CRON_SECRET` as a
 * bearer token (one value shared by UAT and production, D-58), and when no
 * secret is set at all.
 */
export const dynamic = "force-dynamic";

function authorised(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!authorised(request.headers.get("authorization"))) {
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
