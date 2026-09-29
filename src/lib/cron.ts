import "server-only";

import { timingSafeEqual } from "node:crypto";

/**
 * The one bearer check of every route under `src/app/api/cron/` (D-153): the
 * digest, the reminder and the invitations, called by GitHub Actions, and the
 * purge, called by Vercel's cron. Each call carries
 * `Authorization: Bearer <CRON_SECRET>`, one value shared by UAT and
 * production (D-68). No secret configured, or one under 16 characters, means
 * no call is accepted. Each route answers a refusal its own way.
 */
export function isCronRequest(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !authorization) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(authorization);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
