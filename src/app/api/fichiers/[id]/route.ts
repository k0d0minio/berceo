import { eq } from "drizzle-orm";

import { db, professionalDocuments, professionalProfiles } from "@/db";
import { currentUser } from "@/lib/auth/current-user";
import { serveFile } from "@/lib/documents/serve";
import { readObject } from "@/lib/documents/storage";

/*
 * A professional's document or photo, streamed from the private bucket to its
 * owner or an admin; 404 to anyone else. The rule and its tests are in
 * src/lib/documents/serve.ts; this file wires the session, the database and
 * the bucket.
 */

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return serveFile(id, {
    viewer: async () => {
      const who = await currentUser();
      return who.status === "ok" ? { id: who.user.id, role: who.user.role } : null;
    },
    findFile: async (fileId) => {
      const [row] = await db
        .select({
          ownerUserId: professionalProfiles.userId,
          storageKey: professionalDocuments.storageKey,
          contentType: professionalDocuments.contentType,
          fileName: professionalDocuments.fileName,
        })
        .from(professionalDocuments)
        .innerJoin(professionalProfiles, eq(professionalDocuments.profileId, professionalProfiles.id))
        .where(eq(professionalDocuments.id, fileId))
        .limit(1);
      return row ?? null;
    },
    read: readObject,
  });
}
