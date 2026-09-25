import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { PaymentsTable } from "@/components/admin/payments-table";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { RECENT_PERIOD, journalPage, recentPaymentCutoff } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths";
import { readPayments } from "@/lib/paiements/payments";

const a = words(admin);

export const metadata: Metadata = {
  title: a.paiements.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Paiements des frais de service » (frais-de-service, D-93): every fee,
 * newest first, 50 per page like the journal, with « Rembourser les frais »
 * on a paid one (D-101). `?periode=7j` keeps the fees paid in the last 7
 * days: the overview's « Paiements récents » counts exactly those
 * (back-office-admin, D-133). A 404 to anyone but an admin (D-33). Families
 * and professionals see no payment history anywhere (I-05 NON).
 */
export default async function PaiementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; periode?: string }>;
}) {
  const user = await requireAccess(ADMIN_PAYMENTS_PATH);
  const params = await searchParams;
  const page = journalPage(params.page);
  const recent = params.periode === RECENT_PERIOD;
  const now = new Date();
  const { rows, pages } = await readPayments(page, recent ? recentPaymentCutoff(now) : null);
  const t = a.paiements;
  const href = (n: number, periode = recent) =>
    listHref(ADMIN_PAYMENTS_PATH, { periode: periode ? RECENT_PERIOD : null, page: n > 1 ? String(n) : null });

  return (
    <AdminShell user={user} title={t.titre} current="paiements">
      <FilterLinks
        label={t.colonnes.date}
        options={[
          { label: t.filtres.tous, href: href(1, false), current: !recent },
          { label: t.filtres.recents, href: href(1, true), current: recent },
        ]}
      />
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{recent ? t.videRecents : t.vide}</p>
      ) : (
        <PaymentsTable rows={rows} now={now} />
      )}
      <Pager page={page} pages={pages} href={(n) => href(n)} />
    </AdminShell>
  );
}
