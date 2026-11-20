import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { CommunesTable } from "@/components/admin/communes-table";
import { listHref, Pager } from "@/components/admin/list-controls";
import { OursonIcon } from "@/components/berceo-icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { ADMIN_COMMUNES_PATH, communeRows } from "@/lib/admin/communes";
import { SEARCH_MAX, journalPage } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { servingCounts } from "@/lib/recherche/professionals";
import { siteOrigin } from "@/lib/site-origin";

const a = words(admin);

export const metadata: Metadata = {
  title: a.communes.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Communes » (JAM-361): the 565 communes with their postcodes, the number of
 * validated professionals who serve each one (the rule of the search and of
 * the public commune page, read in two queries by `src/lib/recherche/`), and
 * the share link of each public page, made from the address this deployment
 * answers at. The communes with the most professionals are first; 50 a page.
 * One search box finds a commune by name or postcode. A GET form, so a search
 * is an address and works with no JavaScript. A 404 to anyone but an admin
 * (D-33).
 */
export default async function CommunesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const user = await requireAccess(ADMIN_COMMUNES_PATH);
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, SEARCH_MAX).trim();
  const [counts, origin] = await Promise.all([servingCounts(), siteOrigin()]);
  const { rows, page, pages } = communeRows(q, journalPage(params.page), counts, origin);
  const t = a.communes;

  return (
    <AdminShell user={user} title={t.titre} current="communes">
      <p className="max-w-2xl text-corps text-taupe">{t.intro}</p>
      <form action={ADMIN_COMMUNES_PATH} method="get" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="recherche-commune" className="text-corps font-semibold text-taupe">
            {t.recherche}
          </label>
          <Input id="recherche-commune" name="q" type="search" defaultValue={q} maxLength={SEARCH_MAX} />
        </div>
        <Button type="submit">{t.rechercher}</Button>
      </form>
      {q ? (
        <div className="flex flex-wrap items-center gap-6">
          <p className="text-corps text-taupe">{fill(t.resultats, { q })}</p>
          <Link href={ADMIN_COMMUNES_PATH} className="text-corps font-semibold text-sauge underline underline-offset-4">
            {t.effacer}
          </Link>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState icon={OursonIcon} text={t.vide} />
      ) : (
        <>
          <p className="text-corps text-taupe">{t.ordre}</p>
          <CommunesTable rows={rows} />
        </>
      )}
      <Pager page={page} pages={pages} href={(n) => listHref(ADMIN_COMMUNES_PATH, { q, page: String(n) })} />
    </AdminShell>
  );
}
