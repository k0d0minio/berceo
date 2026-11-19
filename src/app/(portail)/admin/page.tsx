import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { listHref } from "@/components/admin/list-controls";
import { admin } from "@/content/admin";
import { comptes } from "@/content/comptes";
import { fill, words } from "@/content/locale";
import { ADMIN_SUBSCRIPTIONS_PATH } from "@/lib/abonnements/paths";
import { ACTIVE_FILTER } from "@/lib/abonnements/rules";
import { activeSubscriptionCount } from "@/lib/abonnements/subscriptions";
import { bookingCount, reportCount } from "@/lib/admin/lists";
import { ADMIN_BOOKINGS_PATH, ADMIN_FILES_PATH, ADMIN_REPORTS_PATH } from "@/lib/admin/paths";
import { loadQueue } from "@/lib/admin/review";
import { RECENT_PERIOD, recentPaymentCutoff } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { liveCreditSummary } from "@/lib/credits/credits";
import { ADMIN_CREDITS_PATH } from "@/lib/credits/paths";
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths";
import { awaitingRefundCount, paymentCountSince } from "@/lib/paiements/payments";
import { eurosFromCents, TO_REFUND } from "@/lib/paiements/rules";

const a = words(admin);

export const metadata: Metadata = {
  title: words(comptes).espaces.admin.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Vue d'ensemble » (the guide, « Le backoffice »; back-office-admin, D-133):
 * four blocks, each a number and a link to the full list, and a fifth, the
 * active subscriptions (abonnements-back-office), and a sixth, the Berceo
 * credit rows that can still pay, and what they can pay in all
 * (annulations-back-office). Each number is
 * counted by the same condition its list filters on, so the two never
 * disagree. The payments block also names the fees still owed after a
 * professional's cancellation, only when there are some, linking to the
 * « À rembourser » filter that lists them (D-164). Anyone but an admin,
 * signed in or not, gets a 404 (D-33).
 */
export default async function AdminPage() {
  const user = await requireAccess(SPACES.admin);
  const now = new Date();

  const [queue, bookings, reports, payments, toRefund, subscriptions, live] = await Promise.all([
    loadQueue(),
    bookingCount("en-cours"),
    reportCount(),
    paymentCountSince(recentPaymentCutoff(now)),
    awaitingRefundCount(),
    activeSubscriptionCount(now),
    liveCreditSummary(now),
  ]);

  const blocks = [
    { key: "dossiers", n: queue.length, href: ADMIN_FILES_PATH },
    { key: "reservations", n: bookings, href: listHref(ADMIN_BOOKINGS_PATH, { etat: "en-cours" }) },
    { key: "signalements", n: reports, href: ADMIN_REPORTS_PATH },
    { key: "paiements", n: payments, href: listHref(ADMIN_PAYMENTS_PATH, { periode: RECENT_PERIOD }) },
    { key: "abonnements", n: subscriptions, href: listHref(ADMIN_SUBSCRIPTIONS_PATH, { statut: ACTIVE_FILTER }) },
    { key: "creditsBerceo", n: live.count, href: ADMIN_CREDITS_PATH },
  ] as const;

  return (
    <AdminShell user={user} title={a.vueEnsemble.titre} current="vueEnsemble">
      <ul className="grid gap-6 sm:grid-cols-2">
        {blocks.map((block) => (
          <li
            key={block.key}
            className="flex flex-col gap-3 rounded-carte border border-solid border-perle bg-blanc p-8"
          >
            <h2 className="font-display text-h3 text-encre-sauge">{a.vueEnsemble.blocs[block.key]}</h2>
            <p className="font-display text-h1 text-encre-sauge">{block.n}</p>
            <p className="text-corps text-encre-taupe">{a.vueEnsemble.precisions[block.key]}</p>
            <Link
              href={block.href}
              className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4"
            >
              {a.vueEnsemble.voir}
              <span className="sr-only">{` : ${a.vueEnsemble.blocs[block.key]}`}</span>
            </Link>
            {block.key === "paiements" && toRefund > 0 ? (
              <Link
                href={listHref(ADMIN_PAYMENTS_PATH, { statut: TO_REFUND })}
                className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4"
              >
                {fill(a.vueEnsemble.aRembourser, { n: String(toRefund) })}
              </Link>
            ) : null}
            {block.key === "creditsBerceo" ? (
              <p className="text-corps font-semibold text-encre-taupe">
                {fill(a.vueEnsemble.resteCredits, { montant: eurosFromCents(live.remainingCents) })}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
