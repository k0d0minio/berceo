import Link from "next/link";

import { NoteDisplay } from "@/components/avis/stars";
import { Button } from "@/components/ui/button";
import { avis } from "@/content/avis";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import type { ProfessionalRequest } from "@/lib/demandes/requests";
import { conversationPath } from "@/lib/messagerie/paths";
import { canWithdraw } from "@/lib/reservations/rules";

import { answerRequestAction, withdrawAnswerAction } from "./actions";

/*
 * What her list and a request's page share (demande-motif-facultatif): the
 * notice an answer comes back with, and the card's footer. The footer holds the
 * family's note, then « Je suis disponible pour cette garde », or, once she
 * answered, the conversation and « Retirer ma disponibilité ». `from` tells the
 * action where to send her back.
 */

const r = words(reservations).professionnelle;
const c = words(comptes);
const m = words(messagerie);

export type AnswerNotice = { repondu?: string; retiree?: string; erreur?: string };

export function answerNotice(notice: AnswerNotice): string | null {
  if (notice.repondu === "1") return r.confirmation;
  if (notice.retiree === "1") return r.retiree;
  const error = notice.erreur;
  if (error && Object.hasOwn(r.erreurs, error)) return r.erreurs[error as keyof typeof r.erreurs];
  if (error) return c.erreurs.generique;
  return null;
}

export function AnswerFooter({
  request,
  conversationId,
  from,
  now,
}: {
  request: ProfessionalRequest;
  conversationId: string | undefined;
  from: "liste" | "demande";
  now: Date;
}) {
  const answered = request.answer === "en_attente";
  return (
    <>
      <NoteDisplay note={request.family} label={words(avis).note.famille} className="w-full" />
      {answered ? (
        <>
          {conversationId ? (
            <Button asChild>
              <Link href={conversationPath("professionnelle", conversationId)} prefetch={false}>
                {m.liens.voir}
              </Link>
            </Button>
          ) : null}
          {canWithdraw(request.answer, request, now) ? (
            <form action={withdrawAnswerAction.bind(null, request.id, from)}>
              <Button type="submit" variant="raye">
                {r.retirer}
              </Button>
            </form>
          ) : null}
        </>
      ) : (
        <form action={answerRequestAction.bind(null, request.id, from)}>
          <Button type="submit">{r.disponible}</Button>
        </form>
      )}
    </>
  );
}
