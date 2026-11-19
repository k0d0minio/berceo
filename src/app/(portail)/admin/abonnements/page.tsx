import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { SubscriptionsTable } from "@/components/admin/subscriptions-table";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { ADMIN_SUBSCRIPTIONS_PATH } from "@/lib/abonnements/paths";
import { ACTIVE_FILTER, isActiveFilter } from "@/lib/abonnements/rules";
import { readSubscriptions } from "@/lib/abonnements/subscriptions";
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
 * actifs » counts exactly those (D-133). Read-only: Stripe changes a
 * subscription. A 404 to anyone but an admin (D-33).
 */
export default async function AbonnementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; statut?: string }>;
}) {
  const user = await requireAccess(ADMIN_SUBSCRIPTIONS_PATH);
  const params = await searchParams;
  const page = journalPage(params.page);
  const active = isActiveFilter(params.statut);
  const { rows, pages } = await readSubscriptions(page, active, new Date());
  const t = a.abonnements;
  const href = (n: number, actives = active) =>
    listHref(ADMIN_SUBSCRIPTIONS_PATH, {
      statut: actives ? ACTIVE_FILTER : null,
      page: n > 1 ? String(n) : null,
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
        <p className="text-corps text-taupe">{active ? t.videActifs : t.vide}</p>
      ) : (
        <SubscriptionsTable rows={rows} />
      )}
      <Pager page={page} pages={pages} href={(n) => href(n)} />
    </AdminShell>
  );
}
