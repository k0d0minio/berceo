import type { Metadata } from "next";
import Link from "next/link";

import { FormMessage } from "@/components/auth/field";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { abonnements } from "@/content/abonnements";
import { comptes } from "@/content/comptes";
import { fill, words } from "@/content/locale";
import { planWords, renewalDate } from "@/lib/abonnements/format";
import { SUBSCRIPTION_PATH, SUBSCRIPTION_RETURN_PATH } from "@/lib/abonnements/paths";
import { PLANS, subscriptionState } from "@/lib/abonnements/rules";
import { liveSubscription, unpaidInvoiceUrl } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES, withQuery } from "@/lib/auth/routing";
import { isSessionId } from "@/lib/paiements/rules";

import { openPortalAction, startSubscriptionAction } from "./actions";

const t = words(abonnements);

export const metadata: Metadata = {
  title: t.espace.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Notice = { retour?: string; session_id?: string };

const NOTICES = ["active", "enCours", "abandonne", "dejaAbonnee", "erreur", "portail"] as const;

function noticeKey(retour: string | undefined): (typeof NOTICES)[number] | null {
  return (NOTICES as readonly string[]).includes(retour ?? "") ? (retour as (typeof NOTICES)[number]) : null;
}

/*
 * « Votre abonnement » (abonnements-catalogue-stripe): a running
 * subscription shows its plan, its price, its renewal or end date and its
 * status, and « Gérer mon abonnement » opens Stripe's customer portal
 * (abonnements-espace-echec-paiement). A failed renewal adds the warning,
 * with Stripe's page for the unpaid invoice while it is open. A first payment
 * still pending says so; otherwise the four plans of the devis, each opening
 * Stripe's Checkout. The notices come back from Stripe or from a refusal;
 * « Actualiser la page » goes through the return page again with the session.
 */
export default async function AbonnementPage({ searchParams }: { searchParams: Promise<Notice> }) {
  const query = await searchParams;
  const user = await requireAccess(withQuery(SUBSCRIPTION_PATH, query));
  const live = await liveSubscription(user.id);
  const notice = noticeKey(query.retour);
  const running = live && (live.status === "active" || live.status === "impayee") ? live : null;
  const pending = live?.status === "en_attente" && live.stripeSubscriptionId !== null;
  const state = running ? subscriptionState(running, new Date()) : null;
  const unpaid = state === "grace" || state === "suspendue";
  const invoiceUrl = unpaid && running?.stripeSubscriptionId ? await unpaidInvoiceUrl(running.stripeSubscriptionId) : null;

  return (
    <SpaceShell user={user} title={t.espace.titre}>
      {notice ? (
        <FormMessage>
          {t.retour[notice]}
          {notice === "enCours" && isSessionId(query.session_id) ? (
            <>
              {" "}
              <a
                href={`${SUBSCRIPTION_RETURN_PATH}?session_id=${encodeURIComponent(query.session_id)}`}
                className="font-semibold text-sauge underline underline-offset-4"
              >
                {t.retour.actualiser}
              </a>
            </>
          ) : null}
        </FormMessage>
      ) : null}

      {running && state ? (
        <>
          {unpaid ? (
            <section role="alert" className="flex max-w-2xl flex-col items-start gap-4 rounded-carte bg-beurre px-6 py-6 md:px-8">
              <p className="text-corps text-taupe">
                {state === "grace" && running.graceEndsAt
                  ? fill(t.espace.alerte.grace, { date: renewalDate(running.graceEndsAt) })
                  : t.espace.alerte.suspendue}
              </p>
              {invoiceUrl ? (
                <Button asChild>
                  <a href={invoiceUrl}>{t.espace.alerte.regler}</a>
                </Button>
              ) : null}
            </section>
          ) : null}
          <section className="flex max-w-2xl flex-col items-start gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
            <h2 className="text-h3 font-bold text-sauge">
              {fill(t.espace.formule, { plan: planWords(running.plan).name })}
            </h2>
            <p className="text-corps text-taupe">
              {fill(t.espace.prix, { prix: planWords(running.plan).prix, duree: planWords(running.plan).duree })}
            </p>
            {state === "resiliee" && running.cancelsAt ? (
              <p className="text-corps text-taupe">{fill(t.espace.finLe, { date: renewalDate(running.cancelsAt) })}</p>
            ) : running.currentPeriodEnd ? (
              <p className="text-corps text-taupe">
                {fill(t.espace.renouvellement, { date: renewalDate(running.currentPeriodEnd) })}
              </p>
            ) : null}
            <p className="text-corps font-semibold text-taupe">{t.espace.statut[state]}</p>
            <p className="text-corps text-taupe">{t.espace.gererAide}</p>
            <form action={openPortalAction}>
              <Button type="submit">{t.espace.gerer}</Button>
            </form>
            <p className="text-corps text-taupe">{t.espace.factures}</p>
          </section>
        </>
      ) : pending ? (
        <p className="max-w-2xl rounded-carte bg-perle px-6 py-6 text-corps text-taupe md:px-8">
          {t.espace.enAttente}
        </p>
      ) : (
        <>
          <p className="max-w-2xl text-intro text-taupe">{t.espace.intro}</p>
          <ul className="grid max-w-4xl gap-6 md:grid-cols-2">
            {PLANS.map((plan) => {
              const { name, duree, prix } = planWords(plan);
              return (
                <li key={plan}>
                  <article className="flex h-full flex-col gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
                    <h2 className="text-h3 font-bold text-sauge">{name}</h2>
                    <p className="text-corps text-taupe">{fill(t.espace.duree, { duree })}</p>
                    <p className="text-corps font-semibold text-taupe">{prix}</p>
                    <form action={startSubscriptionAction.bind(null, plan)} className="mt-auto">
                      <Button type="submit">{fill(t.espace.choisir, { plan: name })}</Button>
                    </form>
                  </article>
                </li>
              );
            })}
          </ul>
          <p className="max-w-2xl text-corps text-taupe">{t.espace.paiement}</p>
          <p className="max-w-2xl text-corps text-taupe">{t.espace.factures}</p>
        </>
      )}

      <Link href={SPACES.parent} className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4">
        {words(comptes).espaces.navAccueil}
      </Link>
    </SpaceShell>
  );
}
