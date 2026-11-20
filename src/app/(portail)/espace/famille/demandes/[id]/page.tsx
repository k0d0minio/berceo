import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { NoteDisplay } from "@/components/avis/stars";
import { FormMessage } from "@/components/auth/field";
import { MobileIcon } from "@/components/berceo-icons";
import { CancelRequest } from "@/components/demandes/cancel-request";
import { GardeStateMark } from "@/components/gardes/garde-state";
import { EuroIcon } from "@/components/icons";
import { RequestCard } from "@/components/demandes/request-card";
import { RequestReason } from "@/components/demandes/request-reason";
import { AcceptAnswer } from "@/components/reservations/accept-answer";
import { AdaptedTimes } from "@/components/reservations/adapted-times";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { RepublishRequest } from "@/components/reservations/republish-request";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/empty-state";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { paiement } from "@/content/paiement";
import { reservations } from "@/content/reservations";
import { familyMay } from "@/lib/abonnements/rules";
import { isSubscribed } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { ownRequest } from "@/lib/demandes/requests";
import { displayStatus, isChangeable, isEditable } from "@/lib/demandes/rules";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { requestHasAddress } from "@/lib/famille/request-address";
import { conversationsOfAnswers } from "@/lib/messagerie/conversations";
import { conversationPath } from "@/lib/messagerie/paths";
import { creditShares } from "@/lib/credits/credits";
import { creditRecap, feeLine } from "@/lib/paiements/format";
import { PAYMENT_RETURN_PATH } from "@/lib/paiements/paths";
import { feeCents, isSessionId } from "@/lib/paiements/rules";
import { answersEver, familyAnswers } from "@/lib/reservations/answers";
import { gardeState } from "@/lib/gardes/rules";
import { bookingOfRequest } from "@/lib/reservations/bookings";
import { adaptedLines, extraHourLine, professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import { familyBookingPath, professionalProfilePath } from "@/lib/reservations/paths";
import { adaptedNights, canRepublish, effectiveStart, proposalsSignature } from "@/lib/reservations/rules";

import { acceptAnswerAction, cancelRequestAction, republishRequestAction } from "../actions";

import { SeriesRequest } from "./series-request";

const t = words(demandes);
const r = words(reservations);
const c = words(comptes);
const m = words(messagerie);
const p = words(paiement);

export const metadata: Metadata = {
  title: t.meta.detail,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Notice = {
  publiee?: string;
  modifiee?: string;
  annulee?: string;
  republiee?: string;
  erreur?: string;
  /** A refused booking or republication: `src/content/reservations.ts`'s own words. */
  refus?: string;
  /** Back from Stripe's page, or it could not open (frais-de-service). */
  paiement?: string;
  /** The Checkout still being settled, for « Actualiser la page ». */
  session?: string;
};


const PAYMENT_NOTICES = ["enCours", "rembourse", "remboursementEnAttente", "abandonne", "erreur"] as const;

function message(notice: Notice): string | null {
  if (notice.publiee === "urgente") return t.confirmations.publieeUrgente;
  if (notice.publiee === "1") return t.confirmations.publiee;
  if (notice.modifiee === "1") return t.confirmations.modifiee;
  if (notice.annulee === "1") return t.confirmations.annulee;
  if (notice.republiee === "1") return r.republication.faite;
  const payment = PAYMENT_NOTICES.find((key) => key === notice.paiement);
  if (payment) return p.retour[payment];
  const refusal = notice.refus;
  if (refusal && Object.hasOwn(r.famille.erreurs, refusal)) {
    return r.famille.erreurs[refusal as keyof typeof r.famille.erreurs];
  }
  if (notice.erreur === "nonModifiable") return t.erreurs.nonModifiable;
  if (refusal || notice.erreur) return c.erreurs.generique;
  return null;
}

/*
 * One of her requests: the card and her optional reason (demande-motif-facultatif), then, while it is open and its night has not
 * started, « Les professionnelles qui ont répondu à votre demande » (the
 * guide) with « Voir le profil complet » and « Accepter et réserver » for each,
 * « Modifier ma demande » until a professional answers it (JAM-302, Q4), « Annuler ma demande »,
 * and « Republier ma demande » once an answer waits (D-70). Without an address
 * in her profile she is sent to complete it before booking (D-77). A booked
 * request reads « Attribuée » and links to its booking. Another family's id,
 * like an unknown one, is not found. Without a subscription she reads the
 * answers and their conversations, and can cancel: the invitation line takes
 * the place of « Accepter et réserver », « Modifier ma demande » and
 * « Republier ma demande » (abonnements-acces). The answers are white cards
 * on a sage zone, her rate a line with an icon (slide 25; JAM-327), and no
 * answer yet is the taupe empty state. An answer that proposes a different
 * start (JAM-306) carries the mark « Horaire adapté » and the start asked for,
 * the start proposed and the new end; its récapitulatif gives the adapted
 * hours and asks the family to accept them before the payment.
 */
export default async function DemandePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Notice>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireAccess(withQuery(familyRequestPath(id), query));
  const request = await ownRequest(user.id, id);
  if (!request) notFound();

  const now = new Date();
  const notice = message(query);

  // A regular request answered as one (JAM-302): its own view, whichever night's page this is.
  if (request.seriesWhole && request.seriesId) {
    const subscribed = await isSubscribed(user.id, now);
    return (
      <SpaceShell user={user} title={t.meta.detail}>
        {notice ? <FormMessage>{notice}</FormMessage> : null}
        {query.paiement === "enCours" ? (
          <Link
            href={
              isSessionId(query.session)
                ? `${PAYMENT_RETURN_PATH}?session_id=${query.session}`
                : familyRequestPath(request.id)
            }
            className="w-fit text-corps font-semibold text-sauge underline underline-offset-4"
          >
            {p.retour.actualiser}
          </Link>
        ) : null}
        <SeriesRequest
          userId={user.id}
          request={request}
          seriesId={request.seriesId}
          subscribed={subscribed}
          now={now}
        />
      </SpaceShell>
    );
  }

  const open = isChangeable(request, now);
  const facts = { ...request, priorityProfileId: null };
  const [answers, hasAddress, booking, subscribed, answered] = await Promise.all([
    open ? familyAnswers(user.id, request.id) : Promise.resolve([]),
    open ? requestHasAddress(user.id, request.id) : Promise.resolve(false),
    // A booked request, and one whose garde was cancelled since (D-110), link to the garde.
    request.status !== "ouverte" ? bookingOfRequest(user.id, request.id) : Promise.resolve(null),
    isSubscribed(user.id, now),
    answersEver(user.id, request.id),
  ]);
  const mayBook = familyMay("reserver", { subscribed });
  // One answer ever locks editing (JAM-302, Q4).
  const editable = isEditable(request, answered, now);
  // Republishing needs a waiting answer, so the answers' invitation line stands for it too.
  const republishable = canRepublish(facts, answers.length, now);
  // What each answer proposes for the night (JAM-306): its lines, and what the family confirms.
  const scheduleOf = (answer: (typeof answers)[number]) => {
    const nights = [{ ...request, requestId: request.id, proposedStartTime: answer.proposedStartTime }];
    return {
      lignes: adaptedLines(adaptedNights(nights), false),
      confirmed: proposalsSignature(nights),
      night: recapNight(
        request.nightDate,
        effectiveStart(request.startTime, answer.proposedStartTime),
        request.extraHours,
      ),
    };
  };
  const [conversationIds, shares] = await Promise.all([
    conversationsOfAnswers(user.id, answers.map((answer) => answer.applicationId)),
    // The part her Berceo credit would pay on each answer's fee, for the récapitulatif (credits-au-paiement).
    mayBook && hasAddress
      ? creditShares(user.id, answers.map((answer) => feeCents(answer.nightRateEur)), now)
      : Promise.resolve(new Map<number, number>()),
  ]);

  return (
    <SpaceShell user={user} title={t.meta.detail}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      {query.paiement === "enCours" ? (
        <Link
          href={
            isSessionId(query.session)
              ? `${PAYMENT_RETURN_PATH}?session_id=${query.session}`
              : familyRequestPath(request.id)
          }
          className="w-fit text-corps font-semibold text-sauge underline underline-offset-4"
        >
          {p.retour.actualiser}
        </Link>
      ) : null}
      <div className="max-w-2xl">
        <RequestCard request={request} status={displayStatus(request, now)} />
      </div>
      {request.reason ? <RequestReason title={t.formulaire.champs.motif} reason={request.reason} /> : null}

      {booking ? (
        <div className="flex flex-wrap items-center gap-3">
          <GardeStateMark
            state={gardeState({ ...request, status: booking.status }, now)}
          />
          <Button asChild>
            <Link href={familyBookingPath(booking.id)}>{r.famille.voirReservation}</Link>
          </Button>
        </div>
      ) : null}

      {open ? (
        <section className="flex max-w-4xl flex-col gap-4">
          <h2 className="font-display text-h2 text-sauge">{r.famille.reponsesTitre}</h2>
          {answers.length === 0 ? (
            <EmptyState icon={MobileIcon} text={r.famille.aucuneReponse} />
          ) : (
            <>
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
                    const schedule = scheduleOf(answer);
                    return (
                      <li key={answer.applicationId}>
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
                          <AdaptedTimes prenom={answer.firstName} lignes={schedule.lignes} />
                          <div className="flex flex-wrap items-center gap-3">
                            <Link
                              href={professionalProfilePath(answer.profileId, request.id)}
                              className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
                            >
                              {r.famille.voirProfil}
                            </Link>
                            {conversationIds.has(answer.applicationId) ? (
                              <Link
                                href={conversationPath("famille", conversationIds.get(answer.applicationId)!)}
                                prefetch={false}
                                className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
                              >
                                {fill(m.liens.ecrire, { prenom: answer.firstName })}
                              </Link>
                            ) : null}
                            {mayBook && hasAddress ? (
                              <AcceptAnswer
                                recap={{
                                  ...schedule.night,
                                  horairesAdaptes: schedule.lignes,
                                  prenom: answer.firstName,
                                  profession: professionLabel(answer.profession),
                                  tarif: rateLine(answer.nightRateEur),
                                  tarifHeure: answer.extraHourRateEur
                                    ? extraHourLine(answer.extraHourRateEur)
                                    : undefined,
                                  frais: feeLine(answer.nightRateEur),
                                  ...creditRecap(answer.nightRateEur, shares),
                                }}
                                onAccept={acceptAnswerAction.bind(
                                  null,
                                  request.id,
                                  answer.applicationId,
                                  schedule.confirmed,
                                )}
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

      {open && answered > 0 ? <p className="max-w-2xl text-corps text-taupe">{r.famille.verrou}</p> : null}

      {editable && !familyMay("modifier", { subscribed }) ? <SubscriptionRequired /> : null}
      <div className="flex flex-wrap gap-3">
        {editable && familyMay("modifier", { subscribed }) ? (
          <Button asChild>
            <Link href={`${familyRequestPath(request.id)}/modifier`}>{t.boutons.modifier}</Link>
          </Button>
        ) : null}
        {republishable && familyMay("publier", { subscribed }) ? (
          <RepublishRequest onRepublish={republishRequestAction.bind(null, request.id)} />
        ) : null}
        {open ? <CancelRequest onCancel={cancelRequestAction.bind(null, request.id)} /> : null}
        <Button asChild variant="raye">
          <Link href={FAMILY_REQUESTS_PATH}>{t.boutons.retour}</Link>
        </Button>
      </div>

      {/* The cancellation conditions, in small print (round 2, JAM-301). */}
      <section aria-labelledby="conditions-annulation" className="flex max-w-2xl flex-col gap-1 text-legende text-taupe">
        <h2 id="conditions-annulation" className="font-semibold">
          {t.conditionsAnnulation.titre}
        </h2>
        {t.conditionsAnnulation.lignes.map((ligne) => (
          <p key={ligne}>{ligne}</p>
        ))}
      </section>
    </SpaceShell>
  );
}
