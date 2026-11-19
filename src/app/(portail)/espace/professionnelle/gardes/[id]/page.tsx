import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { criteriaLabels } from "@/components/avis/criteria";
import { GivenRating, NoteDisplay } from "@/components/avis/stars";
import { RequestCard } from "@/components/demandes/request-card";
import { CancelGarde, ContestAbsence, ReportAbsence } from "@/components/gardes/garde-dialogs";
import { GardeStateMark } from "@/components/gardes/garde-state";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { avis } from "@/content/avis";
import { gardes } from "@/content/gardes";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { professionalRatingPath } from "@/lib/avis/paths";
import { familyNotesOfRequests, NO_NOTE, ratingsGiven } from "@/lib/avis/ratings";
import { canRate } from "@/lib/avis/rules";
import { gardeCredits } from "@/lib/credits/credits";
import { formatDate } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";
import { conversationOfBooking } from "@/lib/messagerie/conversations";
import { conversationPath } from "@/lib/messagerie/paths";
import { gardeFee } from "@/lib/gardes/gardes";
import { cancelledLine, disputeLine, feeText, reasonLine } from "@/lib/gardes/format";
import { canCancel, canContest, canReportAbsence, gardeState, isAddressVisible } from "@/lib/gardes/rules";
import { professionalBooking } from "@/lib/reservations/bookings";
import { recapNight } from "@/lib/reservations/format";
import { PROFESSIONAL_BOOKINGS_PATH, professionalBookingPath } from "@/lib/reservations/paths";

import { cancelGardeAction, contestAbsenceAction, reportAbsenceAction } from "../actions";

const t = words(reservations);
const m = words(messagerie);
const g = words(gardes);

type Notice = { annulee?: string; absence?: string; contestation?: string; erreur?: string };

/** The line a redirect back here asks for: after a cancellation, a report, a contest, or a refusal. */
function noticeText(notice: Notice): string | null {
  if (notice.annulee === "1") return g.annulation.faite;
  if (notice.absence === "1") return g.absence.faite;
  if (notice.contestation === "1") return g.contestation.faite;
  const erreur = notice.erreur;
  if (erreur === "annulation" || erreur === "absence" || erreur === "contestation" || erreur === "generique") {
    return g.erreurs[erreur];
  }
  return null;
}

export const metadata: Metadata = {
  title: t.meta.garde,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-legende font-semibold text-taupe">{label}</dt>
      <dd className="text-corps text-taupe">{children}</dd>
    </div>
  );
}

/*
 * One of her gardes: the night, the children, the booked rate, and, only here
 * and only on her own booking, the family's names, full address and phone
 * (D-15, D-72). The address is read live from the family's profile through
 * src/lib/famille/, only while the garde is confirmed and its night not
 * ended (D-110). Another professional's booking, like an unknown one, is not
 * found.
 *
 * The garde's life (cycle-de-garde-et-annulation): its state (D-109);
 * « Annuler la garde » until the start hour (D-105); « Signaler une absence »
 * from it until 24 hours after the night (D-106); « Contester ce signalement »
 * for 24 hours after the family reported her absent (annulations-table); once
 * cancelled, who and when, the litige, and what became of the family's fee
 * (the credit, the fee kept, the litige or the refund).
 *
 * The ratings (avis-etoiles): the family's note beside her name (D-118);
 * « Laisser un avis » while she may rate it, then the stars she gave, never
 * the family's rating of her (D-117).
 */
