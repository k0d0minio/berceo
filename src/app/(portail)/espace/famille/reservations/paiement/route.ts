import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { paymentDestination } from "@/lib/paiements/destination";
import { PAYMENT_RETURN_PATH } from "@/lib/paiements/paths";
import { confirmPayment, paymentOwner, type ConfirmResult } from "@/lib/paiements/payments";
import { siteOrigin } from "@/lib/site-origin";

/*
 * Where Stripe sends the family once she paid (`success_url`, D-102). The
 * session is read from Stripe, never trusted from the URL, and booked here if
 * the webhook has not done it yet (previews never get the webhook). Only her
 * own payment: another family's session, like an unknown one, is not found.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  // The way back keeps the session, so a family asked to sign in again still lands here with it.
  const user = await requireAccess(`${PAYMENT_RETURN_PATH}?session_id=${encodeURIComponent(sessionId)}`);
  const owner = await paymentOwner(sessionId);
  if (!owner || owner.familyUserId !== user.id) notFound();

  let result: ConfirmResult;
  try {
    result = await confirmPayment(sessionId, await siteOrigin(), new Date());
  } catch (error) {
    // The payment stays paid and unbooked: the webhook's retry or « Actualiser » settles it.
    console.error("[paiements] return page could not settle", {
      requestId: owner.requestId,
      error: error instanceof Error ? error.name : typeof error,
    });
    result = { kind: "enCours", requestId: owner.requestId };
  }

  revalidatePath(SPACES.parent, "layout");
  redirect(paymentDestination(result, sessionId));
}
