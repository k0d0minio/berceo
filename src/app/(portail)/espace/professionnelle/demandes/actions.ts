"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { PROFESSIONAL_REQUESTS_PATH, professionalRequestPath } from "@/lib/demandes/paths";
import { logWriteError, UUID } from "@/lib/demandes/requests";
import { requireAccess } from "@/lib/auth/guard";
import {
  answerRequest,
  answerSeries,
  changeProposal,
  changeSeriesProposals,
  withdrawAnswer,
  withdrawSeries,
  type AnswerResult,
  type ChangeResult,
  type SeriesAnswerResult,
} from "@/lib/reservations/answers";
import { notifyNewAnswer, notifyProposalChanged } from "@/lib/reservations/notify";
import { proposalField } from "@/lib/reservations/rules";
import { siteOrigin } from "@/lib/site-origin";

/*
 * The professional's two answers to a request: « Je suis disponible pour cette
 * garde » and « Retirer ma disponibilité ». The user is the session's; the
 * request id is only a lookup key, bound on the page and checked again here
 * (a bound argument can be rewritten by the caller). Every rule is held by the
 * write itself. The page reads the outcome from the query string: her list, at
 * the request's card, or the request's own page when she answered from there
 * (`from` is `demande`, demande-motif-facultatif). The answer's form can carry
 * a start she proposes for a night in place of the family's (JAM-306), in the
 * field `heure-<request id>`: the write reads it again and refuses a value
 * that is not a half hour of the request's range. While her answer waits, the
 * same field changes or removes her proposal in place (JAM-349): the family is
 * told with an e-mail of its own, one time for each change, with each night
 * that changed.
 */

/** Her proposed start for one night, from the answer's form: the field's text, or null. */
function proposalOf(form: FormData | undefined, requestId: string): string | null {
  const value = form?.get(proposalField(requestId));
  return typeof value === "string" && value !== "" ? value : null;
}

/** Her proposed starts for the nights of a regular request, by request id. */
function proposalsOf(form: FormData | undefined): Map<string, string> {
  const proposals = new Map<string, string>();
  if (!form) return proposals;
  const prefix = proposalField("");
  for (const [name, value] of form.entries()) {
    if (!name.startsWith(prefix) || typeof value !== "string" || value === "") continue;
    const id = name.slice(prefix.length);
    if (UUID.test(id)) proposals.set(id, value);
  }
  return proposals;
}


/** Where an answer sends her back: the request's page, or her list at its card. */
function back(id: string, from: string, query: string): string {
  if (from === "demande" && UUID.test(id)) return `${professionalRequestPath(id)}?${query}`;
  return `${PROFESSIONAL_REQUESTS_PATH}?${query}#demande-${id}`;
}

export async function answerRequestAction(requestId: string, from: string = "liste", form?: FormData): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const id = String(requestId);
  const origin = String(from);

  let result: AnswerResult;
  try {
    result = await answerRequest(user.id, id, new Date(), proposalOf(form instanceof FormData ? form : undefined, id));
  } catch (error) {
    logWriteError("answer not recorded", { userId: user.id, requestId: id }, error);
    redirect(back(id, origin, "erreur=generique"));
  }

  if (!result.ok) redirect(back(id, origin, `erreur=${result.reason}`));

  const site = await siteOrigin();
  const { applicationId, answerCount } = result;
  // After the response: she sees her confirmation at once, the family's e-mail follows.
  after(() => notifyNewAnswer(applicationId, answerCount, site));

  revalidatePath(PROFESSIONAL_REQUESTS_PATH, "layout");
  redirect(back(id, origin, "repondu=1"));
}

export async function withdrawAnswerAction(requestId: string, from: string = "liste"): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const id = String(requestId);
  const origin = String(from);

  let withdrawn: boolean;
  try {
    withdrawn = await withdrawAnswer(user.id, id, new Date());
  } catch (error) {
    logWriteError("answer not withdrawn", { userId: user.id, requestId: id }, error);
    redirect(back(id, origin, "erreur=generique"));
  }

  revalidatePath(PROFESSIONAL_REQUESTS_PATH, "layout");
  redirect(back(id, origin, withdrawn ? "retiree=1" : "erreur=retrait"));
}

