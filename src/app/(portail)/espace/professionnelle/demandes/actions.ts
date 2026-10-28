"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { PROFESSIONAL_REQUESTS_PATH, professionalRequestPath } from "@/lib/demandes/paths";
import { logWriteError, UUID } from "@/lib/demandes/requests";
import { requireAccess } from "@/lib/auth/guard";
import { answerRequest, withdrawAnswer, type AnswerResult } from "@/lib/reservations/answers";
import { notifyNewAnswer } from "@/lib/reservations/notify";
import { siteOrigin } from "@/lib/site-origin";

/*
 * The professional's two answers to a request: « Je suis disponible pour cette
 * garde » and « Retirer ma disponibilité ». The user is the session's; the
 * request id is only a lookup key, bound on the page and checked again here
 * (a bound argument can be rewritten by the caller). Every rule is held by the
 * write itself. The page reads the outcome from the query string: her list, at
 * the request's card, or the request's own page when she answered from there
 * (`from` is `demande`, demande-motif-facultatif).
 */

/** Where an answer sends her back: the request's page, or her list at its card. */
function back(id: string, from: string, query: string): string {
  if (from === "demande" && UUID.test(id)) return `${professionalRequestPath(id)}?${query}`;
  return `${PROFESSIONAL_REQUESTS_PATH}?${query}#demande-${id}`;
}

export async function answerRequestAction(requestId: string, from: string = "liste"): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const id = String(requestId);
  const origin = String(from);

  let result: AnswerResult;
  try {
    result = await answerRequest(user.id, id, new Date());
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
