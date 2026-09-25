import { timingSafeEqual } from "node:crypto";

import { purgeCutoff } from "./rules";

/**
 * The purge of a refused file (D-41, D-55): thirty days after the refusal,
 * every file of the profile (documents and photo) leaves the bucket and
 * `professional_documents`; the profile, the declarations and the journal
 * stay. The steps are injected, so the tests hold the selection and the
 * idempotence without a database or a bucket; the route wires the real ones.
 */

export type DueProfile = {
  profileId: string;
  userId: string;
  name: string;
  files: { id: string; storageKey: string }[];
};

export type PurgeDeps = {
  now: () => Date;
  /** Refused profiles whose refusal is older than `cutoff` and that still hold files. */
  due: (cutoff: Date) => Promise<DueProfile[]>;
  deleteObject: (key: string) => Promise<void>;
  /** The profile's file rows and one "Documents supprimés" journal entry, in one transaction. */
  forget: (profile: DueProfile, at: Date) => Promise<void>;
};

export type PurgeReport = { profiles: number; files: number; failed: number };

export async function purgeRefusedFiles(deps: PurgeDeps): Promise<PurgeReport> {
  const now = deps.now();
  const report: PurgeReport = { profiles: 0, files: 0, failed: 0 };

  for (const profile of await deps.due(purgeCutoff(now))) {
    if (profile.files.length === 0) continue;
    try {
      // Objects first: a row is forgotten only once its object is gone, so a
      // failure leaves the profile due and the next run tries again (deleting
      // an object that is already gone is not an error).
      for (const file of profile.files) await deps.deleteObject(file.storageKey);
      await deps.forget(profile, now);
      report.profiles += 1;
      report.files += profile.files.length;
    } catch (error) {
      console.error("[purge] refused file not purged", { profileId: profile.profileId, error });
      report.failed += 1;
    }
  }
  return report;
}

/**
 * Only Vercel's cron call, which carries `Authorization: Bearer <CRON_SECRET>`.
 * No secret configured means no call is accepted.
 */
export function isCronRequest(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !authorization) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(authorization);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
