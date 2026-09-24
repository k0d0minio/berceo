import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { loadFile } from "@/lib/professionnelle/file";
import { firstIncompleteStep } from "@/lib/professionnelle/rules";

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
 * first when she has just sent it, and links to her file.
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
      {status !== "refuse" ? (
        <Button asChild className="self-start">
          <Link href={`${SPACES.professionnel}/profil`}>{p.messages.modifierDossier}</Link>
        </Button>
      ) : null}
    </SpaceShell>
  );
}
