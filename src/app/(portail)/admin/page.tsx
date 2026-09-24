import type { Metadata } from "next";

import { SpaceShell } from "@/components/shell/space-shell";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.espaces.admin.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The founders' back-office. Anyone but an admin, signed in or not, gets a 404
 * (D-33). Its tools arrive with stubs 5 and 14.
 */
export default async function AdminPage() {
  const user = await requireAccess(SPACES.admin);

  return (
    <SpaceShell user={user} title={t.espaces.admin.title}>
      <p className="max-w-2xl text-intro text-taupe">{t.espaces.admin.vide}</p>
    </SpaceShell>
  );
}
