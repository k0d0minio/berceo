import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { CancelGarde, ReportAbsence, RepublishGarde } from "@/components/gardes/garde-dialogs";
import { GardeStateMark } from "@/components/gardes/garde-state";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { gardes } from "@/content/gardes";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { conversationOfBooking } from "@/lib/messagerie/conversations";
import { conversationPath } from "@/lib/messagerie/paths";
import { cardTitle } from "@/lib/demandes/format";
import { familyRequestPath } from "@/lib/demandes/paths";
import { openRequestOn } from "@/lib/demandes/requests";
import { gardeFee } from "@/lib/gardes/gardes";
import { cancelledLine, feeText } from "@/lib/gardes/format";
import { canCancel, canReportAbsence, canRepublish, gardeState } from "@/lib/gardes/rules";
import { familyBooking } from "@/lib/reservations/bookings";
import { professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import {
  FAMILY_BOOKINGS_PATH,
  familyBookingPath,
  priorityPath,
  professionalProfilePath,
} from "@/lib/reservations/paths";

import { cancelGardeAction, reportAbsenceAction, republishGardeAction } from "../actions";

const t = words(reservations);
const m = words(messagerie);
const g = words(gardes);

type Notice = { confirmee?: string; annulee?: string; absence?: string; erreur?: string };

/** The line a redirect back here asks for: after a payment, a cancellation, a report, or a refusal. */
function noticeText(notice: Notice, prenom: string): string | null {
  if (notice.confirmee === "1") return fill(t.reservationsFamille.confirmee, { prenom });
  if (notice.annulee === "1") return g.annulation.faite;
  if (notice.absence === "1") return g.absence.faite;
  const erreur = notice.erreur;
  if (erreur === "annulation" || erreur === "absence" || erreur === "republication" || erreur === "generique") {
    return g.erreurs[erreur];
  }
  return null;
}

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
 *
 * The garde's life (cycle-de-garde-et-annulation): its state (D-109);
 * « Annuler la garde » until the start hour (D-105); « Signaler une absence »
 * from it until 24 hours after the night (D-106); once cancelled, who and
 * when, the fee line (D-2), and « Republier ma demande » until the night
 * starts, or a link to her open request that night (D-107).
 */
export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Notice>;
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
  const notice = noticeText(await searchParams, professional.firstName);
  const now = new Date();
  const facts = { status: booking.garde.status, nightDate: request.nightDate, startTime: request.startTime };
  const state = gardeState(facts, now);
  const republishable = canRepublish(facts, now);
  const [fee, openRequest] = await Promise.all([
    booking.garde.status === "annulee" ? gardeFee(booking.id) : Promise.resolve(null),
    republishable ? openRequestOn(user.id, request.nightDate) : Promise.resolve(null),
  ]);
  const cancelled = cancelledLine(booking.garde, "famille", professional.firstName);
  const feeLine = feeText(booking.garde, fee?.status ?? null);

  return (
    <SpaceShell user={user} title={t.recapitulatif.titre}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      <article className="flex max-w-2xl flex-col gap-6 rounded-carte bg-perle px-6 py-8 md:px-10">
        <GardeStateMark state={state} />
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
        {cancelled ? <p className="text-corps font-semibold text-encre-taupe">{cancelled}</p> : null}
        {feeLine ? <p className="text-corps text-encre-taupe">{feeLine}</p> : null}
      </article>
      <div className="flex flex-wrap gap-3">
        {republishable ? (
          openRequest ? (
            <Button asChild>
              <Link href={familyRequestPath(openRequest)}>{g.republication.dejaOuverte}</Link>
            </Button>
          ) : (
            <RepublishGarde onRepublish={republishGardeAction.bind(null, booking.id)} />
          )
        ) : null}
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
        {canCancel(facts, now) ? (
          <CancelGarde
            description={fill(g.annulation.descriptionFamille, { prenom: professional.firstName })}
            onCancel={cancelGardeAction.bind(null, booking.id)}
          />
        ) : null}
        {canReportAbsence(facts, now) ? (
          <ReportAbsence
            description={fill(g.absence.descriptionFamille, { prenom: professional.firstName })}
            onReport={reportAbsenceAction.bind(null, booking.id)}
          />
        ) : null}
      </div>
    </SpaceShell>
  );
}