export default async function GardePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Notice>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireAccess(withQuery(professionalBookingPath(id), query));
  const booking = await professionalBooking(user.id, id);
  if (!booking) notFound();

  const { family } = booking;
  const conversationId = await conversationOfBooking(user.id, "professionnelle", id);
  const address = family.address;
  const notice = noticeText(query);
  const now = new Date();
  const facts = {
    status: booking.garde.status,
    nightDate: booking.request.nightDate,
    startTime: booking.request.startTime,
    extraHours: booking.request.extraHours,
  };
  // The duration names the extra hours apart, as on the family's récapitulatif: she prices them apart.
  const duration = recapNight(booking.request.nightDate, booking.request.startTime, booking.request.extraHours).duree;
  const cancelled = cancelledLine(booking.garde, "professionnelle", family.firstName);
  const reason = reasonLine(booking.garde);
  const dispute = disputeLine(booking.garde);
  const ended = booking.garde.status === "annulee";
  const [familyNotes, given, fee, liveCredit] = await Promise.all([
    familyNotesOfRequests([booking.request.id]),
    ratingsGiven("professionnelle", [booking.id]),
    ended ? gardeFee(booking.id) : Promise.resolve(null),
    ended ? gardeCredits([booking.id]) : Promise.resolve(null),
  ]);
  const feeLine = feeText(booking.garde, fee?.status ?? null, liveCredit?.get(booking.id) ?? null, "professionnelle");
  const familyNote = familyNotes.get(booking.request.id) ?? NO_NOTE;
  const myRating = given.get(booking.id) ?? null;

  return (
    <SpaceShell user={user} title={t.meta.garde}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      <div className="flex max-w-2xl flex-col gap-3">
        <GardeStateMark state={gardeState(facts, now)} />
        <RequestCard
          request={booking.request}
          rate={booking.nightRateEur}
          extraHourRate={booking.extraHourRateEur}
          note={duration}
        />
        {cancelled ? <p className="text-corps font-semibold text-taupe">{cancelled}</p> : null}
        {reason ? <p className="text-corps text-taupe">{reason}</p> : null}
        {dispute ? <p className="text-corps font-semibold text-taupe">{dispute}</p> : null}
        {feeLine ? <p className="text-corps text-taupe">{feeLine}</p> : null}
      </div>
      <section className="flex max-w-2xl flex-col gap-4 rounded-carte bg-perle px-6 py-6 md:px-8">
        <h2 className="text-h3 font-bold text-sauge">{t.gardes.famille}</h2>
        <dl className="flex flex-col gap-4">
          <Row label={t.gardes.nom}>{`${family.firstName} ${family.lastName}`}</Row>
          <Row label={words(avis).note.famille}>
            <NoteDisplay note={familyNote} />
          </Row>
          <Row label={t.gardes.adresse}>
            {address ? (
              <>
                {[address.street, address.houseNumber].filter(Boolean).join(" ")}
                {address.box ? `, ${fill(t.gardes.boite, { boite: address.box })}` : ""}
                <br />
                {`${address.postcode} ${address.locality}`}
              </>
            ) : isAddressVisible(facts, now) ? (
              t.gardes.nonRenseigne
            ) : (
              g.adresseMasquee
            )}
          </Row>
          <Row label={t.recapitulatif.libelles.telephone}>
            {family.phone ? (
              <a href={`tel:${family.phone}`} className="underline underline-offset-4">
                {family.phone}
              </a>
            ) : (
              t.gardes.nonRenseigne
            )}
          </Row>
        </dl>
      </section>
      {myRating ? (
        <GivenRating
          labels={criteriaLabels("professionnelle")}
          scores={myRating.scores}
          date={formatDate(brusselsNow(myRating.createdAt).date)}
          className="max-w-2xl rounded-carte bg-perle px-6 py-6 md:px-8"
        />
      ) : null}
      <div className="flex flex-wrap gap-3">
        {canRate(facts, myRating !== null, now) ? (
          <Button asChild>
            <Link href={professionalRatingPath(booking.id)}>{words(avis).lien}</Link>
          </Button>
        ) : null}
        {conversationId ? (
          <Button asChild>
            <Link href={conversationPath("professionnelle", conversationId)} prefetch={false}>
              {m.liens.voir}
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="raye">
          <Link href={PROFESSIONAL_BOOKINGS_PATH}>{t.gardes.retour}</Link>
        </Button>
        {canCancel(facts, now) ? (
          <CancelGarde
            side="professionnelle"
            description={g.annulation.descriptionProfessionnelle}
            onCancel={cancelGardeAction.bind(null, booking.id)}
          />
        ) : null}
        {canReportAbsence(facts, now) ? (
          <ReportAbsence
            description={g.absence.descriptionProfessionnelle}
            onReport={reportAbsenceAction.bind(null, booking.id)}
          />
        ) : null}
        {canContest(booking.garde, "professionnelle", now) ? (
          <ContestAbsence onContest={contestAbsenceAction.bind(null, booking.id)} />
        ) : null}
      </div>
    </SpaceShell>
  );
}
