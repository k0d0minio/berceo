import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { RequestsTable } from "@/components/admin/requests-table";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { db, users } from "@/db";
import { fullName } from "@/lib/admin/journal";
import { readRequests } from "@/lib/admin/lists";
import { ADMIN_REQUESTS_PATH } from "@/lib/admin/paths";
import { REQUEST_FILTERS, accountParam, journalPage, requestFilter } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";

const a = words(admin);

export const metadata: Metadata = {
  title: a.demandes.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * Every care request (back-office-admin), the latest night first, 50 a page,
 * filtered by the state the spaces show and, from an account's page, by
 * family (`?famille=`). Read-only. A 404 to anyone but an admin (D-33).
 */
export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ etat?: string; famille?: string; page?: string }>;
}) {
  const user = await requireAccess(ADMIN_REQUESTS_PATH);
  const params = await searchParams;
  const etat = requestFilter(params.etat);
  const famille = accountParam(params.famille);
  const page = journalPage(params.page);
  const now = new Date();

  const [{ rows, pages }, [family]] = await Promise.all([
    readRequests(etat, famille, page),
    famille
      ? db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, famille)).limit(1)
      : Promise.resolve([]),
  ]);
  const t = a.demandes;
  const href = (next: { etat?: string | null; page?: number }) =>
    listHref(ADMIN_REQUESTS_PATH, {
      etat: next.etat === undefined ? etat : next.etat,
      famille,
      page: next.page && next.page > 1 ? String(next.page) : null,
    });

  return (
    <AdminShell user={user} title={t.titre} current="demandes">
      {family ? (
        <div className="flex flex-wrap items-center gap-6">
          <p className="text-corps font-semibold text-encre-taupe">{fill(t.deCompte, { nom: fullName(family) })}</p>
          <Link
            href={listHref(ADMIN_REQUESTS_PATH, { etat })}
            className="text-corps font-semibold text-encre-sauge underline underline-offset-4"
          >
            {t.toutesLesDemandes}
          </Link>
        </div>
      ) : null}
      <FilterLinks
        label={t.colonnes.etat}
        options={[
          { label: t.filtres.toutes, href: href({ etat: null }), current: etat === null },
          ...REQUEST_FILTERS.map((filter) => ({
            label: t.filtres[filter],
            href: href({ etat: filter }),
            current: etat === filter,
          })),
        ]}
      />
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{t.vide}</p>
      ) : (
        <RequestsTable rows={rows} now={now} />
      )}
      <Pager page={page} pages={pages} href={(n) => href({ page: n })} />
    </AdminShell>
  );
}
