import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { SUBSCRIPTION_PATH, SUBSCRIPTION_RETURN_PATH } from "@/lib/abonnements/paths";
import {
  confirmNightPassCheckout,
  confirmSubscriptionCheckout,
  nightPassOwner,
  subscriptionOwner,
  type ConfirmResult,
} from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { paidLanding, RETURN_COOKIE } from "@/lib/auth/retour";
import { SPACES } from "@/lib/auth/routing";

/*
 * Where Stripe sends the family once she paid her subscription, or her
 * one-night plan (JAM-304) (`success_url`). The session is read from Stripe, never trusted from the
 * URL, and the row synced here if the webhook has not done it yet (previews
 * never get the webhook). Only her own Checkout: another family's session,
 * like an unknown one, is not found.
 *
 * A family who signed up from a full profile kept her way back through the
 * Checkout (D-129, abonnements-inscription-famille): paid, she goes there.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  // The way back keeps the session, so a family asked to sign in again still lands here with it.
  const user = await requireAccess(`${SUBSCRIPTION_RETURN_PATH}?session_id=${encodeURIComponent(sessionId)}`);
  const subscriptionRow = await subscriptionOwner(sessionId);
  const passRow = subscriptionRow ? null : await nightPassOwner(sessionId);
  const owner = subscriptionRow ?? passRow;
  if (!owner || owner.userId !== user.id) notFound();
  const pass = passRow !== null;

  let result: ConfirmResult;
  try {
    result = pass
      ? await confirmNightPassCheckout(sessionId, new Date())
      : await confirmSubscriptionCheckout(sessionId, new Date());
  } catch (error) {
    // Stripe holds the payment: the webhook's retry or « Actualiser la page » syncs it.
    console.error("[abonnements] return page could not sync", {
      userId: user.id,
      error: error instanceof Error ? error.name : typeof error,
    });
    result = { kind: "enCours" };
  }

  revalidatePath(SPACES.parent, "layout");
  if (result.kind === "active") {
    const jar = await cookies();
    const back = paidLanding(jar.get(RETURN_COOKIE)?.value);
    if (back) {
      jar.delete(RETURN_COOKIE);
      redirect(back);
    }
  }
  const notice =
    result.kind === "inconnue"
      ? "erreur"
      : result.kind === "nonPayee"
        ? "abandonne"
        : pass && result.kind === "active"
          ? "nuitActive"
          : result.kind;
  const again = result.kind === "enCours" ? `&session_id=${encodeURIComponent(sessionId)}` : "";
  redirect(`${SUBSCRIPTION_PATH}?retour=${notice}${again}`);
}
