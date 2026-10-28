import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { SUBSCRIPTION_PATH, SUBSCRIPTION_PORTAL_RETURN_PATH } from "@/lib/abonnements/paths";
import { syncLiveSubscription } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";

/*
 * Where Stripe's customer portal sends the family back
 * (abonnements-espace-echec-paiement). Her live row is synced from Stripe
 * here, so a plan change, a cancellation or a paid renewal shows at once,
 * even on a preview, which the webhook never reaches. Then « Votre
 * abonnement ». A sync that fails leaves the row to the webhook.
 */

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const user = await requireAccess(SUBSCRIPTION_PORTAL_RETURN_PATH);
  try {
    await syncLiveSubscription(user.id, new Date());
  } catch (error) {
    console.error("[abonnements] portal return could not sync", {
      userId: user.id,
      error: error instanceof Error ? error.name : typeof error,
    });
  }
  revalidatePath(SPACES.parent, "layout");
  redirect(SUBSCRIPTION_PATH);
}
