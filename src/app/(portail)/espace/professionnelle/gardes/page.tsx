import type { Metadata } from "next";
import Link from "next/link";

import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { hasNightStarted } from "@/lib/demandes/rules";
import { professionalBookings, type ProfessionalBooking } from "@/lib/reservations/bookings";
import { PROFESSIONAL_BOOKINGS_PATH, professionalBookingPath } from "@/lib/reservations/paths";

const t = words(reservations);

export const metadata: Metadata = {
  title: t.meta.gardes,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function List({ title, items }: { title: string; items: ProfessionalBooking[] }) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-h2 text-sauge">{title}</h2>
      <ul className="grid max-w-4xl gap-6 md:grid-cols-2">
        {items.map((booking) => (
          <li key={booking.id}>
            <RequestCard
              request={booking.request}
              rate={booking.nightRateEur}
              footer={
                <Link
                  href={professionalBookingPath(booking.id)}
                  className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
                >
                  {t.gardes.voir}
                </Link>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/*
 * « Mes gardes »: her bookings, coming nights first by date, then past ones,
 * latest first. The card is the night, the commune and the children; the
 * family's name, address and phone wait on each garde's own page (D-15, D-72).
 */
export default async function GardesPage() {
  const user = await requireAccess(PROFESSIONAL_BOOKINGS_PATH);
  const now = new Date();
  const all = await professionalBookings(user.id);
  const started = (b: ProfessionalBooking) => hasNightStarted(b.request.nightDate, b.request.startTime, now);
  const coming = all.filter((b) => !started(b));
  const past = all.filter(started).reverse();

  return (
    <SpaceShell user={user} title={t.gardes.titre}>
      <p className="max-w-2xl text-intro text-taupe">{t.gardes.intro}</p>
      {all.length === 0 ? <p className="max-w-2xl text-corps text-taupe">{t.gardes.vide}</p> : null}
      <List title={t.gardes.aVenir} items={coming} />
      <List title={t.gardes.passees} items={past} />
    </SpaceShell>
  );
}
