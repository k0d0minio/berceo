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
import { canWithdraw, type SeriesAnswerState } from "@/lib/reservations/rules";

import { answerRequestAction, answerSeriesAction, withdrawAnswerAction, withdrawSeriesAction } from "./actions";

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

/**
 * The footer of a regular request answered as one (JAM-302): the family's
 * note, then « Je suis disponible pour toutes les nuits », or, once she
 * answered, the conversation and « Retirer ma disponibilité ». When she cannot
 * take every night (Q5), a line says why, and there is no button.
 */
export function SeriesAnswerFooter({
  request,
  seriesId,
  state,
  conversationId,
  from,
}: {
  /** The first night: the family's note and the way back. */
  request: ProfessionalRequest;
  seriesId: string;
  state: SeriesAnswerState;
  conversationId: string | undefined;
  from: "liste" | "demande";
}) {
  return (
    <>
      <NoteDisplay note={request.family} label={words(avis).note.famille} className="w-full" />
      {state === "repondu" ? (
        <>
          {conversationId ? (
            <Button asChild>
              <Link href={conversationPath("professionnelle", conversationId)} prefetch={false}>
                {m.liens.voir}
              </Link>
            </Button>
          ) : null}
          <form action={withdrawSeriesAction.bind(null, seriesId, request.id, from)}>
            <Button type="submit" variant="raye">
              {r.retirer}
            </Button>
          </form>
        </>
      ) : state === "repondre" ? (
        <form action={answerSeriesAction.bind(null, seriesId, request.id, from)}>
          <Button type="submit">{r.disponibleSerie}</Button>
        </form>
      ) : (
        <p className="w-full text-corps text-taupe">{r.serieIndisponible}</p>
      )}
    </>
  );
}
