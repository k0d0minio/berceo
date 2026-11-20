import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { RequestForm } from "@/components/demandes/request-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { familyMayNow } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { placeLine } from "@/lib/demandes/format";
import { familyRequestPath } from "@/lib/demandes/paths";
import { ownRequest } from "@/lib/demandes/requests";
import { dateWindow, isEditable, toHourMinute } from "@/lib/demandes/rules";
import { ownRequestAddress } from "@/lib/famille/request-address";
import { answersEver } from "@/lib/reservations/answers";

import { updateRequestAction } from "../../actions";

const t = words(demandes);

export const metadata: Metadata = {
  title: t.formulaire.titreModification,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * Editing an open request: the night (within its own kind's window, as of
 * today), the start time, the extra hours, the children with their ages, the
 * feedings, which a request published before the field gets here, and the night's rue, numéro
 * and boîte, the profile's for a request published before it had its own, and
 * the optional reason (demande-motif-facultatif). The
 * commune and the urgency stay as published. An answer waiting on it locks it (D-76).
 * Without a subscription the invitation line takes the form's place
 * (abonnements-acces).
 */
export default async function ModifierDemandePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccess(familyRequestPath(id));
  const request = await ownRequest(user.id, id);
  if (!request) notFound();

  const now = new Date();
  if (!(await familyMayNow(user.id, "modifier", now))) {
    return (
      <SpaceShell user={user} title={t.formulaire.titreModification}>
        <SubscriptionRequired />
      </SpaceShell>
    );
  }
  // One answer ever, on it or on any night of its regular request, locks it (JAM-302, Q4).
  const answered = await answersEver(user.id, request.id);
  if (!isEditable(request, answered, now)) redirect(`${familyRequestPath(request.id)}?erreur=nonModifiable`);
  const address = await ownRequestAddress(user.id, request.id);

  return (
    <SpaceShell user={user} title={t.formulaire.titreModification}>
      <RequestForm
        action={updateRequestAction}
        mode="modification"
        dates={dateWindow(request.urgent, now)}
        commune={placeLine(request.postcode, request.locality)}
        id={request.id}
        defaults={{
          date: request.nightDate,
          heure: toHourMinute(request.startTime),
          heuresSupplementaires: String(request.extraHours),
          enfants: request.childAges.map((child) => ({ ageValeur: String(child.value), ageUnite: child.unit })),
          alimentation: [...request.feedings],
          rue: address?.street ?? "",
          numero: address?.houseNumber ?? "",
          boite: address?.box ?? "",
          motif: request.reason ?? "",
        }}
      />
    </SpaceShell>
  );
}
