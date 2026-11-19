import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { RequestCard } from "@/components/demandes/request-card";
import { RequestReason } from "@/components/demandes/request-reason";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { PROFESSIONAL_REQUESTS_PATH, professionalRequestPath } from "@/lib/demandes/paths";
import { professionalRequest, professionalRequests } from "@/lib/demandes/requests";
import { conversationsOfRequests } from "@/lib/messagerie/conversations";

import { AnswerFooter, answerNotice, type AnswerNotice } from "../answer-footer";
import { SeriesEntry } from "../series-entry";

const t = words(demandes);
const r = words(reservations).professionnelle;

export const metadata: Metadata = {
  title: t.meta.demandeProfessionnelle,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * One request of her list (demande-motif-facultatif): the same card as the
 * list, the family's optional reason, which no card, digest or e-mail carries,
 * then the same answer buttons as the list. The request must be on her list: an
 * unvalidated profile, a request outside her communes and not sent to her in
 * priority, a declined one, a booked night, a cancelled or past request, and
 * an unknown id all read as not found. Nothing else about the family (D-15).
 */
export default async function DemandeProfessionnellePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<AnswerNotice>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireAccess(withQuery(professionalRequestPath(id), query));
  const view = await professionalRequest(user.id, id);
  if (!view) notFound();

  const { request } = view;
  const now = new Date();
  const notice = answerNotice(query);

  // A regular request answered as one (JAM-302): every night of it on her list, one answer.
  if (request.seriesWhole && request.seriesId) {
    const seriesId = request.seriesId;
    const list = await professionalRequests(user.id);
    const nights = (list.validated ? list.requests : [])
      .filter((night) => night.seriesId === seriesId)
      .sort((a, b) => a.nightDate.localeCompare(b.nightDate));
    const ids = await conversationsOfRequests(
      user.id,
      nights.map((night) => night.id),
    );
    return (
      <SpaceShell user={user} title={t.professionnelle.titre}>
        {notice ? <FormMessage>{notice}</FormMessage> : null}
        <div className="max-w-2xl">
          <SeriesEntry
            nights={nights.length > 0 ? nights : [request]}
            seriesId={seriesId}
            nightRateEur={view.nightRateEur}
            extraHourRateEur={view.extraHourRateEur}
            conversationId={nights.map((night) => ids.get(night.id)).find((id) => id !== undefined)}
            from="demande"
          />
        </div>
        {request.reason ? <RequestReason title={t.professionnelle.motif} reason={request.reason} /> : null}
        <div className="flex max-w-2xl flex-wrap gap-3">
          <Button asChild variant="raye">
            <Link href={PROFESSIONAL_REQUESTS_PATH}>{t.professionnelle.retour}</Link>
          </Button>
        </div>
      </SpaceShell>
    );
  }

  const conversationIds = await conversationsOfRequests(user.id, [request.id]);

  return (
    <SpaceShell user={user} title={t.professionnelle.titre}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      <div className="max-w-2xl">
        <RequestCard
          request={request}
          showPublished
          priority={request.priority}
          rate={view.nightRateEur}
          extraHourRate={view.extraHourRateEur}
          rateLabel={r.votreTarif}
          note={request.answer === "en_attente" ? r.repondu : undefined}
        />
      </div>
      {request.reason ? <RequestReason title={t.professionnelle.motif} reason={request.reason} /> : null}
      {/* Her answer comes after the reason, so she reads it first. A white card on the pearl page (JAM-327). */}
      <div className="flex max-w-2xl flex-wrap gap-3 rounded-carte bg-blanc px-6 py-6 md:px-8">
        <AnswerFooter
          request={request}
          conversationId={conversationIds.get(request.id)}
          from="demande"
          now={now}
        />
        <Button asChild variant="raye">
          <Link href={PROFESSIONAL_REQUESTS_PATH}>{t.professionnelle.retour}</Link>
        </Button>
      </div>
    </SpaceShell>
  );
}
