import type { Metadata } from "next";
import Link from "next/link";

import { GardeStateMark } from "@/components/gardes/garde-state";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { SpaceShell } from "@/components/shell/space-shell";
import { avis } from "@/content/avis";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { familyRatingPath } from "@/lib/avis/paths";
import { ratingsGiven } from "@/lib/avis/ratings";
import { canRate } from "@/lib/avis/rules";
import { cardTitle, nightLine } from "@/lib/demandes/format";
import { hasNightStarted } from "@/lib/demandes/rules";
import { gardeState } from "@/lib/gardes/rules";
import { familyBookings, type FamilyBooking } from "@/lib/reservations/bookings";
import { professionLabel } from "@/lib/reservations/format";
import { FAMILY_BOOKINGS_PATH, familyBookingPath, priorityPath } from "@/lib/reservations/paths";

const t = words(reservations);

export const metadata: Metadata = {
  title: t.meta.reservations,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const link = "w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4";

function List({
  title,
  items,
  rated,
  now,
}: {
  title: string;
  items: FamilyBooking[];
  rated: Set<string>;
  now: Date;
}) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-h2 text-encre-sauge">{title}</h2>
      <ul className="grid max-w-4xl gap-6 md:grid-cols-2">
        {items.map(({ id, request, professional, garde }) => (
          <li key={id}>
            <article className="flex flex-col gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
              <GardeStateMark
                state={gardeState({ status: garde.status, nightDate: request.nightDate, startTime: request.startTime }, now)}
              />
              <div className="flex items-center gap-4">
                <ProfessionalPhoto photoId={professional.photoId} prenom={professional.firstName} className="size-14" />
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-h3 text-encre-sauge uppercase">{professional.firstName}</h3>
                  <p className="text-corps text-encre-taupe">{professionLabel(professional.profession)}</p>
                </div>
              </div>
              <p className="text-corps text-encre-taupe">{cardTitle(request.communeIns, request.locality)}</p>
              <p className="text-corps font-semibold text-encre-taupe">{nightLine(request.nightDate, request.startTime)}</p>
              <Link href={familyBookingPath(id)} className={link}>
                {t.reservationsFamille.voir}
              </Link>
              {canRate({ status: garde.status, nightDate: request.nightDate, startTime: request.startTime }, rated.has(id), now) ? (
                <Link href={familyRatingPath(id)} className={link}>
                  {words(avis).lien}
                </Link>
              ) : null}
              <Link href={priorityPath(professional.profileId)} className={link}>
                {t.reservationsFamille.recontacter}
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

/*
 * « Mes réservations »: her bookings, coming nights first by date, then past
 * ones, latest first, each with its state (D-109). This is where she finds the professionals she already
 * booked and sends them a new request in priority (cahier des charges D-07,
 * « Contact récurrent »), and « Laisser un avis » on a terminée garde she has
 * not rated, for 14 days (avis-etoiles, D-117).
 */
export default async function ReservationsPage() {
  const user = await requireAccess(FAMILY_BOOKINGS_PATH);
  const now = new Date();
  const all = await familyBookings(user.id);
  const started = (b: FamilyBooking) => hasNightStarted(b.request.nightDate, b.request.startTime, now);
  const coming = all.filter((b) => !started(b));
  const past = all.filter(started).reverse();
  const rated = new Set((await ratingsGiven("famille", past.map((b) => b.id))).keys());

  return (
    <SpaceShell user={user} title={t.reservationsFamille.titre}>
      <p className="max-w-2xl text-intro text-encre-taupe">{t.reservationsFamille.intro}</p>
      {all.length === 0 ? <p className="max-w-2xl text-corps text-encre-taupe">{t.reservationsFamille.vide}</p> : null}
      <List title={t.reservationsFamille.aVenir} items={coming} rated={rated} now={now} />
      <List title={t.reservationsFamille.passees} items={past} rated={rated} now={now} />
    </SpaceShell>
  );
}
