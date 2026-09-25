import { and, eq, inArray, isNotNull, lt, or } from "drizzle-orm";

import { db, professionalDocuments, professionalProfiles, users } from "@/db";
import { fullName, journalInsert } from "@/lib/admin/journal";
import { isCronRequest, purgeRefusedFiles, type DueProfile } from "@/lib/admin/purge";
import { deleteObject } from "@/lib/documents/storage";

/*
 * The daily purge of refused files (D-41, D-55), scheduled in vercel.json, and
 * of a deleted account's files the deletion left behind (back-office-admin).
 * Vercel's cron sends `Authorization: Bearer <CRON_SECRET>`; anything else gets
 * a 404, so the route never confirms it exists. Vercel runs cron jobs on the
 * production deployment only: on uat.berceo.be the route is called by hand
 * with the secret. The steps and their tests are in src/lib/admin/purge.ts.
 */

export const dynamic = "force-dynamic";

async function due(cutoff: Date): Promise<DueProfile[]> {
  const rows = await db
    .select({
      profileId: professionalProfiles.id,
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      deletedAt: users.deletedAt,
      fileId: professionalDocuments.id,
      storageKey: professionalDocuments.storageKey,
    })
    .from(professionalDocuments)
    .innerJoin(professionalProfiles, eq(professionalDocuments.profileId, professionalProfiles.id))
    .innerJoin(users, eq(professionalProfiles.userId, users.id))
    .where(
      or(
        and(eq(professionalProfiles.status, "refuse"), lt(professionalProfiles.reviewedAt, cutoff)),
        // A deleted account's files the deletion could not remove at once (back-office-admin, D-137).
        isNotNull(users.deletedAt),
      ),
    );

  const profiles = new Map<string, DueProfile>();
  for (const row of rows) {
    const profile: DueProfile = profiles.get(row.profileId) ?? {
      profileId: row.profileId,
      userId: row.userId,
      name: fullName(row),
      reason: row.deletedAt ? "suppression" : "refus",
      files: [],
    };
    profile.files.push({ id: row.fileId, storageKey: row.storageKey });
    profiles.set(row.profileId, profile);
  }
  return [...profiles.values()];
}

async function forget(profile: DueProfile, at: Date): Promise<void> {
  await db.batch([
    db.delete(professionalDocuments).where(
      and(
        eq(professionalDocuments.profileId, profile.profileId),
        inArray(
          professionalDocuments.id,
          profile.files.map((f) => f.id),
        ),
      ),
    ),
    journalInsert({
      action: "documents_supprimes",
      subject: { id: profile.userId, name: profile.name },
      admin: null,
      detail: profile.reason === "suppression" ? "suppression" : null,
      at,
    }),
  ]);
}

export async function GET(request: Request) {
  if (!isCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return new Response("Not Found", { status: 404, headers: { "cache-control": "no-store" } });
  }

  const report = await purgeRefusedFiles({ now: () => new Date(), due, deleteObject, forget });
  return Response.json(report, {
    status: report.failed > 0 ? 500 : 200,
    headers: { "cache-control": "no-store" },
  });
}
