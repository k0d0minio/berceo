"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";

import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { notifyUrgentRequest } from "@/lib/demandes/notify";
import { familyRequestPath } from "@/lib/demandes/paths";
import { UUID } from "@/lib/demandes/requests";
import { PROFILE_PATH } from "@/lib/famille/paths";
import {
  cancelGarde,
  logError,
  reportAbsence,
  republishGarde,
  type GardeWrite,
  type RepublishResult,
} from "@/lib/gardes/gardes";
import { notifyAbsence, notifyCancellation } from "@/lib/gardes/notify";
import { familyBookingPath } from "@/lib/reservations/paths";
import { siteOrigin } from "@/lib/site-origin";

/*
 * The family's actions on one of her gardes (cycle-de-garde-et-annulation).
 * The user is the session's, never the form's, and the side is always
 * `famille` here: the id bound on the page is a lookup key only, checked
 * again, and every write is scoped to her own garde in its SQL. The e-mails go
 * after the response (`after()`), so a failed send never undoes the write.
 */

function checkedId(id: string): string {
  const value = String(id);
  if (!UUID.test(value)) notFound();
  return value;
}

/** « Annuler la garde » until the start hour (D-105): the professional is told; the fee stays with Berceo (D-2). */
export async function cancelGardeAction(bookingId: string): Promise<void> {
  const id = checkedId(bookingId);
  const user = await requireAccess(familyBookingPath(id));

  let result: GardeWrite;
  try {
    result = await cancelGarde("famille", user.id, id, new Date());
  } catch (error) {
    logError("garde not cancelled", { userId: user.id, bookingId: id }, error);
    redirect(`${familyBookingPath(id)}?erreur=generique`);
  }
  if (!result.ok) redirect(`${familyBookingPath(id)}?erreur=annulation`);

  const origin = await siteOrigin();
  after(() => notifyCancellation(id, origin));
  revalidatePath(SPACES.parent, "layout");
  redirect(`${familyBookingPath(id)}?annulee=1`);
}

/** « Signaler une absence » of the professional, from the start hour (D-106): she is told; nothing is refunded. */
export async function reportAbsenceAction(bookingId: string): Promise<void> {
  const id = checkedId(bookingId);
  const user = await requireAccess(familyBookingPath(id));

  let result: GardeWrite;
  try {
    result = await reportAbsence("famille", user.id, id, new Date());
  } catch (error) {
    logError("absence not reported", { userId: user.id, bookingId: id }, error);
    redirect(`${familyBookingPath(id)}?erreur=generique`);
  }
  if (!result.ok) redirect(`${familyBookingPath(id)}?erreur=absence`);

  const origin = await siteOrigin();
  after(() => notifyAbsence(id, origin));
  revalidatePath(SPACES.parent, "layout");
  redirect(`${familyBookingPath(id)}?absence=1`);
}

/**
 * « Republier ma demande » on a cancelled garde (D-107): a new request for the
 * same night, carried by the urgent e-mail at once or by the next digest. An
 * open request of hers that night is where she lands instead.
 */
export async function republishGardeAction(bookingId: string): Promise<void> {
  const id = checkedId(bookingId);
  const user = await requireAccess(familyBookingPath(id));

  let result: RepublishResult;
  try {
    result = await republishGarde(user.id, id, new Date());
  } catch (error) {
    logError("garde not republished", { userId: user.id, bookingId: id }, error);
    redirect(`${familyBookingPath(id)}?erreur=generique`);
  }

  if (!result.ok) {
    if (result.reason === "commune") redirect(`${PROFILE_PATH}?completer=1`);
    if (result.reason === "doublon" && result.existing) redirect(familyRequestPath(result.existing));
    redirect(`${familyBookingPath(id)}?erreur=republication`);
  }

  if (result.urgent) {
    const origin = await siteOrigin();
    const requestId = result.id;
    after(() => notifyUrgentRequest(requestId, origin));
  }
  revalidatePath(SPACES.parent, "layout");
  redirect(`${familyRequestPath(result.id)}?publiee=${result.urgent ? "urgente" : "1"}`);
}
