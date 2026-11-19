import Link from "next/link";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { NoteDisplay } from "@/components/avis/stars";
import { CancelRequest } from "@/components/demandes/cancel-request";
import { RequestReason } from "@/components/demandes/request-reason";
import { SeriesCard } from "@/components/demandes/series-card";
import { AcceptAnswer } from "@/components/reservations/accept-answer";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { Button } from "@/components/ui/button";
import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import { familyMay } from "@/lib/abonnements/rules";
import { creditShares } from "@/lib/credits/credits";
import { formatDate } from "@/lib/demandes/format";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { ownSeriesNights, type OwnRequest } from "@/lib/demandes/requests";
import { displayStatus, isChangeable, isEditable } from "@/lib/demandes/rules";
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
  const night = recapNight(first.nightDate, first.startTime, first.extraHours);

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
          <h2 className="font-display text-h2 text-encre-sauge">{r.famille.reponsesTitre}</h2>
          {answers.length === 0 ? (
            <p className="max-w-2xl text-corps text-encre-taupe">{r.famille.aucuneReponse}</p>
          ) : (
            <>
              <p className="max-w-2xl text-corps text-encre-taupe">{r.famille.reponsesSerie}</p>
              {!mayBook ? <SubscriptionRequired /> : null}
              {mayBook && !hasAddress ? (
                <div className="flex max-w-2xl flex-col gap-3">
                  <p className="text-corps text-encre-taupe">{r.famille.adresseRequise}</p>
                  <Button asChild variant="raye" className="w-fit">
                    <Link href={PROFILE_PATH}>{r.famille.completerAdresse}</Link>
                  </Button>
                </div>
              ) : null}
              <ul className="grid gap-6 md:grid-cols-2">
                {answers.map((answer) => {
                  const total = answer.nights.reduce((sum, item) => sum + feeCents(item.nightRateEur), 0);
                  const conversationId = answer.nights
                    .map((item) => conversationIds.get(item.applicationId))
                    .find((id) => id !== undefined);
                  return (
                    <li key={answer.profileId}>
                      <article className="flex flex-col gap-4 rounded-carte bg-perle px-6 py-6 md:px-8">
                        <div className="flex items-center gap-4">
                          <ProfessionalPhoto photoId={answer.photoId} prenom={answer.firstName} className="size-16" />
                          <div className="flex flex-col gap-1">
                            <h3 className="font-display text-h3 text-encre-sauge uppercase">{answer.firstName}</h3>
                            <p className="text-corps text-encre-taupe">{professionLabel(answer.profession)}</p>
                          </div>
                        </div>
                        <NoteDisplay note={answer.note} />
                        <p className="text-corps font-semibold text-encre-sauge">{rateLine(answer.nightRateEur)}</p>
                        {answer.extraHourRateEur ? (
                          <p className="text-corps font-semibold text-encre-sauge">
                            {extraHourLine(answer.extraHourRateEur)}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-3">
                          {conversationId ? (
                            <Link
                              href={conversationPath("famille", conversationId)}
                              prefetch={false}
                              className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
                            >
                              {fill(m.liens.ecrire, { prenom: answer.firstName })}
                            </Link>
                          ) : null}
                          {mayBook && hasAddress ? (
                            <AcceptAnswer
                              recap={{
                                ...night,
                                date: answer.nights.map((item) => formatDate(item.nightDate)).join(", "),
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
            </>
          )}
        </section>
      ) : null}

      {open && answered > 0 ? <p className="max-w-2xl text-corps text-encre-taupe">{r.famille.verrouSerie}</p> : null}

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
