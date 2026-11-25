import { redirect } from "next/navigation";

import { redirectToCheckout, redirectToNightPassCheckout } from "@/lib/abonnements/checkout";
import { SUBSCRIPTION_PATH, SUBSCRIPTION_START_PATH } from "@/lib/abonnements/paths";
import { NIGHT_PASS_CHOICE, signupChoiceOf } from "@/lib/abonnements/rules";
import { requireAccess } from "@/lib/auth/guard";

/*
 * Where the e-mail confirmation sends a family who picked a plan at sign-up
 * (abonnements-inscription-famille): the Checkout of that plan, or of the
 * one-night plan (JAM-581), read from her row, never from the URL. A family
 * with no plan sees the plans; a running or pending subscription, or an open
 * pass, is refused as « Choisir » refuses it.
 */

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const user = await requireAccess(SUBSCRIPTION_START_PATH);
  const choice = signupChoiceOf(user);
  if (!choice) redirect(SUBSCRIPTION_PATH);
  if (choice === NIGHT_PASS_CHOICE) return redirectToNightPassCheckout(user);
  return redirectToCheckout(user, choice);
}
