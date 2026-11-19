"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { fullName } from "@/lib/admin/journal";
import { grantFeeCredit, markReportHandled } from "@/lib/admin/lists";
import { ADMIN_REPORTS_PATH } from "@/lib/admin/paths";
import { checkReason, NOTE_MAX, UUID, type ReasonError } from "@/lib/admin/rules";
import { currentUser } from "@/lib/auth/current-user";
import { SPACES } from "@/lib/auth/routing";
import { notifyCreditGranted } from "@/lib/credits/notify";
import { ADMIN_CREDITS_PATH } from "@/lib/credits/paths";
import { siteOrigin } from "@/lib/site-origin";

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

export type GrantResult = { ok: true } | { ok: false; error: ReasonError | "refuse" | "generique" };

/*
 * « Accorder un crédit » on a report (annulations-back-office): the role and
 * the id are checked here at runtime, and the note (required, 500 characters
 * at most). The statement holds the rest: a litige or a fee the family's own
 * cancellation or absence left at Berceo, paid, with no live credit. The
 * family's e-mail goes after the response, so a failed send never undoes the
 * credit.
 */
export async function grantCreditAction(bookingId: string, note: string): Promise<GrantResult> {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] report action refused: not an admin", { status: who.status });
    return { ok: false, error: "generique" };
  }
  if (typeof bookingId !== "string" || !UUID.test(bookingId)) return { ok: false, error: "generique" };
  const checked = checkReason(note, NOTE_MAX);
  if (!checked.ok) return { ok: false, error: checked.error };

  let ok: boolean;
  try {
    ok = await grantFeeCredit(bookingId, { id: who.user.id, name: fullName(who.user) }, checked.value, new Date());
  } catch (error) {
    console.error("[admin] credit not granted", { bookingId, error: error instanceof Error ? error.name : typeof error });
    return { ok: false, error: "generique" };
  }
  if (!ok) return { ok: false, error: "refuse" };

  const origin = await siteOrigin();
  after(() => notifyCreditGranted(bookingId, origin));
  revalidatePath(SPACES.admin);
  revalidatePath(ADMIN_REPORTS_PATH);
  revalidatePath(ADMIN_CREDITS_PATH);
  return { ok: true };
}
