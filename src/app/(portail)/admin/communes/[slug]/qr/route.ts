import { notFound } from "next/navigation";

import { qrResponse } from "@/lib/admin/commune-qr";
import { renderQr } from "@/lib/admin/commune-qr-render";
import { ADMIN_COMMUNES_PATH } from "@/lib/admin/communes";
import { requireAccess } from "@/lib/auth/guard";
import { siteOrigin } from "@/lib/site-origin";

/*
 * The QR code of a commune's share link (JAM-361), as SVG or PNG, shown in
 * « Communes » or downloaded. The guard of the admin pages is first: a 404 to
 * anyone but an admin (D-33). Then a 404 for a slug that names no commune, for
 * a format that is not `svg` or `png`, and for each other parameter. The rules
 * and their tests are in src/lib/admin/commune-qr.ts; this file wires the
 * session, the address this deployment answers at, and the renderer.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  await requireAccess(ADMIN_COMMUNES_PATH);
  const { slug } = await params;
  const origin = await siteOrigin();
  const response = await qrResponse(slug, new URL(request.url).searchParams, origin, renderQr);
  return response ?? notFound();
}
