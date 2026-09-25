import type { Metadata } from "next";
import Link from "next/link";

import { PaymentsTable } from "@/components/admin/payments-table";
import { SpaceShell } from "@/components/shell/space-shell";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { journalPage } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths";
import { readPayments } from "@/lib/paiements/payments";

const a = words(admin);

export const metadata: Metadata = {
  title: a.paiements.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const link = "text-corps font-semibold text-sauge underline underline-offset-4";

/*
 * « Paiements des frais de service » (frais-de-service, D-93): every fee,
 * newest first, 50 per page like the journal, with « Rembourser les frais »
 * on a paid one (D-89). A 404 to anyone but an admin (D-33). Families and
 * professionals see no payment history anywhere (I-05 NON).
 */
export default async function PaiementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAccess(ADMIN_PAYMENTS_PATH);
  const page = journalPage((await searchParams).page);
  const { rows, pages } = await readPayments(page);

  return (
    <SpaceShell user={user} title={a.paiements.titre}>
      <Link href={SPACES.admin} className={`self-start ${link}`}>
        {a.paiements.retour}
      </Link>
      {rows.length === 0 ? (
        <p className="text-corps text-taupe">{a.paiements.vide}</p>
      ) : (
        <PaymentsTable rows={rows} now={new Date()} />
      )}
      {pages > 1 ? (
        <nav className="flex flex-wrap items-center gap-6 text-corps text-taupe">
          {page > 1 ? (
            <Link href={`${ADMIN_PAYMENTS_PATH}?page=${page - 1}`} className={link}>
              {a.paiements.precedente}
            </Link>
          ) : null}
          <span>{fill(a.paiements.page, { n: String(page) })}</span>
          {page < pages ? (
            <Link href={`${ADMIN_PAYMENTS_PATH}?page=${page + 1}`} className={link}>
              {a.paiements.suivante}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </SpaceShell>
  );
}
