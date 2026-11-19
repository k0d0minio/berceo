import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { PromoCodeForm } from "@/components/admin/promo-code-form";
import { PromoCodesTable } from "@/components/admin/promo-codes-table";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { ADMIN_PROMO_CODES_PATH } from "@/lib/abonnements/paths";
import { listPromoCodes } from "@/lib/abonnements/promo-codes";
import { requireAccess } from "@/lib/auth/guard";

const a = words(admin);

export const metadata: Metadata = {
  title: a.codesPromo.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Codes promo » (JAM-304, the answer Q3): the form that makes a code, then
 * every code read from Stripe, the active ones first, each with its discount,
 * its end, its uses and « Désactiver ». Stripe keeps the codes; Berceo keeps
 * none. A 404 to anyone but an admin (D-33).
 */
export default async function CodesPromoPage() {
  const user = await requireAccess(ADMIN_PROMO_CODES_PATH);
  const rows = await listPromoCodes();
  const t = a.codesPromo;

  return (
    <AdminShell user={user} title={t.titre} current="codesPromo">
      <p className="max-w-2xl text-corps text-taupe">{t.intro}</p>
      <PromoCodeForm />
      {rows === null ? (
        <p role="status" className="text-corps text-taupe">{t.illisible}</p>
      ) : rows.length === 0 ? (
        <p className="text-corps text-taupe">{t.vide}</p>
      ) : (
        <PromoCodesTable rows={rows} />
      )}
    </AdminShell>
  );
}
