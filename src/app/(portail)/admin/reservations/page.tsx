import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { BookingsTable } from "@/components/admin/bookings-table";
import { FilterLinks, listHref, Pager } from "@/components/admin/list-controls";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { db, users } from "@/db";
import { fullName } from "@/lib/admin/journal";
import { readBookings } from "@/lib/admin/lists";
import { ADMIN_BOOKINGS_PATH } from "@/lib/admin/paths";
import { BOOKING_FILTERS, accountParam, bookingFilter, journalPage } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";

const a = words(admin);

export const metadata: Metadata = {
  title: a.reservations.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * Every booking (back-office-admin), the nearest night first, 50 a page,
 * filtered by the garde's state by the clock: « En cours » is the overview's
 * « Réservations en cours », à venir and under way (D-133); from an account's
 * page, by account on either side (`?compte=`). Read-only. A 404 to anyone
 * but an admin (D-33).
 */
export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ etat?: string; compte?: string; page?: string }>;
}) {
  const user = await requireAccess(ADMIN_BOOKINGS_PATH);
  const params = await searchParams;
  const etat = bookingFilter(params.etat);
  const compte = accountParam(params.compte);
  const page = journalPage(params.page);

  const [{ rows, pages }, [account]] = await Promise.all([
    readBookings(etat, compte, page, new Date()),
    compte
      ? db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, compte)).limit(1)
      : Promise.resolve([]),
  ]);
  const t = a.reservations;
  const href = (next: { etat?: string | null; page?: number }) =>
    listHref(ADMIN_BOOKINGS_PATH, {
      etat: next.etat === undefined ? etat : next.etat,
      compte,
      page: next.page && next.page > 1 ? String(next.page) : null,
    });

  return (
    <AdminShell user={user} title={t.titre} current="reservations">
      {account ? (
        <div className="flex flex-wrap items-center gap-6">
          <p className="text-corps font-semibold text-encre-taupe">{fill(t.deCompte, { nom: fullName(account) })}</p>
          <Link
            href={listHref(ADMIN_BOOKINGS_PATH, { etat })}
            className="text-corps font-semibold text-encre-sauge underline underline-offset-4"
          >
            {t.toutesLesReservations}
          </Link>
        </div>
      ) : null}
      <FilterLinks
        label={t.colonnes.etat}
        options={[
          { label: t.filtres.toutes, href: href({ etat: null }), current: etat === null },
          ...BOOKING_FILTERS.map((filter) => ({
            label: t.filtres[filter],
            href: href({ etat: filter }),
            current: etat === filter,
          })),
        ]}
      />
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{t.vide}</p>
      ) : (
        <BookingsTable rows={rows} />
      )}
      <Pager page={page} pages={pages} href={(n) => href({ page: n })} />
    </AdminShell>
  );
}
