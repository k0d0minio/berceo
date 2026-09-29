import { NextResponse, type NextRequest } from "next/server";

import type { User } from "@/db";
import { RETURN_COOKIE, verifiedLanding } from "@/lib/auth/retour";
import { SIGN_IN_PATH } from "@/lib/auth/routing";
import { getAuth } from "@/lib/auth/server";
import { userByAuthId } from "@/lib/auth/users";
import { scheduleWelcomeIfDue } from "@/lib/auth/welcome";

/*
 * Where the verification e-mail's link lands (D-30). The token goes to Neon
 * Auth through our own /api/auth proxy, so the session cookie it answers with
 * is set on this origin and the user arrives signed in. The SDK's
 * `verifyEmail()` cannot be used: it POSTs, and Neon's endpoint is GET-only.
 *
 * - First click: verified and signed in → space, or the full profile a family
 *   was reading before she signed up (D-129). A family's welcome e-mail goes
 *   out after the redirect (D-166); her home retries it if it failed (D-165).
 * - First click, but the `users` read fails: Neon has already consumed the
 *   token, so the session cookies still go out and the user lands on sign-in,
 *   which sends a signed-in visitor on to her space once the database answers.
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

  let row: User | null | undefined;
  try {
    row = await userByAuthId(authUserId);
  } catch (error) {
    console.error("[comptes] users read failed after verification", {
      authUserId,
      error: error instanceof Error ? error.name : typeof error,
    });
  }

  let response: NextResponse;
  if (row === undefined) {
    response = to(request, `${SIGN_IN_PATH}?verifie=1`);
  } else if (!row) {
    console.error("[comptes] verified identity has no users row", { authUserId });
    response = to(request, `${SIGN_IN_PATH}?erreur=compte`);
  } else {
    scheduleWelcomeIfDue(row, request.nextUrl.origin);
    // A family who came from a full profile goes back to it (D-129); anyone else, home.
    response = to(request, verifiedLanding(row.role, request.cookies.get(RETURN_COOKIE)?.value));
    response.cookies.delete(RETURN_COOKIE);
  }

  for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
  return response;
}
