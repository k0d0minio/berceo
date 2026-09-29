import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { PaymentsTable } from "@/components/admin/payments-table";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { RECENT_PERIOD, journalPage, recentPaymentCutoff } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths";
import { readPayments, type PaymentsView } from "@/lib/paiements/payments";
import { isToRefundFilter, TO_REFUND } from "@/lib/paiements/rules";

const a = words(admin);

export const metadata: Metadata = {
  title: a.paiements.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** The list's three filters, one at a time (D-133, D-164). */
type Filter = "tous" | "recents" | "aRembourser";

/*
 * « Paiements des frais de service » (frais-de-service, D-93): every fee,
 * newest first, 50 per page like the journal, with « Rembourser les frais »
 * on a paid one (D-101). `?periode=7j` keeps the fees paid in the last 7
 * days: the overview's « Paiements récents » counts exactly those
 * (back-office-admin, D-133). `?statut=a-rembourser` keeps the fees a
 * professional's cancellation left unrefunded (D-162, D-164), and wins over
 * `periode`. A 404 to anyone but an admin (D-33). Families and professionals
 * see no payment history anywhere (I-05 NON).
 */
export default async function PaiementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; periode?: string; statut?: string }>;
}) {
  const user = await requireAccess(ADMIN_PAYMENTS_PATH);
  const params = await searchParams;
  const page = journalPage(params.page);
  const filter: Filter = isToRefundFilter(params.statut)
    ? "aRembourser"
    : params.periode === RECENT_PERIOD
      ? "recents"
      : "tous";
  const now = new Date();
  const view: PaymentsView =
    filter === "aRembourser"
      ? { kind: "aRembourser" }
      : filter === "recents"
        ? { kind: "depuis", since: recentPaymentCutoff(now) }
        : { kind: "tous" };
  const { rows, pages } = await readPayments(page, view);
  const t = a.paiements;
  const href = (n: number, to: Filter = filter) =>
    listHref(ADMIN_PAYMENTS_PATH, {
      periode: to === "recents" ? RECENT_PERIOD : null,
      statut: to === "aRembourser" ? TO_REFUND : null,
      page: n > 1 ? String(n) : null,
    });
  const empty = { tous: t.vide, recents: t.videRecents, aRembourser: t.videARembourser }[filter];

  return (
    <AdminShell user={user} title={t.titre} current="paiements">
      <FilterLinks
        label={t.filtres.libelle}
        options={[
          { label: t.filtres.tous, href: href(1, "tous"), current: filter === "tous" },
          { label: t.filtres.recents, href: href(1, "recents"), current: filter === "recents" },
          { label: t.filtres.aRembourser, href: href(1, "aRembourser"), current: filter === "aRembourser" },
        ]}
      />
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{empty}</p>
      ) : (
        <PaymentsTable rows={rows} now={now} />
      )}
      <Pager page={page} pages={pages} href={(n) => href(n)} />
    </AdminShell>
  );
}
