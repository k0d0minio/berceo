import "server-only";

import { sql } from "drizzle-orm";

import { db, type DocumentKind } from "@/db";
import { FILES_PER_DOCUMENT_MAX, recordOutcome, type RecordOutcome } from "@/lib/professionnelle/rules";

/**
 * Records an uploaded file under her profile's lock (onboarding-upload-limit-race).
 * One batch, one transaction: the profile row is locked first, so a second
 * confirm waits for the first to commit; the guarded insert then reads the
 * count and the key afresh. The lock is what holds the limit: a guarded insert
 * alone lets two confirms both read two files under READ COMMITTED. The photo
 * takes the lock but keeps no count.
 */
export async function recordUpload(
  profileId: string,
  file: { kind: DocumentKind; key: string; fileName: string; contentType: string; size: number },
): Promise<RecordOutcome> {
  const { kind, key, fileName, contentType, size } = file;
  try {
    const [, inserted, recorded] = await db.batch([
      db.execute(sql`select id from professional_profiles where id = ${profileId}::uuid for update`),
      db.execute<{ id: string }>(sql`
        insert into professional_documents (profile_id, kind, storage_key, file_name, content_type, size_bytes)
        select ${profileId}::uuid, ${kind}::document_kind, ${key}::text,
               ${fileName}::text, ${contentType}::text, ${size}::integer
        where not exists (select 1 from professional_documents where storage_key = ${key}::text)
          and (${kind === "photo"}::boolean
               or (select count(*) from professional_documents
                   where profile_id = ${profileId}::uuid and kind = ${kind}::document_kind)
                  < ${FILES_PER_DOCUMENT_MAX}::integer)
        returning id
      `),
      db.execute<{ recorded: boolean }>(
        sql`select exists (select 1 from professional_documents where storage_key = ${key}::text) as recorded`,
      ),
    ]);
    return recordOutcome({
      inserted: inserted.rows.length > 0,
      keyRecorded: recorded.rows[0]?.recorded === true,
    });
  } catch (error) {
    console.error("[onboarding] upload not recorded", { profileId, error });
    return "echec";
  }
}
