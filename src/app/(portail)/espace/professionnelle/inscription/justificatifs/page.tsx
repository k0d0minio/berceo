import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DocumentsForm } from "@/components/professionnelle/documents-form";
import { StepsHeader } from "@/components/professionnelle/steps-header";
import { SpaceShell } from "@/components/shell/space-shell";
import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";

import { ONBOARDING, openStep } from "../step";

const t = words(professionnelle);

export const metadata: Metadata = {
  title: t.meta.inscription,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* Step 3, "Déposez vos justificatifs". */
export default async function JustificatifsStepPage() {
  const { user, file, done } = await openStep("justificatifs");
  const profession = file.profile.profession;
  // Step 2 is complete by now, so a profession is set; the guard is for the type.
  if (!profession) redirect(`${ONBOARDING}/profil`);

  const of = (kind: "diplome" | "attestation_inscription") =>
    file.documents.filter((d) => d.kind === kind).map((d) => ({ id: d.id, fileName: d.fileName }));

  return (
    <SpaceShell user={user} title={t.etapes.titres.justificatifs}>
      <StepsHeader current="justificatifs" done={done} />
      <p className="max-w-2xl text-corps text-taupe">{t.justificatifs.intro}</p>
      <DocumentsForm
        mode="onboarding"
        profession={profession}
        inamiNumber={file.profile.inamiNumber}
        files={{ diplome: of("diplome"), attestation_inscription: of("attestation_inscription") }}
      />
    </SpaceShell>
  );
}
