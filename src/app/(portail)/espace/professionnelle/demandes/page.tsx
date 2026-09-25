import type { Metadata } from "next";
import Link from "next/link";

import { FormMessage } from "@/components/auth/field";
import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { PROFESSIONAL_REQUESTS_PATH } from "@/lib/demandes/paths";
import { professionalRequests } from "@/lib/demandes/requests";
import { conversationsOfRequests } from "@/lib/messagerie/conversations";
import { conversationPath } from "@/lib/messagerie/paths";

import { answerRequestAction, withdrawAnswerAction } from "./actions";

const t = words(demandes);
const r = words(reservations).professionnelle;
const c = words(comptes);
const m = words(messagerie);

export const metadata: Metadata = {
  title: t.meta.professionnelle,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Notice = { repondu?: string; retiree?: string; erreur?: string };

function message(notice: Notice): string | null {
  if (notice.repondu === "1") return r.confirmation;
  if (notice.retiree === "1") return r.retiree;
  const error = notice.erreur;
  if (error && Object.hasOwn(r.erreurs, error)) return r.erreurs[error as keyof typeof r.erreurs];
  if (error) return c.erreurs.generique;
  return null;
}

/*
 * Her list (D-10, D-11): the open requests in the communes she serves, and
 * those sent to her « en priorité » wherever they are (D-71), priority first,
 * then urgent, then newest. Each card carries her rate (the DA's price line)
 * and « Je suis disponible pour cette garde », or, once she answered, « Vous
 * avez répondu » and « Retirer ma disponibilité ». Declined requests and
 * nights she is booked for are gone (D-73). Nothing about the family (D-15).
 */
export default async function DemandesProfessionnellePage({
  searchParams,
}: {
  searchParams: Promise<Notice>;
}) {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const view = await professionalRequests(user.id);
  const notice = message(await searchParams);
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
              {view.requests.map((request) => {
                const answered = request.answer === "en_attente";
                return (
                  <li key={request.id} id={`demande-${request.id}`} className="scroll-mt-24">
                    <RequestCard
                      request={request}
                      showPublished
                      priority={request.priority}
                      rate={view.nightRateEur}
                      note={answered ? r.repondu : undefined}
                      footer={
                        answered ? (
                          <>
                            {conversationIds.has(request.id) ? (
                              <Button asChild>
                                <Link href={conversationPath("professionnelle", conversationIds.get(request.id)!)} prefetch={false}>
                                  {m.liens.voir}
                                </Link>
                              </Button>
                            ) : null}
                            <form action={withdrawAnswerAction.bind(null, request.id)}>
                              <Button type="submit" variant="raye">
                                {r.retirer}
                              </Button>
                            </form>
                          </>
                        ) : (
                          <form action={answerRequestAction.bind(null, request.id)}>
                            <Button type="submit">{r.disponible}</Button>
                          </form>
                        )
                      }
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </SpaceShell>
  );
}
