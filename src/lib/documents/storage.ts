import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * The private bucket that holds a professional's documents and photo (Neon
 * Object Storage, S3-compatible, eu-central-1). One bucket per Neon project:
 * UAT and every preview share the non-production one, production has its own.
 *
 * The browser only ever gets a presigned PUT, valid five minutes and bound to
 * the declared type and size. Nothing it can read from comes out of here:
 * every file is streamed by `/api/fichiers/[id]` after an access check.
 *
 * `DOCUMENTS_S3_*` rather than the SDK's `AWS_*` names: Vercel reserves those.
 */

const UPLOAD_TTL_SECONDS = 5 * 60;

function setting(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set: document storage is unavailable (see .env.example).`);
  }
  return value;
}

let client: S3Client | null = null;

function s3(): S3Client {
  client ??= new S3Client({
    endpoint: setting("DOCUMENTS_S3_ENDPOINT"),
    region: setting("DOCUMENTS_S3_REGION"),
    credentials: {
      accessKeyId: setting("DOCUMENTS_S3_ACCESS_KEY_ID"),
      secretAccessKey: setting("DOCUMENTS_S3_SECRET_ACCESS_KEY"),
    },
    // Neon Object Storage answers path-style requests only.
    forcePathStyle: true,
  });
  return client;
}

function bucket(): string {
  return setting("DOCUMENTS_BUCKET");
}

/** A fresh, unguessable key under the owner's profile. */
export function newStorageKey(profileId: string): string {
  return `profils/${profileId}/${crypto.randomUUID()}`;
}

/** The URL the browser PUTs the file to, signed for this type and size only. */
export async function presignUpload(key: string, contentType: string, size: number): Promise<string> {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    }),
    { expiresIn: UPLOAD_TTL_SECONDS },
  );
}

/** The uploaded object's size and first bytes, or null when it is not there. */
export async function inspectUpload(
  key: string,
): Promise<{ size: number; head: Uint8Array } | null> {
  try {
    const meta = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    const first = await s3().send(
      new GetObjectCommand({ Bucket: bucket(), Key: key, Range: "bytes=0-15" }),
    );
    const head = first.Body ? await first.Body.transformToByteArray() : new Uint8Array();
    return { size: meta.ContentLength ?? 0, head };
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw error;
  }
}

/** Deletes an object; deleting one that is already gone is not an error. */
export async function deleteObject(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/** The object's bytes as a stream, for the file route to hand on. */
export async function readObject(key: string): Promise<ReadableStream<Uint8Array> | null> {
  try {
    const object = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    return object.Body ? object.Body.transformToWebStream() : null;
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw error;
  }
}
