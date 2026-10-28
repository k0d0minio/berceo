import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CHARTER_TITLE_ID, Charte } from "@/components/professionnelle/charte";
import { DeclarationsForm } from "@/components/professionnelle/declarations-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { mustRenewDeclarations } from "@/lib/professionnelle/declarations";
import { NEW_DECLARATIONS_PATH } from "@/lib/professionnelle/paths";

const t = words(professionnelle);

export const metadata: Metadata = {
  title: t.declarations.nouvelles,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The declarations of a new version, on a submitted file (onboarding-retour-1).
 * The guard sends her here before any other page of her space opens. She ticks
 * the six declarations and the charter again, and her file keeps its status.
 * A file with nothing to renew goes to her space.
 */
export default async function NewDeclarationsPage() {
  const user = await requireAccess(NEW_DECLARATIONS_PATH);
  if (!(await mustRenewDeclarations(user.id))) redirect(SPACES.professionnel);

  return (
    <SpaceShell user={user} title={t.declarations.nouvelles}>
      <DeclarationsForm mode="renouvellement" charte={<Charte level={2} id={CHARTER_TITLE_ID} />} />
    </SpaceShell>
  );
}
