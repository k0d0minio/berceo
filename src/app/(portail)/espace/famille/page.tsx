import type { Metadata } from "next";
import Link from "next/link";

import { OwnNote } from "@/components/avis/stars";
import { CreditsBlock } from "@/components/credits/credits-block";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { abonnements } from "@/content/abonnements";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { famille } from "@/content/famille";
import { favoris } from "@/content/favoris";
import { fill, words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import { planWords, renewalDate } from "@/lib/abonnements/format";
import { SUBSCRIPTION_PATH } from "@/lib/abonnements/paths";
import { planToFinish, subscriptionState } from "@/lib/abonnements/rules";
import { familyNightPass, hasCompletedCheckout, liveSubscription } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { scheduleWelcomeIfDue } from "@/lib/auth/welcome";
import { noteOfUser } from "@/lib/avis/ratings";
import { familyCredits } from "@/lib/credits/credits";
import { FAMILY_REQUESTS_PATH, NEW_REQUEST_PATH, NEW_URGENT_REQUEST_PATH } from "@/lib/demandes/paths";
import { FAMILY_CHARTER_PATH, PROFILE_PATH } from "@/lib/famille/paths";
import { familyCommune } from "@/lib/famille/profile";
import { SEARCH_PATH } from "@/lib/recherche/slugs";
import { FAMILY_PROFESSIONALS_PATH } from "@/lib/reservations/paths";
import { siteOrigin } from "@/lib/site-origin";

import { startSubscriptionAction } from "./abonnement/actions";

const t = words(comptes);
const f = words(famille).accueil;
const d = words(demandes);
const a = words(abonnements);

export const metadata: Metadata = {
  title: t.meta.espace,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The parent's space. Until her commune is saved it asks her to complete her
 * profile. The two ways to publish (D-60), the search, « Mes professionnelles »
 * (favoris-liste) and her requests are one tap away.
 * Her own note and gardes count close the page (avis-etoiles, D-121). « Votre
 * abonnement » shows her plan and its renewal date, or leads to the four plans
 * (abonnements-catalogue-stripe); a cancelled one shows its end date and a
 * failed renewal one line of warning (abonnements-espace-echec-paiement). « Mes crédits » under it shows her
 * balance and each Berceo credit with its expiry (credits-registre). A family who left the Checkout of the plan
 * she picked at sign-up gets one call to finish it instead
 * (abonnements-inscription-famille). An outlined button opens the charter the
 * professionals accept (charte-cote-parents). A welcome
 * e-mail that failed to send is tried again after the page (D-165). The
 * blocks are white cards: the page behind them is pearl (JAM-327).
 */
export default async function EspaceFamillePage() {
  const user = await requireAccess(SPACES.parent);
  scheduleWelcomeIfDue(user, await siteOrigin());
  const now = new Date();
  const [commune, note, live, completed, wallet] = await Promise.all([
    familyCommune(user.id),
    noteOfUser(user.id),
    liveSubscription(user.id),
    hasCompletedCheckout(user.id),
    familyCredits(user.id, now),
  ]);
  const running = live && (live.status === "active" || live.status === "impayee") ? live : null;
  const state = running ? subscriptionState(running, now) : null;
  const toFinish = planToFinish(user.signupPlan, completed);
  // An open one-night pass (JAM-304) takes the place of the call to choose a plan.
  const pass = running ? null : await familyNightPass(user.id, now);

  return (
    <SpaceShell user={user}>
      {commune ? null : (
        <section className="flex max-w-2xl flex-col items-start gap-4 rounded-carte bg-blanc px-6 py-6 md:px-8">
          <h2 className="text-h3 font-bold text-sauge">{f.completer.titre}</h2>
          <p className="text-corps text-taupe">{f.completer.texte}</p>
          <Button asChild>
            <Link href={PROFILE_PATH}>{f.completer.lien}</Link>
          </Button>
        </section>
      )}
      <section className="flex max-w-2xl flex-col items-start gap-3 rounded-carte bg-blanc px-6 py-6 md:px-8">
        <h2 className="text-h3 font-bold text-sauge">{a.accueil.titre}</h2>
        {running ? (
          <>
            {state === "grace" || state === "suspendue" ? (
              <p role="alert" className="rounded-carte bg-beurre px-4 py-3 text-corps text-taupe">
                {a.accueil.alerte}
              </p>
            ) : null}
            <p className="text-corps text-taupe">{fill(a.espace.formule, { plan: planWords(running.plan).name })}</p>
            {state === "resiliee" && running.cancelsAt ? (
              <p className="text-corps text-taupe">{fill(a.espace.finLe, { date: renewalDate(running.cancelsAt) })}</p>
            ) : running.currentPeriodEnd ? (
              <p className="text-corps text-taupe">
                {fill(a.espace.renouvellement, { date: renewalDate(running.currentPeriodEnd) })}
              </p>
            ) : null}
            <Link
              href={SUBSCRIPTION_PATH}
              className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
            >
              {a.accueil.gerer}
            </Link>
          </>
        ) : pass ? (
          <>
            <p className="text-corps text-taupe">{pass.booked ? a.espace.uneNuit.reservee : a.espace.uneNuit.active}</p>
            <Link
              href={SUBSCRIPTION_PATH}
              className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
            >
              {a.accueil.gerer}
            </Link>
          </>
        ) : toFinish ? (
          <>
            <p className="text-corps text-taupe">
              {fill(a.accueil.finaliserTexte, { plan: planWords(toFinish).name })}
            </p>
            <form action={startSubscriptionAction.bind(null, toFinish)}>
              <Button type="submit">{a.accueil.finaliser}</Button>
            </form>
            <Link
              href={SUBSCRIPTION_PATH}
              className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
            >
              {a.accueil.autreFormule}
            </Link>
          </>
        ) : (
          <>
            <p className="text-corps text-taupe">{a.accueil.choisir}</p>
            <Button asChild>
              <Link href={SUBSCRIPTION_PATH}>{a.accueil.voir}</Link>
            </Button>
          </>
        )}
      </section>
      <CreditsBlock list={wallet.list} balanceCents={wallet.balanceCents} />
      <p className="max-w-2xl text-intro text-taupe">{d.famille.accueil}</p>
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
        className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
      >
        {words(recherche).nav}
      </Link>
      <Link
        href={FAMILY_PROFESSIONALS_PATH}
        className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
      >
        {words(favoris).nav}
      </Link>
      <Link
        href={FAMILY_REQUESTS_PATH}
        className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
      >
        {d.famille.titre}
      </Link>
      <Button asChild variant="blanc" className="self-start">
        <Link href={FAMILY_CHARTER_PATH}>{f.charte}</Link>
      </Button>
      <OwnNote note={note} />
    </SpaceShell>
  );
}
