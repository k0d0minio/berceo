import type { Metadata } from "next";
import Link from "next/link";

import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import {
  FAMILY_REQUESTS_PATH,
  NEW_REQUEST_PATH,
  NEW_URGENT_REQUEST_PATH,
  familyRequestPath,
} from "@/lib/demandes/paths";
import { familyRequests } from "@/lib/demandes/requests";
import { displayStatus, isChangeable } from "@/lib/demandes/rules";
import { pendingCounts } from "@/lib/reservations/answers";
import { answersCount } from "@/lib/reservations/format";

const t = words(demandes);

export const metadata: Metadata = {
  title: t.meta.liste,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Mes demandes »: the ones she can still change first, by night, then the
 * booked, cancelled and past ones. An open request shows how many answers wait
 * on it (« 2 réponses »).
 */
export default async function MesDemandesPage() {
  const user = await requireAccess(FAMILY_REQUESTS_PATH);
  const now = new Date();
  const [requests, counts] = await Promise.all([familyRequests(user.id, now), pendingCounts(user.id)]);

  return (
    <SpaceShell user={user} title={t.famille.titre}>
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
          {requests.map((request) => (
            <li key={request.id}>
              <RequestCard
                request={request}
                status={displayStatus(request, now)}
                href={familyRequestPath(request.id)}
                note={
                  isChangeable(request, now) && counts.get(request.id)
                    ? answersCount(counts.get(request.id) ?? 0)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </SpaceShell>
  );
}
