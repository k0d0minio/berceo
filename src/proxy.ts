import type { NextRequest } from "next/server";

import { SIGN_IN_PATH, signInWithReturn } from "@/lib/auth/routing";
import { getAuth } from "@/lib/auth/server";

/*
 * Next 16's proxy (formerly middleware) on the two spaces: Neon Auth's
 * middleware refreshes the session and sends a signed-out visitor to
 * /connexion; this wrapper adds the way back (`?retour=`), which the SDK
 * drops. Roles are checked in the pages (src/lib/auth/guard.ts), where the
 * `users` row is read. /admin is not matched: it answers 404 to anyone who is
 * not an admin, signed in or not, and never redirects.
 */

let protect: ((request: NextRequest) => Promise<Response>) | null = null;

export default async function proxy(request: NextRequest) {
  protect ??= getAuth().middleware({ loginUrl: SIGN_IN_PATH });
  const response = await protect(request);

  const location = response.headers.get("location");
  if (location && new URL(location, request.url).pathname === SIGN_IN_PATH) {
    const back = new URL(signInWithReturn(request.nextUrl.pathname), request.url);
    response.headers.set("location", back.toString());
  }
  return response;
}

export const config = {
  matcher: ["/espace/:path*"],
};
