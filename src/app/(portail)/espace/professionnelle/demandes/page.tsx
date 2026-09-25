import type { Metadata } from "next";

import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { PROFESSIONAL_REQUESTS_PATH } from "@/lib/demandes/paths";
import { professionalRequests } from "@/lib/demandes/requests";

const t = words(demandes);

export const metadata: Metadata = {
  title: t.meta.professionnelle,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The open requests in the communes she serves, urgent first, then newest
 * first (D-10, D-11). Only a validated profile sees them; the card carries the
 * commune, the night and the children, never the family (D-15). Answering a
 * request comes with candidature-et-reservation.
 */
export default async function DemandesProfessionnellePage() {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const view = await professionalRequests(user.id);

  return (
    <SpaceShell user={user} title={t.professionnelle.titre}>
      {!view.validated ? (
        <p className="max-w-2xl text-intro text-taupe">{t.professionnelle.nonValide}</p>
      ) : (
        <>
          <p className="max-w-2xl text-intro text-taupe">{t.professionnelle.intro}</p>
          {view.requests.length === 0 ? (
            <p className="max-w-2xl text-corps text-taupe">{t.professionnelle.vide}</p>
          ) : (
            <ul className="grid max-w-4xl gap-6 md:grid-cols-2">
              {view.requests.map((request) => (
                <li key={request.id}>
                  <RequestCard request={request} showPublished />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </SpaceShell>
  );
}
