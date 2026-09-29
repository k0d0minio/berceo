import type { NextRequest } from "next/server";

import { sendInvitations } from "@/lib/avis/notify";
import { isCronRequest } from "@/lib/cron";

/*
 * The invitation to rate a terminée garde (avis-etoiles, D-120). Called every
 * hour by .github/workflows/avis-invitations.yml on UAT and on production
 * (Vercel Cron never runs on the `uat` environment); each side of each garde
 * is claimed once, so a second call sends nothing more.
 * Refused without `CRON_SECRET` as a bearer token (the digest's secret, D-68),
 * and when no secret of at least 16 characters is set (`src/lib/cron.ts`, D-153).
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!isCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)) {
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
