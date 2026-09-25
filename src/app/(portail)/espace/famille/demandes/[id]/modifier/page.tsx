import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { RequestForm } from "@/components/demandes/request-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { placeLine } from "@/lib/demandes/format";
import { familyRequestPath } from "@/lib/demandes/paths";
import { ownRequest } from "@/lib/demandes/requests";
import { dateWindow, isChangeable, toHourMinute } from "@/lib/demandes/rules";

import { updateRequestAction } from "../../actions";

const t = words(demandes);

export const metadata: Metadata = {
  title: t.formulaire.titreModification,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * Editing an open request: the night (within its own kind's window, as of
 * today), the start time, the children and the age. The commune and the
 * urgency stay as published.
 */
export default async function ModifierDemandePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccess(familyRequestPath(id));
  const request = await ownRequest(user.id, id);
  if (!request) notFound();

  const now = new Date();
  if (!isChangeable(request, now)) redirect(`${familyRequestPath(request.id)}?erreur=nonModifiable`);

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
          enfants: request.children,
          ageValeur: String(request.babyAgeValue),
          ageUnite: request.babyAgeUnit,
        }}
      />
    </SpaceShell>
  );
}
