import Link from "next/link";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { NoteDisplay } from "@/components/avis/stars";
import { MobileIcon } from "@/components/berceo-icons";
import { CancelRequest } from "@/components/demandes/cancel-request";
import { RequestReason } from "@/components/demandes/request-reason";
import { EuroIcon } from "@/components/icons";
import { SeriesCard } from "@/components/demandes/series-card";
import { AcceptAnswer } from "@/components/reservations/accept-answer";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { Button } from "@/components/ui/button";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/empty-state";
import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import { familyMay } from "@/lib/abonnements/rules";
import { creditShares } from "@/lib/credits/credits";
import { formatDate, nightLine } from "@/lib/demandes/format";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { ownSeriesNights, type OwnRequest } from "@/lib/demandes/requests";
import { displayStatus, isChangeable, isEditable, toHourMinute } from "@/lib/demandes/rules";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { requestHasAddress } from "@/lib/famille/request-address";
import { conversationsOfAnswers } from "@/lib/messagerie/conversations";
import { conversationPath } from "@/lib/messagerie/paths";
import { seriesFeeRecap } from "@/lib/paiements/format";
import { feeCents } from "@/lib/paiements/rules";
import { answersEver, familySeriesAnswers } from "@/lib/reservations/answers";
import { bookingOfRequest } from "@/lib/reservations/bookings";
import { extraHourLine, professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import { familyBookingPath } from "@/lib/reservations/paths";

import { acceptSeriesAction, cancelSeriesAction } from "../actions";

const t = words(demandes);
const r = words(reservations);
const m = words(messagerie);

/*
 * A regular request answered as one (JAM-302): every night in one card, then
 * « Les professionnelles qui ont répondu à votre demande », each one for all
 * the open nights, with « Accepter et réserver » for all of them at once and
 * one service fee (Q1). « Modifier ma demande » until a professional answers
 * any night (Q4), « Annuler toutes les nuits » while a night is open. No
 * « Republier »: to change an answered request, she cancels it and publishes a
 * new one. Each booked night links to its garde, which lives on its own (Q2).
 * The answers are white cards on a sage zone (slide 25; JAM-327).
 */
export async function SeriesRequest({
  userId,
  request,
  seriesId,
  subscribed,
  now,
}: {
  userId: string;
  request: OwnRequest;
  seriesId: string;
  subscribed: boolean;
  now: Date;
}) {
  const nights = await ownSeriesNights(userId, seriesId);
  const openNights = nights.filter((night) => isChangeable(night, now));
  const open = openNights.length > 0;
  const mayBook = familyMay("reserver", { subscribed });
  const [answers, hasAddress, answered, bookings] = await Promise.all([
    open ? familySeriesAnswers(userId, seriesId) : Promise.resolve([]),
    open ? requestHasAddress(userId, request.id) : Promise.resolve(false),
    answersEver(userId, request.id),
    Promise.all(nights.map((night) => (night.status !== "ouverte" ? bookingOfRequest(userId, night.id) : null))),
  ]);
  const editable = isEditable(request, answered, now);
  const [conversationIds, shares] = await Promise.all([
    conversationsOfAnswers(
      userId,
      answers.flatMap((answer) => answer.nights.map((night) => night.applicationId)),
    ),
    mayBook && hasAddress
      ? creditShares(
          userId,
          answers.map((answer) => answer.nights.reduce((sum, night) => sum + feeCents(night.nightRateEur), 0)),
          now,
        )
      : Promise.resolve(new Map<number, number>()),
  ]);
  const first = openNights.at(0) ?? nights.at(0) ?? request;
  // Each night has its own start and extra hours (JAM-303). When they are the same, the summary
  // says them once. When they differ, each night's line carries its own hours and its end.
  const byDate = new Map(nights.map((item) => [item.nightDate, item]));
  const recapOf = (dates: readonly string[]) => {
    const items = dates.flatMap((date) => {
      const item = byDate.get(date);
      return item ? [item] : [];
    });
    const head = items.at(0) ?? first;
    const sameHours = items.every(
      (item) => toHourMinute(item.startTime) === toHourMinute(head.startTime) && item.extraHours === head.extraHours,
    );
    return sameHours
      ? { ...recapNight(head.nightDate, head.startTime, head.extraHours), date: dates.map(formatDate).join(", ") }
      : {
          heures: r.recapitulatif.heuresDifferentes,
          duree: r.recapitulatif.dureeDifferente,
          date: items.map((item) => nightLine(item.nightDate, item.startTime, item.extraHours)).join(", "),
        };
  };

  return (
    <>
      <div className="max-w-2xl">
        <SeriesCard
          nights={nights.map((item, i) => {
            const booking = bookings[i];
            return {
              request: item,
              status: displayStatus(item, now),
              href: booking ? familyBookingPath(booking.id) : undefined,
              linkLabel: booking ? r.famille.voirReservation : undefined,
            };
          })}
        />
      </div>
      {request.reason ? <RequestReason title={t.formulaire.champs.motif} reason={request.reason} /> : null}

      {open ? (
        <section className="flex max-w-4xl flex-col gap-4">
          <h2 className="font-display text-h2 text-sauge">{r.famille.reponsesTitre}</h2>
          {answers.length === 0 ? (
            <EmptyState icon={MobileIcon} text={r.famille.aucuneReponse} />
          ) : (
            <>
              <p className="max-w-2xl text-corps text-taupe">{r.famille.reponsesSerie}</p>
              {!mayBook ? <SubscriptionRequired /> : null}
              {mayBook && !hasAddress ? (
                <div className="flex max-w-2xl flex-col gap-3">
                  <p className="text-corps text-taupe">{r.famille.adresseRequise}</p>
                  <Button asChild variant="raye" className="w-fit">
                    <Link href={PROFILE_PATH}>{r.famille.completerAdresse}</Link>
                  </Button>
                </div>
              ) : null}
              <CardField>
                <ul className="grid gap-6 md:grid-cols-2">
                  {answers.map((answer) => {
                    const total = answer.nights.reduce((sum, item) => sum + feeCents(item.nightRateEur), 0);
                    const conversationId = answer.nights
                      .map((item) => conversationIds.get(item.applicationId))
                      .find((id) => id !== undefined);
                    return (
                      <li key={answer.profileId}>
                        <article className="flex h-full flex-col gap-4 rounded-carte bg-blanc px-6 py-8 md:px-10">
                          <div className="flex items-center gap-4">
                            <ProfessionalPhoto photoId={answer.photoId} prenom={answer.firstName} className="size-16" />
                            <div className="flex flex-col gap-1">
                              <h3 className="text-h3 font-bold text-sauge">{answer.firstName}</h3>
                              <p className="text-corps text-taupe">{professionLabel(answer.profession)}</p>
                            </div>
                          </div>
                          <NoteDisplay note={answer.note} />
                          <div className="flex items-start gap-3 text-corps">
                            <EuroIcon aria-hidden className="mt-0.5 size-6 shrink-0 text-taupe" />
                            <div className="flex min-w-0 flex-col">
                              <p className="font-semibold text-sauge">{rateLine(answer.nightRateEur)}</p>
                              {answer.extraHourRateEur ? (
                                <p className="font-semibold text-sauge">{extraHourLine(answer.extraHourRateEur)}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {conversationId ? (
                              <Link
                                href={conversationPath("famille", conversationId)}
                                prefetch={false}
                                className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
                              >
                                {fill(m.liens.ecrire, { prenom: answer.firstName })}
                              </Link>
                            ) : null}
                            {mayBook && hasAddress ? (
                              <AcceptAnswer
                                recap={{
                                  ...recapOf(answer.nights.map((item) => item.nightDate)),
                                  nuits:
                                    answer.nights.length === 1
                                      ? t.serie.uneNuit
                                      : fill(t.serie.nombre, { n: String(answer.nights.length) }),
                                  prenom: answer.firstName,
                                  profession: professionLabel(answer.profession),
                                  tarif: rateLine(answer.nightRateEur),
                                  tarifHeure: answer.extraHourRateEur
                                    ? extraHourLine(answer.extraHourRateEur)
                                    : undefined,
                                  ...seriesFeeRecap(
                                    answer.nights.map((item) => item.nightRateEur),
                                    shares.get(total) ?? 0,
                                  ),
                                }}
                                onAccept={acceptSeriesAction.bind(null, seriesId, request.id, answer.profileId)}
                              />
                            ) : null}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </CardField>
            </>
          )}
        </section>
      ) : null}

      {open && answered > 0 ? <p className="max-w-2xl text-corps text-taupe">{r.famille.verrouSerie}</p> : null}

      {editable && !familyMay("modifier", { subscribed }) ? <SubscriptionRequired /> : null}
      <div className="flex flex-wrap gap-3">
        {editable && familyMay("modifier", { subscribed }) ? (
          <Button asChild>
            <Link href={`${familyRequestPath(request.id)}/modifier`}>{t.boutons.modifier}</Link>
          </Button>
        ) : null}
        {open ? <CancelRequest serie onCancel={cancelSeriesAction.bind(null, seriesId)} /> : null}
        <Button asChild variant="raye">
          <Link href={FAMILY_REQUESTS_PATH}>{t.boutons.retour}</Link>
        </Button>
      </div>
    </>
  );
}
