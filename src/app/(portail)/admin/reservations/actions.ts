"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { fullName } from "@/lib/admin/journal";
import { ADMIN_BOOKINGS_PATH, ADMIN_REPORTS_PATH, ADMIN_USERS_PATH } from "@/lib/admin/paths";
import { checkReason, NOTE_MAX, UUID, type ReasonError } from "@/lib/admin/rules";
import { currentUser } from "@/lib/auth/current-user";
import { SPACES } from "@/lib/auth/routing";
import { ADMIN_CREDITS_PATH } from "@/lib/credits/paths";
import { cancelGardeForBerceo, logError } from "@/lib/gardes/gardes";
import { notifyCancellation } from "@/lib/gardes/notify";
import { siteOrigin } from "@/lib/site-origin";

export type BerceoCancelResult = { ok: true } | { ok: false; error: ReasonError | "refuse" | "generique" };

/*
 * « Annuler la garde » for Berceo (annulations-back-office), from « Réservations »
 * and from an account's gardes. The role and the id are checked here at
 * runtime, whatever the page showed, and the note (required, 500 characters at
 * most). The statement holds the rest: a confirmed garde whose night has not
 * ended. Both sides' e-mails go after the response, so a failed send never
 * undoes the cancellation.
 */
export async function cancelForBerceoAction(bookingId: string, note: string): Promise<BerceoCancelResult> {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] cancellation refused: not an admin", { status: who.status });
    return { ok: false, error: "generique" };
  }
  if (typeof bookingId !== "string" || !UUID.test(bookingId)) return { ok: false, error: "generique" };
  const checked = checkReason(note, NOTE_MAX);
  if (!checked.ok) return { ok: false, error: checked.error };

  let result: Awaited<ReturnType<typeof cancelGardeForBerceo>>;
  try {
    result = await cancelGardeForBerceo(bookingId, { id: who.user.id, name: fullName(who.user) }, checked.value, new Date());
  } catch (error) {
    logError("garde not cancelled for Berceo", { bookingId }, error);
    return { ok: false, error: "generique" };
  }
  if (!result.ok) return { ok: false, error: "refuse" };

  const origin = await siteOrigin();
  after(() => notifyCancellation(bookingId, origin));
  revalidatePath(SPACES.admin);
  revalidatePath(ADMIN_BOOKINGS_PATH);
  revalidatePath(ADMIN_REPORTS_PATH);
  revalidatePath(ADMIN_CREDITS_PATH);
  revalidatePath(ADMIN_USERS_PATH, "layout");
  revalidatePath(SPACES.parent, "layout");
  revalidatePath(SPACES.professionnel, "layout");
  return { ok: true };
}
