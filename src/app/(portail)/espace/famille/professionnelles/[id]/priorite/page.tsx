import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { NEW_REQUEST_PATH, NEW_URGENT_REQUEST_PATH } from "@/lib/demandes/paths";
import { priorityCandidates } from "@/lib/demandes/requests";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { familyCommune } from "@/lib/famille/profile";
import { priorityPath, professionalProfilePath } from "@/lib/reservations/paths";
import { publicProfile } from "@/lib/reservations/profiles";

import { sendInPriorityAction } from "../../../demandes/actions";

const r = words(reservations);
const d = words(demandes);

export const metadata: Metadata = {
  title: r.meta.priorite,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Lui envoyer ma demande en priorité » (the guide, D-71): the guide's
 * message, then either one of her open requests never sent to anyone, or a new
 * request, normal or urgent, published for this professional. Nobody else waits:
 * the request stays on every serving professional's list. Without a commune in
 * her profile she is sent to complete it first, as the form does.
 */
export default async function PrioritePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ envoyee?: string; erreur?: string }>;
}) {
  const { id } = await params;
  const user = await requireAccess(priorityPath(id));
  const profile = await publicProfile(id);
  if (!profile) notFound();
  if (!(await familyCommune(user.id))) redirect(`${PROFILE_PATH}?completer=1`);

  const notice = await searchParams;
  const candidates = await priorityCandidates(user.id, profile.id);
  const pour = `pour=${profile.id}`;

  return (
    <SpaceShell user={user} title={r.meta.priorite}>
      {notice.envoyee === "1" ? (
        <FormMessage>{fill(r.priorite.envoyee, { prenom: profile.firstName })}</FormMessage>
      ) : null}
      {notice.erreur ? <FormMessage>{r.priorite.erreur}</FormMessage> : null}
      <p className="max-w-2xl text-intro text-taupe">{fill(r.priorite.message, { prenom: profile.firstName })}</p>

      <section className="flex max-w-4xl flex-col gap-4">
        <h2 className="font-display text-h2 text-sauge">{r.priorite.choisir}</h2>
        {candidates.length === 0 ? (
          <p className="max-w-2xl text-corps text-taupe">{r.priorite.aucune}</p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {candidates.map((request) => (
              <li key={request.id}>
                <RequestCard
                  request={request}
                  footer={
                    <form action={sendInPriorityAction.bind(null, profile.id, request.id)}>
                      <Button type="submit">{r.priorite.envoyer}</Button>
                    </form>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex max-w-4xl flex-col gap-4">
        <h2 className="font-display text-h2 text-sauge">{r.priorite.nouvelle}</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`${NEW_REQUEST_PATH}?${pour}`}>{d.boutons.publier}</Link>
          </Button>
          <Button asChild variant="raye">
            <Link href={`${NEW_URGENT_REQUEST_PATH}&${pour}`}>{d.boutons.publierUrgente}</Link>
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="raye">
          <Link href={professionalProfilePath(profile.id)}>{r.famille.voirProfil}</Link>
        </Button>
      </div>
    </SpaceShell>
  );
}
