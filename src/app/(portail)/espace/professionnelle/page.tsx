import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { fill, words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { isHeldStudent } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { loadFile } from "@/lib/professionnelle/file";
import { firstIncompleteStep } from "@/lib/professionnelle/rules";
import { studentsAdmitted } from "@/lib/settings";

import { ONBOARDING } from "./inscription/step";

const t = words(comptes);
const p = words(professionnelle);

export const metadata: Metadata = {
  title: t.meta.espace,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The professional's space. While her file is a draft, the only thing she can
 * do is the onboarding (D-21): this page sends her to the first incomplete
 * step. Once submitted it says where her file stands, the guide's message
 * first when she has just sent it, and links to her file. The founders'
 * decision shows here too (verification-back-office): the guide's line once
 * validated, the reason of a complément or a refusal, and why a student file
 * waits while students are not admitted.
 */
export default async function EspaceProfessionnellePage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string; renvoye?: string }>;
}) {
  const user = await requireAccess(SPACES.professionnel);
  const file = await loadFile(user.id);
  const { status, reviewReason } = file.profile;

  if (status === "brouillon") redirect(`${ONBOARDING}/${firstIncompleteStep(file.state)}`);

  const params = await searchParams;
  const justSent = params.envoye === "1";
  const justResent = params.renvoye === "1";
  const held = isHeldStudent(file.profile, await studentsAdmitted());
  const line =
    status === "valide"
      ? p.messages.valide
      : status === "refuse"
        ? p.messages.refuse
        : status === "complement_demande"
          ? p.messages.complement
          : held
            ? p.messages.etudiantes
            : t.espaces.professionnelle.enAttente;
  const showReason = (status === "refuse" || status === "complement_demande") && reviewReason;

  return (
    <SpaceShell user={user}>
      {justSent && status === "en_attente" ? <FormMessage>{p.messages.envoye}</FormMessage> : null}
      {justResent && status === "en_attente" ? <FormMessage>{p.renvoi.envoye}</FormMessage> : null}
      <p className="max-w-2xl text-intro text-taupe">{line}</p>
      {showReason ? (
        <p className="max-w-2xl text-corps text-taupe">{fill(p.messages.motif, { motif: showReason })}</p>
      ) : null}
      {status !== "refuse" ? (
        <Button asChild className="self-start">
          <Link href={`${SPACES.professionnel}/profil`}>{p.messages.modifierDossier}</Link>
        </Button>
      ) : null}
    </SpaceShell>
  );
}
