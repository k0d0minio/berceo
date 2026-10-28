import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { RequestForm } from "@/components/demandes/request-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { familyMayNow } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { localityValue } from "@/lib/communes";
import { NEW_REQUEST_PATH } from "@/lib/demandes/paths";
import { dateWindow } from "@/lib/demandes/rules";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { ownFamilyProfile } from "@/lib/famille/profile";
import { publicProfile } from "@/lib/reservations/profiles";

import { publishRequestAction } from "../actions";

const t = words(demandes);
const r = words(reservations);

export const metadata: Metadata = {
  title: t.meta.nouvelle,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Publier une demande de garde de nuit », or with `?urgente=1` « Publier une
 * demande urgente » for tonight or tomorrow night (D-60). Without a profile
 * there is nothing to publish: she is sent to complete it first. The night's
 * commune and address are prefilled from her profile, and she can change them
 * for this request (demande-adresse-de-la-nuit).
 * With `?pour=<profile id>` (from « Lui envoyer ma demande en priorité ») the
 * request goes to that validated professional in priority (D-71); an unknown
 * or unvalidated profile is ignored. Without a subscription the invitation
 * line takes the form's place (abonnements-acces).
 */
export default async function NouvelleDemandePage({
  searchParams,
}: {
  searchParams: Promise<{ urgente?: string; pour?: string }>;
}) {
  const query = await searchParams;
  const user = await requireAccess(withQuery(NEW_REQUEST_PATH, query));
  const urgent = query.urgente === "1";
  if (!(await familyMayNow(user.id, "publier", new Date()))) {
    return (
      <SpaceShell user={user} title={urgent ? t.formulaire.titreUrgent : t.formulaire.titre}>
        <SubscriptionRequired />
      </SpaceShell>
    );
  }

  const profile = await ownFamilyProfile(user.id);
  if (!profile) redirect(`${PROFILE_PATH}?completer=1`);

  const priority = query.pour ? await publicProfile(query.pour) : null;

  return (
    <SpaceShell user={user} title={urgent ? t.formulaire.titreUrgent : t.formulaire.titre}>
      <p className="max-w-2xl text-intro text-encre-taupe">
        {urgent ? t.formulaire.introUrgente : t.formulaire.sousTitre}
      </p>
      <RequestForm
        action={publishRequestAction}
        mode={urgent ? "urgente" : "normale"}
        dates={dateWindow(urgent, new Date())}
        defaults={{
          commune: profile.locality ? localityValue(profile.locality) : "",
          rue: profile.street ?? "",
          numero: profile.houseNumber ?? "",
          boite: profile.box ?? "",
        }}
        priority={
          priority
            ? { profileId: priority.id, note: fill(r.priorite.note, { prenom: priority.firstName }) }
            : undefined
        }
      />
    </SpaceShell>
  );
}
