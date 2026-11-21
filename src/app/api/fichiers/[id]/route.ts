import { eq } from "drizzle-orm";

import { db, professionalDocuments, professionalProfiles } from "@/db";
import { currentUser } from "@/lib/auth/current-user";
import { serveFile } from "@/lib/documents/serve";
import { readObject } from "@/lib/documents/storage";
import { DEMO_KEY_PREFIX, demoFileStream } from "@/lib/demo/files";
import { demoSessionActive } from "@/lib/demo/session";

/*
 * A professional's document or photo, streamed from the private bucket to its
 * owner or an admin, her photo also to a family once she is validated; 404 to
 * anyone else. The rule and its tests are in
 * src/lib/documents/serve.ts; this file wires the session, the database and
 * the bucket. In the local demo (JAM-462) a `demo/` key is made in
 * `src/lib/demo/files.ts` and never read from a bucket; elsewhere it is not one.
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
          kind: professionalDocuments.kind,
          profileStatus: professionalProfiles.status,
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
    read: async (key) => {
      if (key.startsWith(DEMO_KEY_PREFIX)) return (await demoSessionActive()) ? demoFileStream(key) : null;
      return readObject(key);
    },
  });
}
