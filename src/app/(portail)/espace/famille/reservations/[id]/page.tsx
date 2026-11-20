import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { FormMessage } from "@/components/auth/field";
import { criteriaLabels } from "@/components/avis/criteria";
import { GivenRating } from "@/components/avis/stars";
import { CancelGarde, ContestAbsence, ReportAbsence, RepublishGarde } from "@/components/gardes/garde-dialogs";
import { GardeStateMark } from "@/components/gardes/garde-state";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { avis } from "@/content/avis";
import { gardes } from "@/content/gardes";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { paiement } from "@/content/paiement";
import { reservations } from "@/content/reservations";
import { familyMay } from "@/lib/abonnements/rules";
import { isSubscribed } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { familyRatingPath } from "@/lib/avis/paths";
import { ratingsGiven } from "@/lib/avis/ratings";
import { canRate } from "@/lib/avis/rules";
import { gardeCredits } from "@/lib/credits/credits";
import { conversationOfBooking } from "@/lib/messagerie/conversations";
import { conversationPath } from "@/lib/messagerie/paths";
import { cardTitle, childrenLine, feedingLine, formatDate } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";
import { familyRequestPath } from "@/lib/demandes/paths";
import { liveRequestOn } from "@/lib/demandes/requests";
import { gardeFee } from "@/lib/gardes/gardes";
import { eurosFromCents } from "@/lib/paiements/rules";
import { cancelledLine, disputeLine, feeText, reasonLine } from "@/lib/gardes/format";
import {
  canCancel,
  canContest,
  canReportAbsence,
  canRepublish,
  gardeState,
  isLateCancellation,
} from "@/lib/gardes/rules";
import { familyBooking } from "@/lib/reservations/bookings";
import { extraHourLine, professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import { cancellationDelayHours } from "@/lib/settings";
import {
  FAMILY_BOOKINGS_PATH,
  familyBookingPath,
  priorityPath,
  professionalProfilePath,
} from "@/lib/reservations/paths";

import { cancelGardeAction, contestAbsenceAction, reportAbsenceAction, republishGardeAction } from "../actions";

const t = words(reservations);
const m = words(messagerie);
const g = words(gardes);

type Notice = { confirmee?: string; annulee?: string; absence?: string; contestation?: string; erreur?: string };

/** The line a redirect back here asks for: after a payment, a cancellation, a report, a contest, or a refusal. */
function noticeText(notice: Notice, prenom: string): string | null {
  if (notice.confirmee === "1") return fill(t.reservationsFamille.confirmee, { prenom });
  if (notice.annulee === "1") return g.annulation.faite;
  if (notice.absence === "1") return g.absence.faite;
  if (notice.contestation === "1") return g.contestation.faite;
  const erreur = notice.erreur;
  if (
    erreur === "annulation" ||
    erreur === "absence" ||
    erreur === "contestation" ||
    erreur === "republication" ||
    erreur === "generique"
  ) {
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
 * insurance line, D-8): the date, the hours, the duration, the children and
 * their feeding (demande-enfants-alimentation), the professional's
 * first name and profession, the booked rate, the line saying the family pays
 * her directly (D-1), and her phone (D-72), never her surname. From here the
 * family opens her profile or sends her a new request in priority. Another
 * family's booking, like an unknown one, is not found.
 *
 * The garde's life (cycle-de-garde-et-annulation): its state (D-109);
 * « Annuler la garde » until the start hour (D-105), its dialog saying what the
 * founders' table does with her fee at this moment (annulations-table);
 * « Signaler une absence » from it until 24 hours after the night (D-106);
 * « Contester ce signalement » for 24 hours after the professional reported
 * her absent; once cancelled, who and when, the litige, the fee line (D-2: the
 * credit, the fee kept, the litige or the refund), and « Republier ma
 * demande » until the night starts, or a link to her live request that night
 * (D-107). The récapitulatif names the fee and the part her Berceo credit
 * paid (credits-au-paiement).
 *
 * The rating (avis-etoiles): « Laisser un avis » while she may rate it, then
 * the stars she gave, never the professional's rating of her (D-117).
 *
 * Without a subscription (abonnements-acces) the garde stays whole: the
 * phone, cancelling, the absence, the conversation and the rating. Only
 * « Republier ma demande » publishes, and the invitation line takes its
 * place. The profile and the priority links lead to pages that show the line.
 *
 * The récapitulatif and her rating are white cards on the pearl page (JAM-327).
 */
export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Notice>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireAccess(withQuery(familyBookingPath(id), query));
  const booking = await familyBooking(user.id, id);
  if (!booking) notFound();

  const { request, professional } = booking;
  const conversationId = await conversationOfBooking(user.id, "famille", id);
  const night = recapNight(request.nightDate, request.startTime, request.extraHours);
  const l = t.recapitulatif.libelles;
  const rows: [string, string][] = [
    [l.date, night.date],
    [l.heure, night.heures],
    [l.duree, night.duree],
    [l.enfants, childrenLine(request.childAges)],
    // A request published before the field has no feeding.
    ...(request.feedings.length > 0 ? [[l.alimentation, feedingLine(request.feedings)] as [string, string]] : []),
    [l.professionnelle, professional.firstName],
    [l.profession, professionLabel(professional.profession)],
    [l.tarif, rateLine(booking.nightRateEur)],
    // A booking made before profil-tarifs carries no extra hour's rate.
    ...(booking.extraHourRateEur ? [[l.tarifHeure, extraHourLine(booking.extraHourRateEur)] as [string, string]] : []),
  ];
  const notice = noticeText(query, professional.firstName);
  const now = new Date();
  const facts = { ...request, status: booking.garde.status };
  const state = gardeState(facts, now);
  const republishable = canRepublish(facts, now);
  const cancellable = canCancel(facts, now);
  const ended = booking.garde.status === "annulee";
  const [fee, liveCredit, delay, liveRequest, given, subscribed] = await Promise.all([
    // The fee and its credit part show on the récapitulatif (credits-au-paiement); once cancelled, its fate too.
    gardeFee(booking.id),
    ended ? gardeCredits([booking.id]) : Promise.resolve(null),
    cancellable ? cancellationDelayHours() : Promise.resolve(null),
    republishable ? liveRequestOn(user.id, request.nightDate) : Promise.resolve(null),
    ratingsGiven("famille", [booking.id]),
    isSubscribed(user.id, now),
  ]);
  const mayRepublish = familyMay("publier", { subscribed });
  const myRating = given.get(booking.id) ?? null;
  const cancelled = cancelledLine(booking.garde, "famille", professional.firstName);
  const reason = reasonLine(booking.garde);
  const dispute = disputeLine(booking.garde);
  const feeLine = feeText(booking.garde, ended ? (fee?.status ?? null) : null, liveCredit?.get(booking.id) ?? null, "famille");
  const p = words(paiement).recapitulatif;
  const euros = (cents: number) => fill(p.montant, { montant: eurosFromCents(cents) });
  // A booking made before the fee existed has none, and no line.
  const feeRows: [string, string][] = fee
    ? [
        [p.frais, euros(fee.amountCents)],
        ...(fee.creditCents > 0 ? [[p.credit, euros(fee.creditCents)] as [string, string]] : []),
      ]
    : [];
  // Within the founders' delay her fee stays at Berceo; before it, it becomes a credit (annulations-table).
  const cancelDescription =
    delay !== null && isLateCancellation(facts, now, delay)
      ? fill(g.annulation.descriptionFamilleTardive, { prenom: professional.firstName, heures: String(delay) })
      : fill(g.annulation.descriptionFamille, { prenom: professional.firstName });

  return (
    <SpaceShell user={user} title={t.recapitulatif.titre}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      <article className="flex max-w-2xl flex-col gap-6 rounded-carte bg-blanc px-6 py-8 md:px-10">
        <GardeStateMark state={state} />
        <div className="flex items-center gap-4">
          <ProfessionalPhoto photoId={professional.photoId} prenom={professional.firstName} className="size-16" />
          <h2 className="text-h3 font-bold text-sauge">
            {cardTitle(request.communeIns, request.locality)}
          </h2>
        </div>
        <dl className="flex flex-col gap-3">
          {[...rows, ...feeRows].map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-x-4">
              <dt className="text-corps font-semibold text-taupe">{label}</dt>
              <dd className="text-corps text-taupe">{value}</dd>
            </div>
          ))}
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="text-corps font-semibold text-taupe">{l.telephone}</dt>
            <dd className="text-corps text-taupe">
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
        <p className="text-corps text-taupe">{t.recapitulatif.paiement}</p>
        {cancelled ? <p className="text-corps font-semibold text-taupe">{cancelled}</p> : null}
        {reason ? <p className="text-corps text-taupe">{reason}</p> : null}
        {dispute ? <p className="text-corps font-semibold text-taupe">{dispute}</p> : null}
        {feeLine ? <p className="text-corps text-taupe">{feeLine}</p> : null}
      </article>
      {myRating ? (
        <GivenRating
          labels={criteriaLabels("famille")}
          scores={myRating.scores}
          date={formatDate(brusselsNow(myRating.createdAt).date)}
          className="max-w-2xl rounded-carte bg-blanc px-6 py-8 md:px-10"
        />
      ) : null}
      {republishable && !liveRequest && !mayRepublish ? <SubscriptionRequired /> : null}
      <div className="flex flex-wrap gap-3">
        {canRate(facts, myRating !== null, now) ? (
          <Button asChild>
            <Link href={familyRatingPath(booking.id)}>{words(avis).lien}</Link>
          </Button>
        ) : null}
        {republishable ? (
          liveRequest ? (
            <Button asChild>
              <Link href={familyRequestPath(liveRequest)}>{g.republication.dejaOuverte}</Link>
            </Button>
          ) : mayRepublish ? (
            <RepublishGarde onRepublish={republishGardeAction.bind(null, booking.id)} />
          ) : null
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
        {cancellable ? (
          <CancelGarde
            side="famille"
            description={cancelDescription}
            onCancel={cancelGardeAction.bind(null, booking.id)}
          />
        ) : null}
        {canReportAbsence(facts, now) ? (
          <ReportAbsence
            description={fill(g.absence.descriptionFamille, { prenom: professional.firstName })}
            onReport={reportAbsenceAction.bind(null, booking.id)}
          />
        ) : null}
        {canContest(booking.garde, "famille", now) ? (
          <ContestAbsence onContest={contestAbsenceAction.bind(null, booking.id)} />
        ) : null}
      </div>
    </SpaceShell>
  );
}
