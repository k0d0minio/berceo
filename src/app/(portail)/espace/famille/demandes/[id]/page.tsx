import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { CancelRequest } from "@/components/demandes/cancel-request";
import { RequestCard } from "@/components/demandes/request-card";
import { AcceptAnswer } from "@/components/reservations/accept-answer";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { RepublishRequest } from "@/components/reservations/republish-request";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { paiement } from "@/content/paiement";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { ownRequest } from "@/lib/demandes/requests";
import { displayStatus, isChangeable, isEditable } from "@/lib/demandes/rules";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { familyHasAddress } from "@/lib/famille/profile";
import { feeLine } from "@/lib/paiements/format";
import { PAYMENT_RETURN_PATH } from "@/lib/paiements/paths";
import { isSessionId } from "@/lib/paiements/rules";
import { familyAnswers } from "@/lib/reservations/answers";
import { bookingOfRequest } from "@/lib/reservations/bookings";
import { professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import { familyBookingPath, professionalProfilePath } from "@/lib/reservations/paths";
import { canRepublish } from "@/lib/reservations/rules";

import { acceptAnswerAction, cancelRequestAction, republishRequestAction } from "../actions";

const t = words(demandes);
const r = words(reservations);
const c = words(comptes);
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
 * One of her requests: the card, then, while it is open and its night has not
 * started, « Les professionnelles qui ont répondu à votre demande » (the
 * guide) with « Voir le profil complet » and « Accepter et réserver » for each,
 * « Modifier ma demande » while no answer waits (D-76), « Annuler ma demande »,
 * and « Republier ma demande » once an answer waits (D-70). Without an address
 * in her profile she is sent to complete it before booking (D-77). A booked
 * request reads « Attribuée » and links to its booking. Another family's id,
 * like an unknown one, is not found.
 */
export default async function DemandePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Notice>;
}) {
  const { id } = await params;
  const user = await requireAccess(familyRequestPath(id));
  const request = await ownRequest(user.id, id);
  if (!request) notFound();

  const now = new Date();
  const query = await searchParams;
  const notice = message(query);
  const open = isChangeable(request, now);
  const facts = { ...request, priorityProfileId: null };
  const [answers, hasAddress, bookingId] = await Promise.all([
    open ? familyAnswers(user.id, request.id) : Promise.resolve([]),
    open ? familyHasAddress(user.id) : Promise.resolve(false),
    request.status === "attribuee" ? bookingOfRequest(user.id, request.id) : Promise.resolve(null),
  ]);
  const night = recapNight(request.nightDate, request.startTime);

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
          className="w-fit text-corps font-semibold text-encre-sauge underline underline-offset-4"
        >
          {p.retour.actualiser}
        </Link>
      ) : null}
      <div className="max-w-2xl">
        <RequestCard request={request} status={displayStatus(request, now)} />
      </div>

      {bookingId ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={familyBookingPath(bookingId)}>{r.famille.voirReservation}</Link>
          </Button>
        </div>
      ) : null}

      {open ? (
        <section className="flex max-w-4xl flex-col gap-4">
          <h2 className="font-display text-h2 text-encre-sauge">{r.famille.reponsesTitre}</h2>
          {answers.length === 0 ? (
            <p className="max-w-2xl text-corps text-encre-taupe">{r.famille.aucuneReponse}</p>
          ) : (
            <>
              {!hasAddress ? (
                <div className="flex max-w-2xl flex-col gap-3">
                  <p className="text-corps text-encre-taupe">{r.famille.adresseRequise}</p>
                  <Button asChild variant="raye" className="w-fit">
                    <Link href={PROFILE_PATH}>{r.famille.completerAdresse}</Link>
                  </Button>
                </div>
              ) : null}
              <ul className="grid gap-6 md:grid-cols-2">
                {answers.map((answer) => (
                  <li key={answer.applicationId}>
                    <article className="flex flex-col gap-4 rounded-carte bg-perle px-6 py-6 md:px-8">
                      <div className="flex items-center gap-4">
                        <ProfessionalPhoto photoId={answer.photoId} prenom={answer.firstName} className="size-16" />
                        <div className="flex flex-col gap-1">
                          <h3 className="font-display text-h3 text-encre-sauge uppercase">{answer.firstName}</h3>
                          <p className="text-corps text-encre-taupe">{professionLabel(answer.profession)}</p>
                        </div>
                      </div>
                      <p className="text-corps font-semibold text-encre-sauge">{rateLine(answer.nightRateEur)}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={professionalProfilePath(answer.profileId, request.id)}
                          className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
                        >
                          {r.famille.voirProfil}
                        </Link>
                        {hasAddress ? (
                          <AcceptAnswer
                            recap={{
                              ...night,
                              prenom: answer.firstName,
                              profession: professionLabel(answer.profession),
                              tarif: rateLine(answer.nightRateEur),
                              frais: feeLine(answer.nightRateEur),
                            }}
                            onAccept={acceptAnswerAction.bind(null, request.id, answer.applicationId)}
                          />
                        ) : null}
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : null}

      {open && answers.length > 0 ? <p className="max-w-2xl text-corps text-encre-taupe">{r.famille.verrou}</p> : null}

      <div className="flex flex-wrap gap-3">
        {isEditable(request, answers.length, now) ? (
          <Button asChild>
            <Link href={`${familyRequestPath(request.id)}/modifier`}>{t.boutons.modifier}</Link>
          </Button>
        ) : null}
        {canRepublish(facts, answers.length, now) ? (
          <RepublishRequest onRepublish={republishRequestAction.bind(null, request.id)} />
        ) : null}
        {open ? <CancelRequest onCancel={cancelRequestAction.bind(null, request.id)} /> : null}
        <Button asChild variant="raye">
          <Link href={FAMILY_REQUESTS_PATH}>{t.boutons.retour}</Link>
        </Button>
      </div>
    </SpaceShell>
  );
}
