import { NextResponse, type NextRequest } from "next/server";

import { landingFor } from "@/lib/auth/routing";
import { demoAccount } from "@/lib/demo/session";
import { DEMO_COOKIE, demoEnvFrom, demoSignInDecision } from "@/lib/demo/switch";

/*
 * The demo sign-in (JAM-462): `/api/demo/connexion?compte=<name>&retour=<path>`
 * signs in the demo account `test+<name>@jamienisbet.com` with no password,
 * no code and no mailbox, then goes to `retour` when the role may open it,
 * else to the role's home. It exists only on a local development server with
 * the switch `BERCEO_LOCAL_DEMO=1` (`src/lib/demo/switch.ts`). Everywhere else,
 * and for any account outside the demo set, it answers 404.
 */

export const dynamic = "force-dynamic";

function notFound(): Response {
  return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const decision = demoSignInDecision({
    env: demoEnvFrom(process.env),
    host: request.headers.get("host"),
    compte: request.nextUrl.searchParams.get("compte"),
    retour: request.nextUrl.searchParams.get("retour"),
  });
  if (decision.kind === "refuse") return notFound();

  const user = await demoAccount(decision.email);
  if (!user || user.suspendedAt) return notFound();

  const response = NextResponse.redirect(new URL(landingFor(user.role, decision.retour), request.url));
  response.headers.set("cache-control", "no-store");
  response.cookies.set(DEMO_COOKIE, user.id, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  return response;
}
