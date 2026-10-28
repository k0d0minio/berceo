"use server";

import { notFound } from "next/navigation";

import { redirectToCheckout } from "@/lib/abonnements/checkout";
import { SUBSCRIPTION_PATH } from "@/lib/abonnements/paths";
import { isPlan } from "@/lib/abonnements/rules";
import { requireAccess } from "@/lib/auth/guard";

/*
 * « Choisir » a plan (abonnements-catalogue-stripe), and « Finaliser mon
 * abonnement » on the family's home (abonnements-inscription-famille). The
 * user is the session's, never the form's; the plan bound on the page is
 * checked again here (a bound argument can be rewritten by the caller).
 * Nothing is subscribed here: the payment subscribes when Stripe reports it,
 * through the webhook or the return page.
 */
export async function startSubscriptionAction(plan: string): Promise<void> {
  const user = await requireAccess(SUBSCRIPTION_PATH);
  const chosen = String(plan);
  if (!isPlan(chosen)) notFound();
  await redirectToCheckout(user, chosen);
}
