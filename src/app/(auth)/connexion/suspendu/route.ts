import { NextResponse, type NextRequest } from "next/server";

import { currentUser } from "@/lib/auth/current-user";
import { SIGN_IN_PATH } from "@/lib/auth/routing";
import { getAuth } from "@/lib/auth/server";

/*
 * Where a suspended account's open session lands (back-office-admin, D-134):
 * the guard sends it here from any space, the session ends, and the sign-in
 * page says the account is suspended. A page cannot clear the cookie; a route
 * can. Only a suspended session is ended here: anyone else reaching the
 * address (a stale link, a page that embeds it) goes to sign-in untouched.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const who = await currentUser();
  if (who.status !== "suspended") return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
  try {
    await getAuth().signOut();
  } catch (error) {
    console.error("[comptes] suspended session not ended", { error });
  }
  return NextResponse.redirect(new URL(`${SIGN_IN_PATH}?erreur=suspendu`, request.url));
}
