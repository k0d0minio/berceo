import type { Metadata } from "next";
import Link from "next/link";

import { AccountsTable } from "@/components/admin/accounts-table";
import { AdminShell } from "@/components/admin/admin-shell";
import { listHref, Pager } from "@/components/admin/list-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { searchAccounts } from "@/lib/admin/accounts";
import { ADMIN_USERS_PATH } from "@/lib/admin/paths";
import { SEARCH_MAX, journalPage } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";

const a = words(admin);

export const metadata: Metadata = {
  title: a.utilisateurs.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Gestion des utilisateurs » (the guide, « Le backoffice »): one search box
 * that finds an account by first name, last name, full name, e-mail or phone
 * in any notation (back-office-admin), or the newest accounts when it is
 * empty; 50 a page. A deleted account is never listed. A GET form, so a search
 * is an address. A 404 to anyone but an admin (D-33).
 */
export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const user = await requireAccess(ADMIN_USERS_PATH);
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, SEARCH_MAX).trim();
  const page = journalPage(params.page);
  const { rows, pages } = await searchAccounts(q, page);
  const t = a.utilisateurs;

  return (
    <AdminShell user={user} title={t.titre} current="utilisateurs">
      <form action={ADMIN_USERS_PATH} method="get" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="recherche-utilisateur" className="text-corps font-semibold text-encre-taupe">
            {t.recherche}
          </label>
          <Input id="recherche-utilisateur" name="q" type="search" defaultValue={q} maxLength={SEARCH_MAX} />
        </div>
        <Button type="submit">{t.rechercher}</Button>
      </form>
      {q ? (
        <div className="flex flex-wrap items-center gap-6">
          <p className="text-corps text-encre-taupe">{fill(t.resultats, { q })}</p>
          <Link href={ADMIN_USERS_PATH} className="text-corps font-semibold text-encre-sauge underline underline-offset-4">
            {t.effacer}
          </Link>
        </div>
      ) : (
        <p className="text-corps text-encre-taupe">{t.recents}</p>
      )}
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{t.vide}</p>
      ) : (
        <AccountsTable rows={rows} />
      )}
      <Pager page={page} pages={pages} href={(n) => listHref(ADMIN_USERS_PATH, { q, page: String(n) })} />
    </AdminShell>
  );
}
