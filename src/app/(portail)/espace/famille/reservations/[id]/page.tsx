import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { conversationOfBooking } from "@/lib/messagerie/conversations";
import { conversationPath } from "@/lib/messagerie/paths";
import { cardTitle } from "@/lib/demandes/format";
import { familyBooking } from "@/lib/reservations/bookings";
import { professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import {
  FAMILY_BOOKINGS_PATH,
  familyBookingPath,
  priorityPath,
  professionalProfilePath,
} from "@/lib/reservations/paths";

const t = words(reservations);
const m = words(messagerie);

export const metadata: Metadata = {
  title: t.meta.reservation,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Récapitulatif de votre garde » (the guide, « La réservation », without its
 * insurance line, D-8): the date, the hours, the duration, the professional's
 * first name and profession, the booked rate, the line saying the family pays
 * her directly (D-1), and her phone (D-72), never her surname. From here the
 * family opens her profile or sends her a new request in priority. Another
 * family's booking, like an unknown one, is not found.
 */
export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmee?: string }>;
}) {
  const { id } = await params;
  const user = await requireAccess(familyBookingPath(id));
  const booking = await familyBooking(user.id, id);
  if (!booking) notFound();

  const { request, professional } = booking;
  const conversationId = await conversationOfBooking(user.id, "famille", id);
  const night = recapNight(request.nightDate, request.startTime);
  const l = t.recapitulatif.libelles;
  const rows: [string, string][] = [
    [l.date, night.date],
    [l.heure, night.heures],
    [l.duree, night.duree],
    [l.professionnelle, professional.firstName],
    [l.profession, professionLabel(professional.profession)],
    [l.tarif, rateLine(booking.nightRateEur)],
  ];
  const confirmed = (await searchParams).confirmee === "1";

  return (
    <SpaceShell user={user} title={t.recapitulatif.titre}>
      {confirmed ? (
        <FormMessage>{fill(t.reservationsFamille.confirmee, { prenom: professional.firstName })}</FormMessage>
      ) : null}
      <article className="flex max-w-2xl flex-col gap-6 rounded-carte bg-perle px-6 py-8 md:px-10">
        <div className="flex items-center gap-4">
          <ProfessionalPhoto photoId={professional.photoId} prenom={professional.firstName} className="size-16" />
          <h2 className="font-display text-h3 text-encre-sauge uppercase">
            {cardTitle(request.communeIns, request.locality)}
          </h2>
        </div>
        <dl className="flex flex-col gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-x-4">
              <dt className="text-corps font-semibold text-encre-taupe">{label}</dt>
              <dd className="text-corps text-encre-taupe">{value}</dd>
            </div>
          ))}
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="text-corps font-semibold text-encre-taupe">{l.telephone}</dt>
            <dd className="text-corps text-encre-taupe">
              {booking.phone ? (
                <a href={`tel:${booking.phone}`} className="underline underline-offset-4">
                  {booking.phone}
                </a>
              ) : (
                t.gardes.nonRenseigne
              )}
            </dd>
          </div>
        </dl>
        <p className="text-corps text-encre-taupe">{t.recapitulatif.paiement}</p>
      </article>
      <div className="flex flex-wrap gap-3">
        {conversationId ? (
          <Button asChild>
            <Link href={conversationPath("famille", conversationId)} prefetch={false}>
              {fill(m.liens.ecrire, { prenom: professional.firstName })}
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="raye">
          <Link href={professionalProfilePath(professional.profileId)}>{t.famille.voirProfil}</Link>
        </Button>
        <Button asChild variant="raye">
          <Link href={priorityPath(professional.profileId)}>{t.reservationsFamille.recontacter}</Link>
        </Button>
        <Button asChild variant="raye">
          <Link href={FAMILY_BOOKINGS_PATH}>{t.reservationsFamille.retour}</Link>
        </Button>
      </div>
    </SpaceShell>
  );
}
