import type { Metadata } from "next";
import Link from "next/link";

import { OwnNote } from "@/components/avis/stars";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { abonnements } from "@/content/abonnements";
import { common } from "@/content/common";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { famille } from "@/content/famille";
import { fill, words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import { planWords, renewalDate } from "@/lib/abonnements/format";
import { SUBSCRIPTION_PATH } from "@/lib/abonnements/paths";
import { planToFinish } from "@/lib/abonnements/rules";
import { hasCompletedCheckout, liveSubscription } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { scheduleWelcomeIfDue } from "@/lib/auth/welcome";
import { noteOfUser } from "@/lib/avis/ratings";
import { FAMILY_REQUESTS_PATH, NEW_REQUEST_PATH, NEW_URGENT_REQUEST_PATH } from "@/lib/demandes/paths";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { familyCommune } from "@/lib/famille/profile";
import { SEARCH_PATH } from "@/lib/recherche/slugs";
import { siteOrigin } from "@/lib/site-origin";

import { startSubscriptionAction } from "./abonnement/actions";

const t = words(comptes);
const f = words(famille).accueil;
const d = words(demandes);
const a = words(abonnements);
const c = words(common);

export const metadata: Metadata = {
  title: t.meta.espace,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The parent's space. Until her commune is saved it asks her to complete her
 * profile. The two ways to publish (D-60) and her requests are one tap away.
 * Her own note and gardes count close the page (avis-etoiles, D-121). « Votre
 * abonnement » shows her plan and its renewal date, or leads to the four plans
 * (abonnements-catalogue-stripe). A family who left the Checkout of the plan
 * she picked at sign-up gets one call to finish it instead
 * (abonnements-inscription-famille). An outlined button opens the charter the
 * professionals accept (charte-cote-parents). A welcome
 * e-mail that failed to send is tried again after the page (D-165).
 */
export default async function EspaceFamillePage() {
  const user = await requireAccess(SPACES.parent);
  scheduleWelcomeIfDue(user, await siteOrigin());
  const [commune, note, live, completed] = await Promise.all([
    familyCommune(user.id),
    noteOfUser(user.id),
    liveSubscription(user.id),
    hasCompletedCheckout(user.id),
  ]);
  const running = live && (live.status === "active" || live.status === "impayee") ? live : null;
  const toFinish = planToFinish(user.signupPlan, completed);

  return (
    <SpaceShell user={user}>
      {commune ? null : (
        <section className="flex max-w-2xl flex-col items-start gap-4 rounded-carte bg-perle px-6 py-6 md:px-8">
          <h2 className="font-display text-h3 text-encre-sauge">{f.completer.titre}</h2>
          <p className="text-corps text-encre-taupe">{f.completer.texte}</p>
          <Button asChild>
            <Link href={PROFILE_PATH}>{f.completer.lien}</Link>
          </Button>
        </section>
      )}
      <section className="flex max-w-2xl flex-col items-start gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
        <h2 className="font-display text-h3 text-encre-sauge">{a.accueil.titre}</h2>
        {running ? (
          <>
            <p className="text-corps text-encre-taupe">{fill(a.espace.formule, { plan: planWords(running.plan).name })}</p>
            {running.currentPeriodEnd ? (
              <p className="text-corps text-encre-taupe">
                {fill(a.espace.renouvellement, { date: renewalDate(running.currentPeriodEnd) })}
              </p>
            ) : null}
            <Link
              href={SUBSCRIPTION_PATH}
              className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
            >
              {a.accueil.gerer}
            </Link>
          </>
        ) : toFinish ? (
          <>
            <p className="text-corps text-encre-taupe">
              {fill(a.accueil.finaliserTexte, { plan: planWords(toFinish).name })}
            </p>
            <form action={startSubscriptionAction.bind(null, toFinish)}>
              <Button type="submit">{a.accueil.finaliser}</Button>
            </form>
            <Link
              href={SUBSCRIPTION_PATH}
              className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
            >
              {a.accueil.autreFormule}
            </Link>
          </>
        ) : (
          <>
            <p className="text-corps text-encre-taupe">{a.accueil.choisir}</p>
            <Button asChild>
              <Link href={SUBSCRIPTION_PATH}>{a.accueil.voir}</Link>
            </Button>
          </>
        )}
      </section>
      <p className="max-w-2xl text-intro text-encre-taupe">{d.famille.accueil}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={NEW_REQUEST_PATH}>{d.boutons.publier}</Link>
        </Button>
        <Button asChild variant="raye">
          <Link href={NEW_URGENT_REQUEST_PATH}>{d.boutons.publierUrgente}</Link>
        </Button>
      </div>
      <Link
        href={SEARCH_PATH}
        className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {words(recherche).nav}
      </Link>
      <Link
        href={FAMILY_REQUESTS_PATH}
        className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {d.famille.titre}
      </Link>
      <Button asChild variant="blanc" className="self-start">
        <Link href={c.pages.charte.href}>{f.charte}</Link>
      </Button>
      <OwnNote note={note} />
    </SpaceShell>
  );
}
