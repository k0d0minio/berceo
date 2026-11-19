import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { NightPassesTable, SubscriptionsTable } from "@/components/admin/subscriptions-table";
import { CoeursIcon, LuneIcon } from "@/components/berceo-icons";
import { EmptyState } from "@/components/ui/empty-state";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { ADMIN_SUBSCRIPTIONS_PATH } from "@/lib/abonnements/paths";
import { ACTIVE_FILTER, isActiveFilter } from "@/lib/abonnements/rules";
import { readNightPasses, readSubscriptions } from "@/lib/abonnements/subscriptions";
import { journalPage } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";

const a = words(admin);

export const metadata: Metadata = {
  title: a.abonnements.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Abonnements des familles » (abonnements-back-office): every subscription
 * Stripe created, newest first, 50 per page like the journal. `?statut=actifs`
 * keeps those `hasActiveSubscription` counts: the overview's « Abonnements
 * actifs » counts exactly those (D-133). Below, the one-night plans paid
 * (JAM-304), with their own pages (`?nuits=`). Each row names the promotion
 * code of its first payment. Read-only: Stripe changes a subscription. A 404 to anyone but an admin (D-33).
 */
export default async function AbonnementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; statut?: string; nuits?: string }>;
}) {
  const user = await requireAccess(ADMIN_SUBSCRIPTIONS_PATH);
  const params = await searchParams;
  const page = journalPage(params.page);
  const active = isActiveFilter(params.statut);
  const nightsPage = journalPage(params.nuits);
  const now = new Date();
  const [{ rows, pages }, nights] = await Promise.all([
    readSubscriptions(page, active, now),
    readNightPasses(nightsPage, now),
  ]);
  const t = a.abonnements;
  const href = (n: number, actives = active, nightsN = nightsPage) =>
    listHref(ADMIN_SUBSCRIPTIONS_PATH, {
      statut: actives ? ACTIVE_FILTER : null,
      page: n > 1 ? String(n) : null,
      nuits: nightsN > 1 ? String(nightsN) : null,
    });

  return (
    <AdminShell user={user} title={t.titre} current="abonnements">
      <FilterLinks
        label={t.filtres.libelle}
        options={[
          { label: t.filtres.tous, href: href(1, false), current: !active },
          { label: t.filtres.actifs, href: href(1, true), current: active },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState icon={CoeursIcon} text={active ? t.videActifs : t.vide} />
      ) : (
        <SubscriptionsTable rows={rows} />
      )}
      <Pager page={page} pages={pages} href={(n) => href(n)} />
      <h2 className="font-display text-h3 text-sauge">{t.nuits.titre}</h2>
      {nights.rows.length === 0 ? (
        <EmptyState icon={LuneIcon} text={t.nuits.vide} />
      ) : (
        <NightPassesTable rows={nights.rows} />
      )}
      <Pager page={nightsPage} pages={nights.pages} href={(n) => href(page, active, n)} />
    </AdminShell>
  );
}
