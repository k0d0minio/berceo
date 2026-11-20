import type { ReactNode } from "react";
import Link from "next/link";

import { NoteDisplay } from "@/components/avis/stars";
import { Button } from "@/components/ui/button";
import { avis } from "@/content/avis";
import { comptes } from "@/content/comptes";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { reservations } from "@/content/reservations";
import { formatDate, formatTime } from "@/lib/demandes/format";
import type { ProfessionalRequest } from "@/lib/demandes/requests";
import { toHourMinute } from "@/lib/demandes/rules";
import { conversationPath } from "@/lib/messagerie/paths";
import type { SavedAnswer } from "@/lib/reservations/answers";
import { ownProposalLine, proposalOptions } from "@/lib/reservations/format";
import { adaptedNights, canWithdraw, proposalField, type SeriesAnswerState } from "@/lib/reservations/rules";

import {
  answerRequestAction,
  answerSeriesAction,
  changeProposalAction,
  changeSeriesProposalsAction,
  withdrawAnswerAction,
  withdrawSeriesAction,
} from "./actions";

/*
 * What her list and a request's page share (demande-motif-facultatif): the
 * notice an answer comes back with, and the card's footer. The footer holds the
 * family's note, then « Je suis disponible pour cette garde », or, once she
 * answered, the conversation and « Retirer ma disponibilité ». `from` tells the
 * action where to send her back. Above « Je suis disponible », « Proposer une
 * autre heure de début » opens one list for each night (JAM-306): the family's
 * own start is the first choice, so an answer she does not open is an answer
 * at the family's times. Once she answered, the same lists change or remove
 * her proposal in place while her answer waits (JAM-349): each list opens on
 * the start her answer holds, and one button saves all the nights.
 */

const r = words(reservations).professionnelle;
const c = words(comptes);
const m = words(messagerie);

const h = r.horaires;

/* The request form's select (`src/components/demandes/request-form.tsx`). */
const selectClasses =
  "flex min-h-12 w-full max-w-sm min-w-0 appearance-none rounded-capsule border border-solid border-input bg-blanc px-6 font-sans text-champ text-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge focus-visible:outline-none";

/**
 * The line of her own waiting proposal on a request of one night (JAM-306),
 * with where to change it; undefined when her answer proposes no other start,
 * or does not wait.
 */
export function ownProposal(
  request: ProfessionalRequest,
  saved: ReadonlyMap<string, SavedAnswer>,
): string | undefined {
  if (request.answer !== "en_attente") return undefined;
  const [night] = adaptedNights([
    {
      requestId: request.id,
      nightDate: request.nightDate,
      startTime: request.startTime,
      extraHours: request.extraHours,
      proposedStartTime: saved.get(request.id)?.proposedStartTime ?? null,
    },
  ]);
  return night ? `${ownProposalLine(night, false)} ${h.changer}` : undefined;
}

/** The start her waiting answer holds for a night, as a value of the list; empty for the family's own. */
function savedValue(night: ProfessionalRequest, saved: ReadonlyMap<string, SavedAnswer> | undefined): string {
  const proposed = saved?.get(night.id)?.proposedStartTime;
  if (!proposed || toHourMinute(proposed) === toHourMinute(night.startTime)) return "";
  return toHourMinute(proposed);
}

/**
 * « Proposer une autre heure de début » (JAM-306): closed by default. Each
 * night has its list of half hours, the family's own start first, each other
 * hour with the end it gives the night. With `saved`, the lists are those of
 * her waiting answer (JAM-349): each opens on the start the answer holds, the
 * family's own start removes the proposal, and `children` is the button that
 * saves, shown only when the lists are open.
 */
