import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db, users } from "@/db";
import { homeFor, SIGN_IN_PATH } from "@/lib/auth/routing";
import { getAuth } from "@/lib/auth/server";
import { sendWelcomeIfDue } from "@/lib/auth/welcome";

/*
 * Where the verification e-mail's link lands (D-30). The token goes to Neon
 * Auth through our own /api/auth proxy, so the session cookie it answers with
 * is set on this origin and the user arrives signed in. The SDK's
 * `verifyEmail()` cannot be used: it POSTs, and Neon's endpoint is GET-only.
 *
 * - First click: verified and signed in → welcome e-mail for a family → space.
 * - Second click (already verified, no new session): sign-in, told it is done.
 * - Expired or forged token: sign-in, told the link is no longer valid.
 */

export const dynamic = "force-dynamic";

function to(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return to(request, `${SIGN_IN_PATH}?lien=invalide`);

  const upstream = new Request(
    new URL(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, request.url),
    { method: "GET", headers: request.headers },
  );
  const answer = await getAuth()
    .handler()
    .GET(upstream, { params: Promise.resolve({ path: ["verify-email"] }) });

  if (!answer.ok) return to(request, `${SIGN_IN_PATH}?lien=invalide`);

  const body = (await answer.json().catch(() => null)) as {
    user?: { id?: string } | null;
  } | null;
  const cookies = answer.headers.getSetCookie();
  const authUserId = body?.user?.id;

  if (!authUserId || !cookies.some((cookie) => cookie.includes("session_token"))) {
    return to(request, `${SIGN_IN_PATH}?verifie=1`);
  }

  const [row] = await db.select().from(users).where(eq(users.authUserId, authUserId)).limit(1);

  let response: NextResponse;
  if (!row) {
    console.error("[comptes] verified identity has no users row", { authUserId });
    response = to(request, `${SIGN_IN_PATH}?erreur=compte`);
  } else {
    await sendWelcomeIfDue(row, request.nextUrl.origin);
    response = to(request, homeFor(row.role));
  }

  for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
  return response;
}
