import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { PROFESSIONAL_REQUESTS_PATH } from "@/lib/demandes/paths";
import { loadFile } from "@/lib/professionnelle/file";
import { firstIncompleteStep } from "@/lib/professionnelle/rules";

import { ONBOARDING } from "./inscription/step";

const t = words(comptes);
const p = words(professionnelle);
const d = words(demandes);

export const metadata: Metadata = {
  title: t.meta.espace,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The professional's space. While her file is a draft, the only thing she can
 * do is the onboarding (D-21): this page sends her to the first incomplete
 * step. Once submitted it says where her file stands, the guide's message
 * first when she has just sent it, and links to her file; once validated, to
 * the requests in her communes.
 */
export default async function EspaceProfessionnellePage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string }>;
}) {
  const user = await requireAccess(SPACES.professionnel);
  const file = await loadFile(user.id);
  const { status } = file.profile;

  if (status === "brouillon") redirect(`${ONBOARDING}/${firstIncompleteStep(file.state)}`);

  const justSent = (await searchParams).envoye === "1";

  return (
    <SpaceShell user={user}>
      {justSent && status === "en_attente" ? <FormMessage>{p.messages.envoye}</FormMessage> : null}
      <p className="max-w-2xl text-intro text-taupe">
        {status === "valide"
          ? p.messages.valide
          : status === "refuse"
            ? p.messages.refuse
            : t.espaces.professionnelle.enAttente}
      </p>
      <div className="flex flex-wrap gap-3">
        {status === "valide" ? (
          <Button asChild>
            <Link href={PROFESSIONAL_REQUESTS_PATH}>{d.professionnelle.lien}</Link>
          </Button>
        ) : null}
        {status !== "refuse" ? (
          <Button asChild variant={status === "valide" ? "raye" : "blanc"}>
            <Link href={`${SPACES.professionnel}/profil`}>{p.messages.modifierDossier}</Link>
          </Button>
        ) : null}
      </div>
    </SpaceShell>
  );
}
