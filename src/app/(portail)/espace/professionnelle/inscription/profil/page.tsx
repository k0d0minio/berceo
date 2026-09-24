import type { Metadata } from "next";

import { ProfileForm } from "@/components/professionnelle/profile-form";
import { StepsHeader } from "@/components/professionnelle/steps-header";
import { SpaceShell } from "@/components/shell/space-shell";
import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { PROFESSIONS, STUDENT } from "@/lib/professionnelle/rules";
import { studentsAdmitted } from "@/lib/settings";

import { openStep } from "../step";

const t = words(professionnelle);

export const metadata: Metadata = {
  title: t.meta.inscription,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* Step 2, "Complétez votre profil". */
export default async function ProfilStepPage() {
  const { user, file, done } = await openStep("profil");
  const admitted = await studentsAdmitted();
  const { profile } = file;
  const photo = file.documents.find((d) => d.kind === "photo");

  // The student option is offered while the switch is on, or to a file that already carries it (D-7).
  const professions = PROFESSIONS.filter(
    (p) => p !== STUDENT || admitted || profile.profession === STUDENT,
  );

  return (
    <SpaceShell user={user} title={t.etapes.titres.profil}>
      <StepsHeader current="profil" done={done} />
      <ProfileForm
        mode="onboarding"
        professions={professions}
        photo={photo ? { id: photo.id, fileName: photo.fileName } : null}
        saved={{ ...file.state.draft }}
      />
    </SpaceShell>
  );
}
