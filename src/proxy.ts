import { NextResponse, type NextRequest } from "next/server";

import { SIGN_IN_PATH, signInWithReturn } from "@/lib/auth/routing";
import { getAuth } from "@/lib/auth/server";
import { DEMO_COOKIE, demoEnvFrom, demoSignInAllowed } from "@/lib/demo/switch";

/*
 * Next 16's proxy (formerly middleware) on the two spaces: Neon Auth's
 * middleware refreshes the session and sends a signed-out visitor to
 * /connexion; this wrapper adds the way back (`?retour=`), which the SDK
 * drops. Roles are checked in the pages (src/lib/auth/guard.ts), where the
 * `users` row is read. /admin is not matched: it answers 404 to anyone who is
 * not an admin, signed in or not, and never redirects.
 *
 * In the local demo (JAM-462, `src/lib/demo/`) Neon Auth is never asked: the
 * demo cookie stands for the session, and the pages read it.
 */

let protect: ((request: NextRequest) => Promise<Response>) | null = null;

export default async function proxy(request: NextRequest) {
  if (demoSignInAllowed(demoEnvFrom(process.env), request.headers.get("host"))) {
    if (request.cookies.has(DEMO_COOKIE)) return NextResponse.next();
    const back = signInWithReturn(request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(back, request.url));
  }

  protect ??= getAuth().middleware({ loginUrl: SIGN_IN_PATH });
  const response = await protect(request);

  const location = response.headers.get("location");
  if (location && new URL(location, request.url).pathname === SIGN_IN_PATH) {
    const back = new URL(signInWithReturn(request.nextUrl.pathname + request.nextUrl.search), request.url);
    response.headers.set("location", back.toString());
  }
  return response;
}

export const config = {
  matcher: ["/espace/:path*"],
};
