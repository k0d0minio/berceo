import "server-only";

import { redirect } from "next/navigation";

import type { SubscriptionPlan, User } from "@/db";
import { siteOrigin } from "@/lib/site-origin";

import { SUBSCRIPTION_PATH } from "./paths";
import { startSubscription, type StartResult } from "./subscriptions";

/**
 * Opens the plan's Checkout and sends the family there, or back to « Votre
 * abonnement » with the notice of a refusal. « Choisir » a plan, the call on
 * her home and the Checkout after her e-mail confirmation all end here
 * (abonnements-inscription-famille). Never returns.
 */
export async function redirectToCheckout(user: User, plan: SubscriptionPlan): Promise<never> {
  let result: StartResult;
  try {
    result = await startSubscription({ user, plan, siteUrl: await siteOrigin(), now: new Date() });
  } catch (error) {
    console.error("[abonnements] checkout not opened", {
      userId: user.id,
      error: error instanceof Error ? error.name : typeof error,
    });
    redirect(`${SUBSCRIPTION_PATH}?retour=erreur`);
  }

  if (result.kind === "stripe") redirect(result.url);
  redirect(`${SUBSCRIPTION_PATH}?retour=${result.kind}`);
}
