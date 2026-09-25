import { timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { sendInvitations } from "@/lib/avis/notify";

/*
 * The invitation to rate a terminée garde (avis-etoiles, D-120). Called every
 * hour by .github/workflows/avis-invitations.yml on UAT and on production
 * (Vercel Cron never runs on the `uat` environment); each side of each garde
 * is claimed once, so a second call sends nothing more.
 * Refused without `CRON_SECRET` as a bearer token (the digest's secret, D-68),
 * and when no secret is set at all.
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
    const outcome = await sendInvitations(new Date(), request.nextUrl.origin);
    return Response.json(outcome, { headers });
  } catch (error) {
    console.error("[avis] invitations failed", {
      error: error instanceof Error ? error.name : typeof error,
    });
    return Response.json({ error: "invitations failed" }, { status: 500, headers });
  }
}
