import { permanentRedirect } from "next/navigation";

import { ADMIN_REPORTS_PATH } from "@/lib/admin/paths";
import { requireAccess } from "@/lib/auth/guard";
import { ADMIN_ABSENCES_PATH } from "@/lib/gardes/paths";

export const dynamic = "force-dynamic";

/*
 * « Absences signalées » became « Signalements », which lists every cancelled
 * garde and every reported absence (back-office-admin, D-132, D-139). Still a
 * 404 to anyone but an admin (D-33): the address never confirms it exists.
 */
export default async function AbsencesPage() {
  await requireAccess(ADMIN_ABSENCES_PATH);
  permanentRedirect(ADMIN_REPORTS_PATH);
}
