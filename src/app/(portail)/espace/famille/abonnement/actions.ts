"use server";

import { notFound, redirect } from "next/navigation";

import { SUBSCRIPTION_PATH } from "@/lib/abonnements/paths";
import { isPlan } from "@/lib/abonnements/rules";
import { startSubscription, type StartResult } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { siteOrigin } from "@/lib/site-origin";

/*
 * « Choisir » a plan (abonnements-catalogue-stripe). The user is the
 * session's, never the form's; the plan bound on the page is checked again
 * here (a bound argument can be rewritten by the caller). Nothing is
 * subscribed here: the payment subscribes when Stripe reports it, through the
 * webhook or the return page.
 */
export async function startSubscriptionAction(plan: string): Promise<void> {
  const user = await requireAccess(SUBSCRIPTION_PATH);
  const chosen = String(plan);
  if (!isPlan(chosen)) notFound();

  let result: StartResult;
  try {
    result = await startSubscription({ user, plan: chosen, siteUrl: await siteOrigin(), now: new Date() });
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
