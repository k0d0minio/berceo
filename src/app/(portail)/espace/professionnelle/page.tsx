import type { Metadata } from "next";

import { FormMessage } from "@/components/auth/field";
import { SpaceShell } from "@/components/shell/space-shell";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.espace,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The professional's space. Until stub 5 records a validation, every
 * professional is pending, and she can sign in to see so (D-32): the guide's
 * line is shown here, not as a sign-in refusal. Her onboarding is stub 4's.
 */
export default async function EspaceProfessionnellePage() {
  const user = await requireAccess(SPACES.professionnel);

  return (
    <SpaceShell user={user}>
      <FormMessage>{t.espaces.professionnelle.enAttente}</FormMessage>
    </SpaceShell>
  );
}
