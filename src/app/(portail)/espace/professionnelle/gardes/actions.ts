"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";

import type { CancellationReason } from "@/db/schema";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { UUID } from "@/lib/demandes/requests";
import { cancelGarde, contestAbsence, logError, reportAbsence, type GardeWrite } from "@/lib/gardes/gardes";
import { notifyAbsence, notifyCancellation } from "@/lib/gardes/notify";
import { isReasonOf } from "@/lib/gardes/rules";
import { professionalBookingPath } from "@/lib/reservations/paths";
import { siteOrigin } from "@/lib/site-origin";

/*
 * The professional's actions on one of her gardes (cycle-de-garde-et-annulation).
 * The user is the session's, the side always `professionnelle`: the id bound on
 * the page is a lookup key only, and every write is scoped to her own garde in
 * its SQL. The e-mails go after the response, so a failed send never undoes the
 * write. The family's credit is written with the cancellation (annulations-table).
 */

function checkedId(id: string): string {
  const value = String(id);
  if (!UUID.test(value)) notFound();
  return value;
}

/** « Annuler la garde » until the start hour (D-105): the family is told, and her fee becomes a credit (annulations-table). */
export async function cancelGardeAction(bookingId: string, reason: CancellationReason): Promise<void> {
  const id = checkedId(bookingId);
  const user = await requireAccess(professionalBookingPath(id));
  // The dialog sends one of her side's reasons; anything else is refused like a stale page.
  if (!isReasonOf("professionnelle", reason)) redirect(`${professionalBookingPath(id)}?erreur=annulation`);

  let result: GardeWrite;
  try {
    result = await cancelGarde("professionnelle", user.id, id, reason, new Date());
  } catch (error) {
    logError("garde not cancelled", { userId: user.id, bookingId: id }, error);
    redirect(`${professionalBookingPath(id)}?erreur=generique`);
  }
  if (!result.ok) redirect(`${professionalBookingPath(id)}?erreur=annulation`);

  const origin = await siteOrigin();
  after(() => notifyCancellation(id, origin));
  revalidatePath(SPACES.professionnel, "layout");
  redirect(`${professionalBookingPath(id)}?annulee=1`);
}

/** « Signaler une absence » of the family, from the start hour (D-106): she is told; the fee stays with Berceo. */
export async function reportAbsenceAction(bookingId: string): Promise<void> {
  const id = checkedId(bookingId);
  const user = await requireAccess(professionalBookingPath(id));

  let result: GardeWrite;
  try {
    result = await reportAbsence("professionnelle", user.id, id, new Date());
  } catch (error) {
    logError("absence not reported", { userId: user.id, bookingId: id }, error);
    redirect(`${professionalBookingPath(id)}?erreur=generique`);
  }
  if (!result.ok) redirect(`${professionalBookingPath(id)}?erreur=absence`);

  const origin = await siteOrigin();
  after(() => notifyAbsence(id, origin));
  revalidatePath(SPACES.professionnel, "layout");
  redirect(`${professionalBookingPath(id)}?absence=1`);
}

/**
 * « Contester ce signalement » when the family reported her absent
 * (annulations-table), for 24 hours after the report: the garde enters
 * « litige », the family's credit is voided, and the founders read it on
 * « Signalements ». No e-mail.
 */
export async function contestAbsenceAction(bookingId: string): Promise<void> {
  const id = checkedId(bookingId);
  const user = await requireAccess(professionalBookingPath(id));

  let result: GardeWrite;
  try {
    result = await contestAbsence("professionnelle", user.id, id, new Date());
  } catch (error) {
    logError("absence not contested", { userId: user.id, bookingId: id }, error);
    redirect(`${professionalBookingPath(id)}?erreur=generique`);
  }
  if (!result.ok) redirect(`${professionalBookingPath(id)}?erreur=contestation`);

  revalidatePath(SPACES.professionnel, "layout");
  redirect(`${professionalBookingPath(id)}?contestation=1`);
}
