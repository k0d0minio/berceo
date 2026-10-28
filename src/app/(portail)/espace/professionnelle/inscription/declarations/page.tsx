import type { Metadata } from "next";

import { CHARTER_TITLE_ID, Charte } from "@/components/professionnelle/charte";
import { DeclarationsForm } from "@/components/professionnelle/declarations-form";
import { StepsHeader } from "@/components/professionnelle/steps-header";
import { SpaceShell } from "@/components/shell/space-shell";
import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";

import { openStep } from "../step";

const t = words(professionnelle);

export const metadata: Metadata = {
  title: t.meta.inscription,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* Step 4, "Validez vos déclarations": the six declarations, the charter and its checkbox. */
export default async function DeclarationsStepPage() {
  const { user, done } = await openStep("declarations");

  return (
    <SpaceShell user={user} title={t.etapes.titres.declarations}>
      <StepsHeader current="declarations" done={done} />
      <DeclarationsForm charte={<Charte level={2} id={CHARTER_TITLE_ID} />} />
    </SpaceShell>
  );
}
