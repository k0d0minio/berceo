import type { Metadata } from "next";

import { FormMessage } from "@/components/auth/field";
import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { PROFESSIONAL_REQUESTS_PATH, professionalRequestPath } from "@/lib/demandes/paths";
import { professionalRequests } from "@/lib/demandes/requests";
import { groupForProfessional } from "@/lib/demandes/series";
import { conversationsOfRequests } from "@/lib/messagerie/conversations";

import { AnswerFooter, answerNotice, type AnswerNotice } from "./answer-footer";
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
 * under a label that says it is her own, JAM-307),
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
  const conversationIds = view.validated
    ? await conversationsOfRequests(user.id, view.requests.map((request) => request.id))
    : new Map<string, string>();

  return (
    <SpaceShell user={user} title={t.professionnelle.titre}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      {!view.validated ? (
        <p className="max-w-2xl text-intro text-taupe">{t.professionnelle.nonValide}</p>
      ) : (
        <>
          <p className="max-w-2xl text-intro text-taupe">{t.professionnelle.intro}</p>
          {view.requests.length === 0 ? (
            <p className="max-w-2xl text-corps text-taupe">{t.professionnelle.vide}</p>
          ) : (
            <ul className="grid max-w-4xl gap-6 md:grid-cols-2">
              {groupForProfessional(view.requests).map((entry) =>
                entry.kind === "serie" ? (
                  // A regular request answered as one (JAM-302): one card, one answer for all its nights.
                  <li key={entry.seriesId} id={`demande-${entry.requests[0].id}`} className="scroll-mt-24">
                    <SeriesEntry
                      nights={entry.requests}
                      seriesId={entry.seriesId}
                      nightRateEur={view.nightRateEur}
                      extraHourRateEur={view.extraHourRateEur}
                      conversationId={entry.requests
                        .map((night) => conversationIds.get(night.id))
                        .find((id) => id !== undefined)}
                      from="liste"
                    />
                  </li>
                ) : (
                  <li key={entry.request.id} id={`demande-${entry.request.id}`} className="scroll-mt-24">
                    <RequestCard
                      request={entry.request}
                      href={professionalRequestPath(entry.request.id)}
                      showPublished
                      priority={entry.request.priority}
                      rate={view.nightRateEur}
                      extraHourRate={view.extraHourRateEur}
                      rateLabel={r.votreTarif}
                      note={entry.request.answer === "en_attente" ? r.repondu : undefined}
                      footer={
                        <AnswerFooter
                          request={entry.request}
                          conversationId={conversationIds.get(entry.request.id)}
                          from="liste"
                          now={now}
                        />
                      }
                    />
                  </li>
                ),
              )}
            </ul>
          )}
        </>
      )}
    </SpaceShell>
  );
}
