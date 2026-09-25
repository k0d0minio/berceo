"use server";

import { revalidatePath } from "next/cache";

import { fullName } from "@/lib/admin/journal";
import { markReportHandled } from "@/lib/admin/lists";
import { ADMIN_REPORTS_PATH } from "@/lib/admin/paths";
import { UUID } from "@/lib/admin/rules";
import { currentUser } from "@/lib/auth/current-user";
import { SPACES } from "@/lib/auth/routing";

/*
 * « Marquer comme traité » on a report (back-office-admin, D-139). The role is
 * checked here at runtime, whatever the page showed (Learned rules), and the
 * id is checked; the statement marks only a cancelled garde nobody marked.
 */
export async function markHandledAction(bookingId: string): Promise<{ ok: boolean }> {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] report action refused: not an admin", { status: who.status });
    return { ok: false };
  }
  if (typeof bookingId !== "string" || !UUID.test(bookingId)) return { ok: false };

  let ok: boolean;
  try {
    ok = await markReportHandled(bookingId, { id: who.user.id, name: fullName(who.user) }, new Date());
  } catch (error) {
    console.error("[admin] report not marked handled", { bookingId, error });
    return { ok: false };
  }
  if (ok) {
    revalidatePath(SPACES.admin);
    revalidatePath(ADMIN_REPORTS_PATH);
  }
  return { ok };
}
