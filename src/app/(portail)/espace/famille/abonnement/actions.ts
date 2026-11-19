"use server";

import { notFound, redirect } from "next/navigation";

import { redirectToCheckout, redirectToNightPassCheckout } from "@/lib/abonnements/checkout";
import { SUBSCRIPTION_PATH } from "@/lib/abonnements/paths";
import { isPlan } from "@/lib/abonnements/rules";
import { openPortal } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { siteOrigin } from "@/lib/site-origin";

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

/*
 * « Choisir Une nuit » (JAM-304): the one-night plan's Checkout for the
 * session user. Nothing opens here: the payment does, when Stripe reports it.
 */
export async function startNightPassAction(): Promise<void> {
  const user = await requireAccess(SUBSCRIPTION_PATH);
  await redirectToNightPassCheckout(user);
}

/*
 * « Gérer mon abonnement » (abonnements-espace-echec-paiement): a session of
 * Stripe's customer portal for the session user's customer, never one the
 * form names. A refusal goes back to the page with its notice.
 */
export async function openPortalAction(): Promise<void> {
  const user = await requireAccess(SUBSCRIPTION_PATH);
  const url = await openPortal(user, await siteOrigin());
  redirect(url ?? `${SUBSCRIPTION_PATH}?retour=portail`);
}
