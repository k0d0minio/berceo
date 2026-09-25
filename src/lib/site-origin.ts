import "server-only";

import { headers } from "next/headers";

/**
 * This deployment's own address, so the e-mails sent from a UAT action point
 * at UAT. Read from the host the request reached (set by Vercel's proxy),
 * never from the client's `Origin`, whose scheme and path a caller chooses:
 * these links go to other people.
 */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") === "http" ? "http" : "https";
  return new URL(`${proto}://${host}`).origin;
}
