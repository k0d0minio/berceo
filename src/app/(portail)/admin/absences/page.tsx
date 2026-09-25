import type { Metadata } from "next";
import Link from "next/link";

import { AbsencesTable } from "@/components/gardes/absences-table";
import { SpaceShell } from "@/components/shell/space-shell";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { reportedAbsences } from "@/lib/gardes/gardes";
import { ADMIN_ABSENCES_PATH } from "@/lib/gardes/paths";

const a = words(admin);

export const metadata: Metadata = {
  title: a.absences.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Absences signalées » (cycle-de-garde-et-annulation, D-106): every garde a
 * family or a professional reported the other side absent on, newest first,
 * with the fee's status. Read-only; the refund is the founders' button on the
 * payments page (D-101). A 404 to anyone but an admin (D-33).
 */
export default async function AbsencesPage() {
  const user = await requireAccess(ADMIN_ABSENCES_PATH);
  const rows = await reportedAbsences();

  return (
    <SpaceShell user={user} title={a.absences.titre}>
      <Link href={SPACES.admin} className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4">
        {a.absences.retour}
      </Link>
      <p className="max-w-3xl text-corps text-encre-taupe">{a.absences.intro}</p>
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{a.absences.vide}</p>
      ) : (
        <AbsencesTable rows={rows} />
      )}
    </SpaceShell>
  );
}
