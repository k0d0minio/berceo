/*
 * The health endpoint `.icm/project.json` points at. It answers that the app
 * is serving requests, and nothing more: no database, no external service,
 * so a slow dependency never reads as the site being down.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
