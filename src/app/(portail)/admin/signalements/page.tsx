import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { ReportsTable } from "@/components/admin/reports-table";
import { DocumentIcon } from "@/components/berceo-icons";
import { EmptyState } from "@/components/ui/empty-state";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { readReports } from "@/lib/admin/lists";
import { ADMIN_REPORTS_PATH } from "@/lib/admin/paths";
import { journalPage, REPORT_FILTERS, reportFilter, type ReportFilter } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";

const a = words(admin);

export const metadata: Metadata = {
  title: a.signalements.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Signalements » (back-office-admin, D-139): every cancelled garde and
 * every reported absence, a contested one marked « Litige »
 * (annulations-table, which supersedes D-17's disputes by e-mail), « À traiter » by
 * default, which is what the overview counts, every litige
 * (annulations-back-office), or all of them; 50 a page. It
 * supersedes « Absences signalées », whose address redirects here. A 404 to
 * anyone but an admin (D-33).
 */
export default async function SignalementsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string; page?: string }>;
}) {
  const user = await requireAccess(ADMIN_REPORTS_PATH);
  const params = await searchParams;
  const filtre = reportFilter(params.filtre);
  const page = journalPage(params.page);
  const { rows, pages } = await readReports(filtre, page);
  const t = a.signalements;
  const href = (next: ReportFilter, n = 1) =>
    listHref(ADMIN_REPORTS_PATH, { filtre: next === "a-traiter" ? null : next, page: n > 1 ? String(n) : null });
  const empty: Record<ReportFilter, string> = { "a-traiter": t.vide, litige: t.videLitige, tous: t.videTous };

  return (
    <AdminShell user={user} title={t.titre} current="signalements">
      <p className="max-w-3xl text-corps text-taupe">{t.intro}</p>
      <FilterLinks
        label={t.colonnes.suivi}
        options={REPORT_FILTERS.map((filter) => ({
          label: t.filtres[filter],
          href: href(filter),
          current: filtre === filter,
        }))}
      />
      {rows.length === 0 ? (
        <EmptyState icon={DocumentIcon} text={empty[filtre]} />
      ) : (
        <ReportsTable rows={rows} />
      )}
      <Pager page={page} pages={pages} href={(n) => href(filtre, n)} />
    </AdminShell>
  );
}
