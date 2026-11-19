import type { Metadata } from "next";
import Link from "next/link";

import { FormMessage } from "@/components/auth/field";
import { CancelRequest } from "@/components/demandes/cancel-request";
import { RequestCard } from "@/components/demandes/request-card";
import { SeriesCard } from "@/components/demandes/series-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import {
  FAMILY_REQUESTS_PATH,
  NEW_REQUEST_PATH,
  NEW_URGENT_REQUEST_PATH,
  familyRequestPath,
} from "@/lib/demandes/paths";
import { familyRequests, type ListedRequest } from "@/lib/demandes/requests";
import { displayStatus, isChangeable } from "@/lib/demandes/rules";
import { groupForList } from "@/lib/demandes/series";
import { pendingCounts } from "@/lib/reservations/answers";
import { answersCount } from "@/lib/reservations/format";

import { cancelSeriesAction } from "./actions";

const t = words(demandes);
const c = words(comptes);

export const metadata: Metadata = {
  title: t.meta.liste,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Notice = { publiees?: string; annulees?: string; erreur?: string };

function message(notice: Notice): string | null {
  if (notice.publiees && /^\d+$/.test(notice.publiees)) return fill(t.confirmations.publiees, { n: notice.publiees });
  if (notice.annulees) return t.confirmations.annulees;
  if (notice.erreur === "nonModifiable") return t.erreurs.nonModifiable;
  if (notice.erreur) return c.erreurs.generique;
  return null;
}

/*
 * « Mes demandes »: the ones she can still change first, by night, then the
 * booked, cancelled and past ones. An open request shows how many answers wait
 * on it (« 2 réponses »). Regular nights (demande-nuits-regulieres) read as one
 * card in the place of their first night, with each night's state, and
 * « Annuler toutes les nuits » while one of them is open.
 */
export default async function MesDemandesPage({ searchParams }: { searchParams: Promise<Notice> }) {
  const query = await searchParams;
  const user = await requireAccess(withQuery(FAMILY_REQUESTS_PATH, query));
  const now = new Date();
  const [requests, counts] = await Promise.all([familyRequests(user.id, now), pendingCounts(user.id)]);
  const notice = message(query);

  function noteOf(request: ListedRequest): string | undefined {
    return isChangeable(request, now) && counts.get(request.id) ? answersCount(counts.get(request.id) ?? 0) : undefined;
  }

  return (
    <SpaceShell user={user} title={t.famille.titre}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      <p className="max-w-2xl text-intro text-taupe">{t.famille.intro}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={NEW_REQUEST_PATH}>{t.boutons.publier}</Link>
        </Button>
        <Button asChild variant="raye">
          <Link href={NEW_URGENT_REQUEST_PATH}>{t.boutons.publierUrgente}</Link>
        </Button>
      </div>
      {requests.length === 0 ? (
        <p className="max-w-2xl text-corps text-taupe">{t.famille.vide}</p>
      ) : (
        <ul className="grid max-w-4xl gap-6 md:grid-cols-2">
          {groupForList(requests).map((entry) =>
            entry.kind === "nuit" ? (
              <li key={entry.request.id}>
                <RequestCard
                  request={entry.request}
                  status={displayStatus(entry.request, now)}
                  href={familyRequestPath(entry.request.id)}
                  note={noteOf(entry.request)}
                />
              </li>
            ) : (
              <li key={entry.seriesId}>
                <SeriesCard
                  nights={entry.requests.map((request) => ({
                    request,
                    status: displayStatus(request, now),
                    href: familyRequestPath(request.id),
                    note: noteOf(request),
                  }))}
                  footer={
                    entry.requests.some((request) => isChangeable(request, now)) ? (
                      <CancelRequest serie onCancel={cancelSeriesAction.bind(null, entry.seriesId)} />
                    ) : undefined
                  }
                />
              </li>
            ),
          )}
        </ul>
      )}
    </SpaceShell>
  );
}
