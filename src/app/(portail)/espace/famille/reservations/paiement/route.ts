import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { PAYMENT_RETURN_PATH } from "@/lib/paiements/paths";
import { confirmPayment, paymentOwner, type ConfirmResult } from "@/lib/paiements/payments";
import { familyBookingPath } from "@/lib/reservations/paths";
import { siteOrigin } from "@/lib/site-origin";

/*
 * Where Stripe sends the family once she paid (`success_url`, D-90). The
 * session is read from Stripe, never trusted from the URL, and booked here if
 * the webhook has not done it yet (previews never get the webhook). Only her
 * own payment: another family's session, like an unknown one, is not found.
 */

export const dynamic = "force-dynamic";

function destination(result: ConfirmResult): string {
  const request = (requestId: string | null, notice: string) =>
    requestId ? `${familyRequestPath(requestId)}?paiement=${notice}` : FAMILY_REQUESTS_PATH;
  switch (result.kind) {
    case "reservee":
      return `${familyBookingPath(result.bookingId)}?confirmee=1`;
    case "enCours":
      return request(result.requestId, "enCours");
    case "remboursee":
      return request(result.requestId, "rembourse");
    case "nonPayee":
      return request(result.requestId, "abandonne");
    case "inconnue":
      return FAMILY_REQUESTS_PATH;
  }
}

export async function GET(request: Request): Promise<Response> {
  const user = await requireAccess(PAYMENT_RETURN_PATH);
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  const owner = await paymentOwner(sessionId);
  if (!owner || owner.familyUserId !== user.id) notFound();

  let result: ConfirmResult;
  try {
    result = await confirmPayment(sessionId, await siteOrigin(), new Date());
  } catch {
    // Logged with ids by confirmPayment; the webhook's retry finishes the job.
    result = { kind: "enCours", requestId: owner.requestId };
  }

  revalidatePath(SPACES.parent, "layout");
  redirect(destination(result));
}