/**
 * « Je suis disponible pour toutes les nuits » on a regular request (JAM-302):
 * one answer for all its open nights. `requestId` is the night her card or page
 * stands for, for the way back.
 */
export async function answerSeriesAction(
  seriesId: string,
  requestId: string,
  from: string = "liste",
  form?: FormData,
): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const series = String(seriesId);
  const id = String(requestId);
  const origin = String(from);

  let result: SeriesAnswerResult;
  try {
    result = await answerSeries(user.id, series, new Date(), proposalsOf(form instanceof FormData ? form : undefined));
  } catch (error) {
    logWriteError("series answer not recorded", { userId: user.id, seriesId: series }, error);
    redirect(back(id, origin, "erreur=generique"));
  }

  if (!result.ok) redirect(back(id, origin, `erreur=${result.reason}`));

  const site = await siteOrigin();
  const { applicationId, answerCount } = result;
  // One e-mail to the family, for the first night's answer: she reads the request whole.
  after(() => notifyNewAnswer(applicationId, answerCount, site));

  revalidatePath(PROFESSIONAL_REQUESTS_PATH, "layout");
  redirect(back(id, origin, "repondu=1"));
}

/** « Retirer ma disponibilité » on a regular request (JAM-302): every night at once. */
export async function withdrawSeriesAction(seriesId: string, requestId: string, from: string = "liste"): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const series = String(seriesId);
  const id = String(requestId);
  const origin = String(from);

  let withdrawn: boolean;
  try {
    withdrawn = await withdrawSeries(user.id, series, new Date());
  } catch (error) {
    logWriteError("series answer not withdrawn", { userId: user.id, seriesId: series }, error);
    redirect(back(id, origin, "erreur=generique"));
  }

  revalidatePath(PROFESSIONAL_REQUESTS_PATH, "layout");
  redirect(back(id, origin, withdrawn ? "retiree=1" : "erreur=retrait"));
}

/**
 * « Enregistrer l'heure de début » on her waiting answer (JAM-349): the start
 * she proposes for the night is changed, or removed when the field holds the
 * family's own start. No withdrawal and no new answer. The family reads
 * « [Prénom] a modifié l'heure de début proposée », with the new start.
 */
export async function changeProposalAction(requestId: string, from: string = "liste", form?: FormData): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const id = String(requestId);
  const origin = String(from);

  let result: ChangeResult;
  try {
    result = await changeProposal(user.id, id, new Date(), proposalOf(form instanceof FormData ? form : undefined, id));
  } catch (error) {
    logWriteError("proposed start not changed", { userId: user.id, requestId: id }, error);
    redirect(back(id, origin, "erreur=generique"));
  }

  if (!result.ok) redirect(back(id, origin, `erreur=${result.reason}`));

  const site = await siteOrigin();
  const { applicationId, answerCount, nights } = result;
  // The change moved the answer's count: this e-mail has its own key, and is sent one time.
  after(() => notifyProposalChanged(applicationId, answerCount, nights, false, site));

  revalidatePath(PROFESSIONAL_REQUESTS_PATH, "layout");
  redirect(back(id, origin, "modifie=1"));
}

/** The same on a regular request (JAM-302, JAM-349): the starts of all its nights, in one form and one write. */
export async function changeSeriesProposalsAction(
  seriesId: string,
  requestId: string,
  from: string = "liste",
  form?: FormData,
): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const series = String(seriesId);
  const id = String(requestId);
  const origin = String(from);

  let result: ChangeResult;
  try {
    result = await changeSeriesProposals(
      user.id,
      series,
      new Date(),
      proposalsOf(form instanceof FormData ? form : undefined),
    );
  } catch (error) {
    logWriteError("series proposed starts not changed", { userId: user.id, seriesId: series }, error);
    redirect(back(id, origin, "erreur=generique"));
  }

  if (!result.ok) redirect(back(id, origin, `erreur=${result.reason}`));

  const site = await siteOrigin();
  const { applicationId, answerCount, nights } = result;
  // One e-mail to the family for the change, with each night that changed.
  after(() => notifyProposalChanged(applicationId, answerCount, nights, true, site));

  revalidatePath(PROFESSIONAL_REQUESTS_PATH, "layout");
  redirect(back(id, origin, "modifie=1"));
}
