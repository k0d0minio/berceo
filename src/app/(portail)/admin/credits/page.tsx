import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { CreditTable } from "@/components/admin/credit-table";
import { listHref, Pager } from "@/components/admin/list-controls";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { journalPage } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { adminCredits, liveCreditSummary } from "@/lib/credits/credits";
import { ADMIN_CREDITS_PATH } from "@/lib/credits/paths";
import { eurosFromCents } from "@/lib/paiements/rules";

const a = words(admin);

export const metadata: Metadata = {
  title: a.creditsBerceo.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Crédits » (annulations-back-office): every Berceo credit, newest first,
 * 50 a page, under one line that counts the ones that can still pay and what
 * they can pay in all, read by the same condition as the overview's block
 * (D-133). Read-only: a credit is never edited or deleted here. A 404 to
 * anyone but an admin (D-33).
 */
export default async function AdminCreditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireAccess(ADMIN_CREDITS_PATH);
  const params = await searchParams;
  const page = journalPage(params.page);
  const now = new Date();
  const [{ rows, pages }, live] = await Promise.all([adminCredits(page, now), liveCreditSummary(now)]);
  const t = a.creditsBerceo;

  return (
    <AdminShell user={user} title={t.titre} current="creditsBerceo">
      <p className="max-w-3xl text-corps text-taupe">{t.intro}</p>
      <p className="text-corps font-semibold text-taupe">
        {fill(t.resume, { n: String(live.count), montant: eurosFromCents(live.remainingCents) })}
      </p>
      {rows.length === 0 ? <p className="text-corps text-taupe">{t.vide}</p> : <CreditTable rows={rows} />}
      <Pager page={page} pages={pages} href={(n) => listHref(ADMIN_CREDITS_PATH, { page: n > 1 ? String(n) : null })} />
    </AdminShell>
  );
}
