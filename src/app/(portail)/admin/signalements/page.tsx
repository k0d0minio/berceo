import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { ReportsTable } from "@/components/admin/reports-table";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { readReports } from "@/lib/admin/lists";
import { ADMIN_REPORTS_PATH } from "@/lib/admin/paths";
import { journalPage, reportFilter, type ReportFilter } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";

const a = words(admin);

export const metadata: Metadata = {
  title: a.signalements.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Signalements » (back-office-admin, D-139; D-17: disputes arrive by
 * e-mail): every cancelled garde and every reported absence, « À traiter » by
 * default, which is what the overview counts, or all of them; 50 a page. It
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
    listHref(ADMIN_REPORTS_PATH, { filtre: next === "tous" ? "tous" : null, page: n > 1 ? String(n) : null });

  return (
    <AdminShell user={user} title={t.titre} current="signalements">
      <p className="max-w-3xl text-corps text-encre-taupe">{t.intro}</p>
      <FilterLinks
        label={t.colonnes.suivi}
        options={(["a-traiter", "tous"] as const).map((filter) => ({
          label: t.filtres[filter],
          href: href(filter),
          current: filtre === filter,
        }))}
      />
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{filtre === "tous" ? t.videTous : t.vide}</p>
      ) : (
        <ReportsTable rows={rows} />
      )}
      <Pager page={page} pages={pages} href={(n) => href(filtre, n)} />
    </AdminShell>
  );
}