function ProposalFields({
  nights,
  saved,
  children,
}: {
  nights: readonly ProfessionalRequest[];
  /** What her waiting answers saved, by request id. Absent on an answer not given yet. */
  saved?: ReadonlyMap<string, SavedAnswer>;
  children?: ReactNode;
}) {
  const many = nights.length > 1;
  const changing = saved !== undefined;
  const proposedBefore = changing && nights.some((night) => savedValue(night, saved) !== "");
  return (
    <details className="w-full text-corps text-taupe">
      <summary className="w-fit cursor-pointer rounded-md font-semibold text-sauge underline underline-offset-4">
        {proposedBefore ? h.modifier : h.proposer}
      </summary>
      <div className="flex flex-col items-start gap-4 pt-3">
        <p className="text-legende">{changing ? h.aideModifier : h.aide}</p>
        {nights.map((night) => {
          const id = `champ-${proposalField(night.id)}`;
          return (
            <div key={night.id} className="flex w-full flex-col gap-2">
              <label htmlFor={id} className="text-legende font-semibold">
                {many
                  ? fill(h.champNuit, { date: formatDate(night.nightDate), heure: formatTime(night.startTime) })
                  : h.champ}
              </label>
              <select
                id={id}
                name={proposalField(night.id)}
                defaultValue={savedValue(night, saved)}
                className={selectClasses}
              >
                <option value="">{fill(h.demandee, { heure: formatTime(night.startTime) })}</option>
                {proposalOptions(night.startTime, night.extraHours).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        {children}
      </div>
    </details>
  );
}

export type AnswerNotice = { repondu?: string; retiree?: string; modifie?: string; erreur?: string };

export function answerNotice(notice: AnswerNotice): string | null {
  if (notice.repondu === "1") return r.confirmation;
  if (notice.retiree === "1") return r.retiree;
  if (notice.modifie === "1") return h.modifiee;
  const error = notice.erreur;
  if (error && Object.hasOwn(r.erreurs, error)) return r.erreurs[error as keyof typeof r.erreurs];
  if (error) return c.erreurs.generique;
  return null;
}

export function AnswerFooter({
  request,
  saved,
  conversationId,
  from,
  now,
}: {
  request: ProfessionalRequest;
  /** What her waiting answers saved, by request id: the start her answer holds (JAM-349). */
  saved?: ReadonlyMap<string, SavedAnswer>;
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
          {/* Her proposed start, changed or removed in place while her answer waits (JAM-349). */}
          {canWithdraw(request.answer, request, now) ? (
            <form action={changeProposalAction.bind(null, request.id, from)} className="w-full">
              <ProposalFields nights={[request]} saved={saved ?? new Map()}>
                <Button type="submit" variant="sauge">
                  {h.enregistrer}
                </Button>
              </ProposalFields>
            </form>
          ) : null}
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
        <form action={answerRequestAction.bind(null, request.id, from)} className="flex w-full flex-col items-start gap-4">
          <ProposalFields nights={[request]} />
          {/* The deck's filled sage capsule (slide 25, JAM-327). */}
          <Button type="submit" variant="sauge">
            {r.disponible}
          </Button>
        </form>
      )}
    </>
  );
}

/**
 * The footer of a regular request answered as one (JAM-302): the family's
 * note, then « Je suis disponible pour toutes les nuits », or, once she
 * answered, the lists of her proposed starts (JAM-349), the conversation and
 * « Retirer ma disponibilité ». When she cannot
 * take every night (Q5), a line says why, and there is no button.
 */
export function SeriesAnswerFooter({
  request,
  nights,
  saved,
  seriesId,
  state,
  conversationId,
  from,
}: {
  /** The first night: the family's note and the way back. */
  request: ProfessionalRequest;
  /** Every open night of the request, in night order: one proposed start for each (JAM-306). */
  nights?: readonly ProfessionalRequest[];
  /** What her waiting answers saved, by request id: the start her answer holds for a night (JAM-349). */
  saved?: ReadonlyMap<string, SavedAnswer>;
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
          {/* The proposed starts of all the nights, changed in one form while her answer waits (JAM-349). */}
          <form action={changeSeriesProposalsAction.bind(null, seriesId, request.id, from)} className="w-full">
            <ProposalFields nights={nights ?? [request]} saved={saved ?? new Map()}>
              <Button type="submit" variant="sauge">
                {h.enregistrer}
              </Button>
            </ProposalFields>
          </form>
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
        <form
          action={answerSeriesAction.bind(null, seriesId, request.id, from)}
          className="flex w-full flex-col items-start gap-4"
        >
          <ProposalFields nights={nights ?? [request]} />
          <Button type="submit" variant="sauge">
            {r.disponibleSerie}
          </Button>
        </form>
      ) : (
        <p className="w-full text-corps text-taupe">{r.serieIndisponible}</p>
      )}
    </>
  );
}
