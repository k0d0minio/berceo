import { redirect } from "next/navigation";

import { requireAccess } from "@/lib/auth/guard";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { PAYMENT_ABANDON_PATH, PAYMENT_RETURN_PATH } from "@/lib/paiements/paths";
import { abandonCheckout, type AbandonResult } from "@/lib/paiements/payments";

/*
 * « Retour » on Stripe's page (`cancel_url`, D-92): her open Checkout is
 * closed at once and she is back on her request, still open, with its answers
 * still waiting. One that turned out paid meanwhile goes to the return page.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const user = await requireAccess(PAYMENT_ABANDON_PATH);
  const paymentId = new URL(request.url).searchParams.get("paiement") ?? "";

  let result: AbandonResult;
  try {
    result = await abandonCheckout(paymentId, user.id);
  } catch (error) {
    console.error("[paiements] checkout not closed", {
      paymentId,
      error: error instanceof Error ? error.name : typeof error,
    });
    // Stripe closes it on its own after 30 minutes; the rules read it as expired then.
    result = { kind: "inconnue" };
  }

  if (result.kind === "dejaPaye") {
    redirect(`${PAYMENT_RETURN_PATH}?session_id=${encodeURIComponent(result.sessionId)}`);
  }
  if (result.kind === "abandonnee" && result.requestId) {
    redirect(`${familyRequestPath(result.requestId)}?paiement=abandonne`);
  }
  redirect(FAMILY_REQUESTS_PATH);
}
