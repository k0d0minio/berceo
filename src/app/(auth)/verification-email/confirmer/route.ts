import { NextResponse, type NextRequest } from "next/server";

import type { User } from "@/db";
import { SUBSCRIPTION_START_PATH } from "@/lib/abonnements/paths";
import { signupChoiceOf } from "@/lib/abonnements/rules";
import { RETURN_COOKIE, verifiedLanding } from "@/lib/auth/retour";
import { SIGN_IN_PATH } from "@/lib/auth/routing";
import { DEVICE_COOKIE, DEVICE_COOKIE_OPTIONS, needsSecondFactor } from "@/lib/auth/second-factor";
import { trustDevice } from "@/lib/auth/second-factor-store";
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
 *   was reading before she signed up (D-129). A family who picked a plan goes
 *   to its Checkout first, and the way back waits for her return from Stripe
 *   (abonnements-inscription-famille). A family's welcome e-mail goes
 *   out after the redirect (D-166); her home retries it if it failed (D-165).
 * - First click, but the `users` read fails: Neon has already consumed the
 *   token, so the session cookies still go out and the user lands on sign-in,
 *   which sends a signed-in visitor on to her space once the database answers.
 * - Second click (already verified, no new session): sign-in, told it is done.
 *
 * Neon Auth's `verify-email` answers `{ status: true, user: null }` on every
 * success (Better Auth). The session cookie is the only sign of a first click,
 * so the identity comes from `get-session` with that cookie, through the same
 * proxy (triage/verification-email-connexion).
 * - Expired or forged token: sign-in, told the link is no longer valid.
 *
 * The link proves the mailbox as a code does (comptes-2fa): a new
 * professional's device is trusted for 30 days on her first click, so her
 * space opens with no code. A failure here costs her one code, no more.
 */

export const dynamic = "force-dynamic";

function to(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

/** The `name=value` of the session cookie Neon Auth set, or null on a second click. */
function sessionCookie(cookies: string[]): string | null {
  for (const cookie of cookies) {
    const pair = cookie.split(";", 1)[0].trim();
    const name = pair.slice(0, pair.indexOf("="));
    if (name.includes("session_token")) return pair;
  }
  return null;
}

/** The Neon Auth identity of a new session, asked of `get-session` through the proxy. */
async function identityOf(request: NextRequest, session: string): Promise<string | undefined> {
  const upstream = new Request(new URL("/api/auth/get-session", request.url), {
    method: "GET",
    headers: { cookie: session },
  });
  const answer = await getAuth()
    .handler()
    .GET(upstream, { params: Promise.resolve({ path: ["get-session"] }) });
  if (!answer.ok) return undefined;
  const body = (await answer.json().catch(() => null)) as { user?: { id?: string } | null } | null;
  return body?.user?.id ?? undefined;
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

  const cookies = answer.headers.getSetCookie();
  const session = sessionCookie(cookies);
  if (!session) return to(request, `${SIGN_IN_PATH}?verifie=1`);

  let authUserId: string | undefined;
  try {
    authUserId = await identityOf(request, session);
  } catch (error) {
    console.error("[comptes] get-session failed after verification", {
      error: error instanceof Error ? error.name : typeof error,
    });
  }
  if (!authUserId) {
    // Neon has consumed the token: hand over its session, and let sign-in send her on.
    const response = to(request, `${SIGN_IN_PATH}?verifie=1`);
    for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
    return response;
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
    // A family with a plan, or the one-night plan (JAM-581), pays first; one who came from a full profile goes back to it (D-129); anyone else, home.
    const landing = verifiedLanding(row.role, request.cookies.get(RETURN_COOKIE)?.value, signupChoiceOf(row));
    response = to(request, landing);
    // The way back outlives the Checkout: the subscription's return page reads and clears it.
    if (landing !== SUBSCRIPTION_START_PATH) response.cookies.delete(RETURN_COOKIE);
    if (needsSecondFactor(row.role)) {
      try {
        const { token } = await trustDevice(row.id);
        response.cookies.set(DEVICE_COOKIE, token, DEVICE_COOKIE_OPTIONS);
      } catch (error) {
        console.error("[comptes] device not trusted after verification", { userId: row.id, error });
      }
    }
  }

  for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
  return response;
}
