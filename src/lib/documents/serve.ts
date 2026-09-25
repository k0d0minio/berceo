import type { DocumentKind, ProfileStatus } from "@/db/schema";
import { canReadFile } from "@/lib/professionnelle/rules";

/**
 * `/api/fichiers/[id]`: a professional's document or photo, streamed to its
 * owner or to an admin, her photo also to a signed-in family once her profile
 * is validated (D-75), and a 404 to anyone else, signed in or not, so the
 * route never confirms that a file exists. The logic lives here, with its
 * collaborators passed in, so the tests hold it to the spec without a
 * database or a bucket; the route file wires the real ones.
 */

export type Viewer = { id: string; role: "parent" | "professionnel" | "admin" } | null;

export type StoredFile = {
  ownerUserId: string;
  kind: DocumentKind;
  /** The owner's profile status: a family reads only a validated one's photo. */
  profileStatus: ProfileStatus;
  storageKey: string;
  contentType: string;
  fileName: string;
};

export type ServeDeps = {
  viewer: () => Promise<Viewer>;
  findFile: (id: string) => Promise<StoredFile | null>;
  read: (key: string) => Promise<ReadableStream<Uint8Array> | null>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store" },
  });
}

/** A file name safe for a Content-Disposition header, accents kept in `filename*`. */
function disposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  // RFC 5987: encodeURIComponent leaves ' ( ) * as they are, which `filename*` may not carry.
  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function serveFile(id: string, deps: ServeDeps): Promise<Response> {
  if (!UUID.test(id)) return notFound();

  const viewer = await deps.viewer();
  if (!viewer) return notFound();

  const file = await deps.findFile(id);
  if (!file || !canReadFile(file.ownerUserId, viewer, file)) return notFound();

  const body = await deps.read(file.storageKey);
  if (!body) return notFound();

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": file.contentType,
      "content-disposition": disposition(file.fileName),
      // Private to this session: never stored by a shared cache.
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
