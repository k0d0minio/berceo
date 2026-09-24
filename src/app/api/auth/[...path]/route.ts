import { getAuth } from "@/lib/auth/server";

/*
 * Neon Auth's API, proxied on this origin so its cookies are ours. The pages
 * use server actions, not this route; it serves the verification confirmation
 * (src/app/(auth)/verification-email/confirmer) and any later client call.
 */
type Context = { params: Promise<{ path: string[] }> };

export function GET(request: Request, context: Context) {
  return getAuth().handler().GET(request, context);
}

export function POST(request: Request, context: Context) {
  return getAuth().handler().POST(request, context);
}
