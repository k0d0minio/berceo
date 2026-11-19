import type { Metadata } from "next";

import { Charte } from "@/components/professionnelle/charte";
import { SpaceShell } from "@/components/shell/space-shell";
import { charte } from "@/content/charte";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { FAMILY_CHARTER_PATH } from "@/lib/famille/paths";

const t = words(charte);

export const metadata: Metadata = {
  title: t.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The professionals' charter, opened from the family's home: the same text as
 * `/charte-des-professionnelles`, inside her signed-in shell so she keeps her
 * navigation (round 2, JAM-301). The greeting is the page's H1, the charter's
 * title an H2 under it.
 */
export default async function CharteFamillePage() {
  const user = await requireAccess(FAMILY_CHARTER_PATH);
  return (
    <SpaceShell user={user}>
      <div className="max-w-2xl">
        <Charte level={2} />
      </div>
    </SpaceShell>
  );
}
