import type { Metadata } from "next";
import Link from "next/link";
import type * as React from "react";

import { BebeIcon, CalendrierIcon, LieuIcon, LuneIcon, type IconComponent } from "@/components/berceo-icons";
import { CreditsBlock } from "@/components/credits/credits-block";
import { GardeStateMark } from "@/components/gardes/garde-state";
import { EuroIcon } from "@/components/icons";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/empty-state";
import { avis } from "@/content/avis";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { familyRatingPath } from "@/lib/avis/paths";
import { ratingsGiven } from "@/lib/avis/ratings";
import { canRate } from "@/lib/avis/rules";
import { familyCredits } from "@/lib/credits/credits";
import { cardTitle, childrenLine, nightLine, placeLine } from "@/lib/demandes/format";
import { hasNightStarted } from "@/lib/demandes/rules";
import { gardeState } from "@/lib/gardes/rules";
import { familyBookings, type FamilyBooking } from "@/lib/reservations/bookings";
import { agreedStartLine, professionLabel, rateLine } from "@/lib/reservations/format";
import { FAMILY_BOOKINGS_PATH, familyBookingPath, priorityPath } from "@/lib/reservations/paths";

const t = words(reservations);

export const metadata: Metadata = {
  title: t.meta.reservations,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const link = "w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4";

/** One fact of a booking card: an icon of 24 px in taupe, then its line, as the request card does. */
function Fact({ icon: Icon, children }: { icon: IconComponent; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-corps">
      <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-taupe" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/*
 * A booking in the list follows the deck's request card (slide 25; JAM-327):
 * a white card on a sage zone, the title in taupe capitals, the facts as lines
 * with one of Surya's icons, and one filled sage button. The professional and
 * the two other ways out stay under the facts as they were.
 */
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
      <h2 className="font-display text-h2 text-sauge">{title}</h2>
      <CardField className="max-w-4xl">
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map(({ id, request, professional, garde, nightRateEur }) => (
            <li key={id}>
              <article className="flex h-full flex-col gap-4 rounded-carte bg-blanc px-6 py-8 text-taupe md:px-10">
                <GardeStateMark state={gardeState({ ...request, status: garde.status }, now)} />
                <h3 className="font-display text-intro text-balance text-taupe">
                  {cardTitle(request.communeIns, request.locality)}
                </h3>
                <div className="flex items-center gap-4">
                  <ProfessionalPhoto photoId={professional.photoId} prenom={professional.firstName} className="size-14" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-corps font-bold break-words text-sauge">{professional.firstName}</p>
                    <p className="text-corps text-taupe">{professionLabel(professional.profession)}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-3">
                  <Fact icon={LieuIcon}>{placeLine(request.postcode, request.locality)}</Fact>
                  <Fact icon={CalendrierIcon}>
                    <span className="font-semibold">
                      {nightLine(request.nightDate, request.startTime, request.extraHours)}
                    </span>
                    {/* Booked at a start the professional proposed (JAM-306). */}
                    {agreedStartLine(request) ? (
                      <span className="block text-legende">{agreedStartLine(request)}</span>
                    ) : null}
                  </Fact>
                  <Fact icon={BebeIcon}>
                    {childrenLine(request.childAges)}
                  </Fact>
                  <Fact icon={EuroIcon}>
                    <span className="font-semibold text-sauge">{rateLine(nightRateEur)}</span>
                  </Fact>
                </ul>
                {canRate({ ...request, status: garde.status }, rated.has(id), now) ? (
                  <Link href={familyRatingPath(id)} className={link}>
                    {words(avis).lien}
                  </Link>
                ) : null}
                <Link href={priorityPath(professional.profileId)} className={link}>
                  {t.reservationsFamille.recontacter}
                </Link>
                <Button asChild variant="sauge" className="mt-auto self-start">
                  <Link href={familyBookingPath(id)}>{t.reservationsFamille.voir}</Link>
                </Button>
              </article>
            </li>
          ))}
        </ul>
      </CardField>
    </section>
  );
}

/*
 * « Mes réservations »: her bookings, coming nights first by date, then past
 * ones, latest first, each with its state (D-109). This is where she finds the professionals she already
 * booked and sends them a new request in priority (cahier des charges D-07,
 * « Contact récurrent »), and « Laisser un avis » on a terminée garde she has
 * not rated, for 14 days (avis-etoiles, D-117). « Mes crédits » under the
 * intro shows her balance and each Berceo credit with its expiry (credits-registre).
 */
export default async function ReservationsPage() {
  const user = await requireAccess(FAMILY_BOOKINGS_PATH);
  const now = new Date();
  const [all, wallet] = await Promise.all([familyBookings(user.id), familyCredits(user.id, now)]);
  const started = (b: FamilyBooking) => hasNightStarted(b.request.nightDate, b.request.startTime, now);
  const coming = all.filter((b) => !started(b));
  const past = all.filter(started).reverse();
  const rated = new Set((await ratingsGiven("famille", past.map((b) => b.id))).keys());

  return (
    <SpaceShell user={user} title={t.reservationsFamille.titre}>
      <p className="max-w-2xl text-intro text-taupe">{t.reservationsFamille.intro}</p>
      <CreditsBlock list={wallet.list} balanceCents={wallet.balanceCents} />
      {all.length === 0 ? <EmptyState icon={LuneIcon} text={t.reservationsFamille.vide} /> : null}
      <List title={t.reservationsFamille.aVenir} items={coming} rated={rated} now={now} />
      <List title={t.reservationsFamille.passees} items={past} rated={rated} now={now} />
    </SpaceShell>
  );
}
