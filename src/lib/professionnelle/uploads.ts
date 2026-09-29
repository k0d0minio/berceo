import "server-only";

import { sql } from "drizzle-orm";

import { db, type DocumentKind } from "@/db";
import { FILES_PER_DOCUMENT_MAX, recordOutcome, replacesPhotos, type RecordOutcome } from "@/lib/professionnelle/rules";

/**
 * Records an uploaded file under her profile's lock (onboarding-upload-limit-race).
 * One batch, one transaction: the profile row is locked first, so a second
 * confirm waits for the first to commit; the guarded insert then reads the
 * count and the key afresh. The lock is what holds the limit: a guarded insert
 * alone lets two confirms both read two files under READ COMMITTED. The photo
 * takes the lock but keeps no count.
 *
 * Her photo is one file (onboarding-double-photo-race): a photo that was
 * inserted deletes every other photo row of the profile in the same statement,
 * read after the lock, so of two photos confirmed at once the last to commit
 * stays. `replaced` is the storage keys of the rows it deleted: their objects
 * are the caller's to delete once the batch has committed.
 */
export async function recordUpload(
  profileId: string,
  file: { kind: DocumentKind; key: string; fileName: string; contentType: string; size: number },
): Promise<{ outcome: RecordOutcome; replaced: string[] }> {
  const { kind, key, fileName, contentType, size } = file;
  try {
    const [, written, recorded] = await db.batch([
      db.execute(sql`select id from professional_profiles where id = ${profileId}::uuid for update`),
      db.execute<{ inserted: boolean; replaced: string[] }>(sql`
        with inserted as (
          insert into professional_documents (profile_id, kind, storage_key, file_name, content_type, size_bytes)
          select ${profileId}::uuid, ${kind}::document_kind, ${key}::text,
                 ${fileName}::text, ${contentType}::text, ${size}::integer
          where not exists (select 1 from professional_documents where storage_key = ${key}::text)
            and (${kind === "photo"}::boolean
                 or (select count(*) from professional_documents
                     where profile_id = ${profileId}::uuid and kind = ${kind}::document_kind)
                    < ${FILES_PER_DOCUMENT_MAX}::integer)
          returning id
        ), replaced as (
          delete from professional_documents
          where ${kind === "photo"}::boolean
            and exists (select 1 from inserted)
            and profile_id = ${profileId}::uuid and kind = 'photo' and storage_key <> ${key}::text
          returning storage_key
        )
        select exists (select 1 from inserted) as inserted,
               array(select storage_key from replaced) as replaced
      `),
      db.execute<{ recorded: boolean }>(
        sql`select exists (select 1 from professional_documents where storage_key = ${key}::text) as recorded`,
      ),
    ]);
    const row = written.rows[0];
    const outcome = recordOutcome({
      inserted: row?.inserted === true,
      keyRecorded: recorded.rows[0]?.recorded === true,
    });
    return { outcome, replaced: replacesPhotos(kind, outcome) ? (row?.replaced ?? []) : [] };
  } catch (error) {
    console.error("[onboarding] upload not recorded", { profileId, error });
    return { outcome: "echec", replaced: [] };
  }
}
