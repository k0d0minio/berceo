import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RequestForm } from "@/components/demandes/request-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { placeLine } from "@/lib/demandes/format";
import { NEW_REQUEST_PATH } from "@/lib/demandes/paths";
import { dateWindow } from "@/lib/demandes/rules";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { familyCommune } from "@/lib/famille/profile";

import { publishRequestAction } from "../actions";

const t = words(demandes);

export const metadata: Metadata = {
  title: t.meta.nouvelle,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Publier une demande de garde de nuit », or with `?urgente=1` « Publier une
 * demande urgente » for tonight or tomorrow night (D-60). Without a commune in
 * her profile there is nothing to publish: she is sent to complete it first.
 */
export default async function NouvelleDemandePage({
  searchParams,
}: {
  searchParams: Promise<{ urgente?: string }>;
}) {
  const user = await requireAccess(NEW_REQUEST_PATH);
  const commune = await familyCommune(user.id);
  if (!commune) redirect(`${PROFILE_PATH}?completer=1`);

  const urgent = (await searchParams).urgente === "1";

  return (
    <SpaceShell user={user} title={urgent ? t.formulaire.titreUrgent : t.formulaire.titre}>
      <p className="max-w-2xl text-intro text-taupe">
        {urgent ? t.formulaire.introUrgente : t.formulaire.sousTitre}
      </p>
      <RequestForm
        action={publishRequestAction}
        mode={urgent ? "urgente" : "normale"}
        dates={dateWindow(urgent, new Date())}
        commune={placeLine(commune.postcode, commune.locality)}
      />
    </SpaceShell>
  );
}
