import type { Metadata } from "next";

import { FormMessage } from "@/components/auth/field";
import { RequestCard } from "@/components/demandes/request-card";
import { LuneIcon } from "@/components/berceo-icons";
import { SpaceShell } from "@/components/shell/space-shell";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/empty-state";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { PROFESSIONAL_REQUESTS_PATH, professionalRequestPath } from "@/lib/demandes/paths";
import { professionalRequests } from "@/lib/demandes/requests";
import { groupForProfessional } from "@/lib/demandes/series";
import { conversationsOfRequests } from "@/lib/messagerie/conversations";
import { savedRatesOfAnswers } from "@/lib/reservations/answers";
import { seriesShownRates, shownRates, type Rates } from "@/lib/reservations/rules";

import { AnswerFooter, answerNotice, ownProposal, type AnswerNotice } from "./answer-footer";
import { SeriesEntry } from "./series-entry";

const t = words(demandes);
const r = words(reservations).professionnelle;

export const metadata: Metadata = {
  title: t.meta.professionnelle,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * Her list (D-10, D-11): the open requests in the communes she serves, and
 * those sent to her « en priorité » wherever they are (D-71), priority first,
 * then urgent, then newest. Each card carries her rate (the DA's price line,
 * under a label that says it is her own, JAM-307; once she answered, the rate
 * saved on her answer, the one the family reads, JAM-344),
 * « Voir la demande » to the request's page, which alone shows the family's
 * optional reason (demande-motif-facultatif), and « Je suis disponible pour
 * cette garde », or, once she answered, « Vous avez répondu » and « Retirer ma
 * disponibilité ». Declined requests and nights she is booked for are gone
 * (D-73). Nothing about the family (D-15).
 */
export default async function DemandesProfessionnellePage({
  searchParams,
}: {
  searchParams: Promise<AnswerNotice>;
}) {
  const query = await searchParams;
  const user = await requireAccess(withQuery(PROFESSIONAL_REQUESTS_PATH, query));
  const view = await professionalRequests(user.id);
  const now = new Date();
  const notice = answerNotice(query);
  const requestIds = view.validated ? view.requests.map((request) => request.id) : [];
  const [conversationIds, savedRates] = await Promise.all([
    conversationsOfRequests(user.id, requestIds),
    // The rates saved on her waiting answers: what the family reads (JAM-344).
    savedRatesOfAnswers(user.id, requestIds),
  ]);
  const profileRates: Rates = view.validated
    ? { nightRateEur: view.nightRateEur, extraHourRateEur: view.extraHourRateEur }
    : { nightRateEur: null, extraHourRateEur: null };

  return (
    <SpaceShell user={user} title={t.professionnelle.titre}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      {!view.validated ? (
        <p className="max-w-2xl text-intro text-taupe">{t.professionnelle.nonValide}</p>
      ) : (
        <>
          <p className="max-w-2xl text-intro text-taupe">{t.professionnelle.intro}</p>
          {view.requests.length === 0 ? (
            <EmptyState icon={LuneIcon} text={t.professionnelle.vide} />
          ) : (
            // The request cards sit on the sage zone (slide 25, JAM-327).
            <CardField className="max-w-4xl">
              <ul className="grid gap-6 md:grid-cols-2">
                {groupForProfessional(view.requests).map((entry) => {
                  // A regular request answered as one (JAM-302): one card, one answer for all its nights.
                  if (entry.kind === "serie") {
                    return (
                      <li key={entry.seriesId} id={`demande-${entry.requests[0].id}`} className="min-w-0 scroll-mt-24">
                        <SeriesEntry
                          nights={entry.requests}
                          seriesId={entry.seriesId}
                          rates={seriesShownRates(profileRates, entry.requests, savedRates)}
                          saved={savedRates}
                          conversationId={entry.requests
                            .map((night) => conversationIds.get(night.id))
                            .find((id) => id !== undefined)}
                          from="liste"
                        />
                      </li>
                    );
                  }
                  const rates = shownRates(profileRates, entry.request.answer, savedRates.get(entry.request.id));
                  return (
                    <li key={entry.request.id} id={`demande-${entry.request.id}`} className="min-w-0 scroll-mt-24">
                      <RequestCard
                        request={entry.request}
                        href={professionalRequestPath(entry.request.id)}
                        showPublished
                        priority={entry.request.priority}
                        rate={rates.nightRateEur}
                        extraHourRate={rates.extraHourRateEur}
                        rateLabel={rates.source === "reponse" ? r.tarifRepondu : r.votreTarif}
                        note={entry.request.answer === "en_attente" ? r.repondu : undefined}
                        proposal={ownProposal(entry.request, savedRates)}
                        footer={
                          <AnswerFooter
                            request={entry.request}
                            saved={savedRates}
                            conversationId={conversationIds.get(entry.request.id)}
                            from="liste"
                            now={now}
                          />
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </CardField>
          )}
        </>
      )}
    </SpaceShell>
  );
}
