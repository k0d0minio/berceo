"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { PROFESSIONAL_REQUESTS_PATH } from "@/lib/demandes/paths";
import { logWriteError } from "@/lib/demandes/requests";
import { requireAccess } from "@/lib/auth/guard";
import { answerRequest, withdrawAnswer, type AnswerResult } from "@/lib/reservations/answers";
import { notifyNewAnswer } from "@/lib/reservations/notify";
import { siteOrigin } from "@/lib/site-origin";

/*
 * The professional's two answers to a request: « Je suis disponible pour cette
 * garde » and « Retirer ma disponibilité ». The user is the session's; the
 * request id is only a lookup key, bound on the page and checked again here
 * (a bound argument can be rewritten by the caller). Every rule is held by the
 * write itself. The page reads the outcome from the query string.
 */

export async function answerRequestAction(requestId: string): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const id = String(requestId);

  let result: AnswerResult;
  try {
    result = await answerRequest(user.id, id, new Date());
  } catch (error) {
    logWriteError("answer not recorded", { userId: user.id, requestId: id }, error);
    redirect(`${PROFESSIONAL_REQUESTS_PATH}?erreur=generique`);
  }

  if (!result.ok) redirect(`${PROFESSIONAL_REQUESTS_PATH}?erreur=${result.reason}`);

  const origin = await siteOrigin();
  const { applicationId, answerCount } = result;
  // After the response: she sees her confirmation at once, the family's e-mail follows.
  after(() => notifyNewAnswer(applicationId, answerCount, origin));

  revalidatePath(PROFESSIONAL_REQUESTS_PATH);
  redirect(`${PROFESSIONAL_REQUESTS_PATH}?repondu=1#demande-${id}`);
}

export async function withdrawAnswerAction(requestId: string): Promise<void> {
  const user = await requireAccess(PROFESSIONAL_REQUESTS_PATH);
  const id = String(requestId);

  let withdrawn: boolean;
  try {
    withdrawn = await withdrawAnswer(user.id, id, new Date());
  } catch (error) {
    logWriteError("answer not withdrawn", { userId: user.id, requestId: id }, error);
    redirect(`${PROFESSIONAL_REQUESTS_PATH}?erreur=generique`);
  }

  revalidatePath(PROFESSIONAL_REQUESTS_PATH);
  redirect(`${PROFESSIONAL_REQUESTS_PATH}?${withdrawn ? "retiree=1" : "erreur=retrait"}#demande-${id}`);
}
