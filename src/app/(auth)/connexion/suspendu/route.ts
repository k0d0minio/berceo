import { NextResponse, type NextRequest } from "next/server";

import { SIGN_IN_PATH } from "@/lib/auth/routing";
import { getAuth } from "@/lib/auth/server";

/*
 * Where a suspended account's open session lands (back-office-admin, D-134):
 * the guard sends it here from any space, the session ends, and the sign-in
 * page says the account is suspended. A page cannot clear the cookie; a route
 * can. Anyone reaching it signed in to a live account is only signed out.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await getAuth().signOut();
  } catch (error) {
    console.error("[comptes] suspended session not ended", { error });
  }
  return NextResponse.redirect(new URL(`${SIGN_IN_PATH}?erreur=suspendu`, request.url));
}
