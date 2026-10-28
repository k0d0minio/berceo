import { redirect } from "next/navigation";

import { redirectToCheckout } from "@/lib/abonnements/checkout";
import { SUBSCRIPTION_PATH, SUBSCRIPTION_START_PATH } from "@/lib/abonnements/paths";
import { requireAccess } from "@/lib/auth/guard";

/*
 * Where the e-mail confirmation sends a family who picked a plan at sign-up
 * (abonnements-inscription-famille): the Checkout of that plan, read from
 * her row, never from the URL. A family with no plan sees the four plans; a
 * running or pending subscription is refused as « Choisir » refuses it.
 */

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const user = await requireAccess(SUBSCRIPTION_START_PATH);
  if (!user.signupPlan) redirect(SUBSCRIPTION_PATH);
  return redirectToCheckout(user, user.signupPlan);
}
