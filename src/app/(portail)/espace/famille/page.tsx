import type { Metadata } from "next";

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

/* The parent's space. Its requests arrive with stub 7; for now, a greeting. */
export default async function EspaceFamillePage() {
  const user = await requireAccess(SPACES.parent);

  return (
    <SpaceShell user={user}>
      <p className="max-w-2xl text-intro text-taupe">{t.espaces.famille.vide}</p>
    </SpaceShell>
  );
}
