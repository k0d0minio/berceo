"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";

import { requireAccess } from "@/lib/auth/guard";
import { siteOrigin } from "@/lib/site-origin";
import { SPACES } from "@/lib/auth/routing";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { notifyUrgentRequest } from "@/lib/demandes/notify";
import { FAMILY_REQUESTS_PATH, NEW_REQUEST_PATH, familyRequestPath } from "@/lib/demandes/paths";
import {
  cancelRequest,
  logWriteError,
  ownRequest,
  publishRequest,
  setPriority,
  updateRequest,
  UUID,
  type PublishResult,
} from "@/lib/demandes/requests";
import { isEditable } from "@/lib/demandes/rules";
import { pendingCounts, republishRequest, type RepublishResult } from "@/lib/reservations/answers";
import { PAYMENT_RETURN_PATH } from "@/lib/paiements/paths";
import { startCheckout, type StartResult } from "@/lib/paiements/payments";
import { notifyDeclined, notifyPriority } from "@/lib/reservations/notify";
import { priorityPath } from "@/lib/reservations/paths";
import { publicProfile } from "@/lib/reservations/profiles";
import {
  readRequestForm,
  validateRequest,
  type RequestErrors,
  type RequestInput,
} from "@/lib/demandes/validation";

/*
 * The family's request actions. The user is the session's, never the form's:
 * `requireAccess` answers for a parent and sends anyone else away, and every
 * write is scoped to her own rows, so an id that is not hers changes nothing
 * and reads as not found. Messages are catalogue keys; the form looks the
 * words up. Ids bound on a page are lookup keys only, checked again here (a
 * bound argument can be rewritten by the caller). The e-mails a write owes go
 * after the response (`after()`), so a failed send never undoes the write.
 */

export type RequestState = {
  errors?: RequestErrors;
  message?: "generique" | "nonModifiable";
  /** What was typed, so a refused form keeps it. */
  values?: RequestInput;
};

export async function publishRequestAction(
  _previous: RequestState,
  form: FormData,
): Promise<RequestState> {
  const user = await requireAccess(NEW_REQUEST_PATH);
  // Which form she posted: the urgent one only accepts tonight or tomorrow
  // night, the normal one only later nights, so the flag cannot widen either.
  const urgent = form.get("urgente") === "1";
  const now = new Date();

  const input = readRequestForm(form);
  const checked = validateRequest(input, { urgent, now, publishing: true });
  if (!checked.ok) return { errors: checked.errors, values: input };

  // Published from a professional's profile: she must still be validated (D-71).
  const priorityId = String(form.get("priorite") ?? "");
  const priority = priorityId ? await publicProfile(priorityId) : null;
  if (priorityId && !priority) return { message: "generique", values: input };

  let result: PublishResult;
  try {
    result = await publishRequest(user.id, checked.values, urgent, now, priority?.id ?? null);
  } catch (error) {
    logWriteError("request not published", { userId: user.id }, error);
    return { message: "generique", values: input };
  }

  if (!result.ok) {
    if (result.reason === "commune") redirect(`${PROFILE_PATH}?completer=1`);
    return { errors: { date: "doublon" }, values: input };
  }

  if (urgent || priority) {
    const origin = await siteOrigin();
    const id = result.id;
    // After the response: the family sees her request at once, the e-mails follow.
    after(async () => {
      if (urgent) await notifyUrgentRequest(id, origin);
      if (priority) await notifyPriority(id, origin);
    });
  }

  revalidatePath(SPACES.parent, "layout");
  redirect(`${familyRequestPath(result.id)}?publiee=${urgent ? "urgente" : "1"}`);
}

export async function updateRequestAction(
  _previous: RequestState,
  form: FormData,
): Promise<RequestState> {
  const user = await requireAccess(FAMILY_REQUESTS_PATH);
  const id = String(form.get("id") ?? "");
  const existing = await ownRequest(user.id, id);
  if (!existing) notFound();

  const now = new Date();
  const input = readRequestForm(form);
  // An answer waiting on it locks it (D-76).
  const pending = (await pendingCounts(user.id)).get(existing.id) ?? 0;
  if (!isEditable(existing, pending, now)) return { message: "nonModifiable", values: input };

  // The urgency is the stored one: an edit never turns one kind into the other.
  // The stored night may stay as it is; a new one must be in today's window.
  const checked = validateRequest(input, {
    urgent: existing.urgent,
    now,
    publishing: false,
    storedDate: existing.nightDate,
  });
  if (!checked.ok) return { errors: checked.errors, values: input };

  let result: Awaited<ReturnType<typeof updateRequest>>;
  try {
    result = await updateRequest(user.id, id, checked.values, now);
  } catch (error) {
    logWriteError("request not updated", { userId: user.id, requestId: id }, error);
    return { message: "generique", values: input };
  }
  if (result === "doublon") return { errors: { date: "doublon" }, values: input };
  if (result === "nonModifiable") return { message: "nonModifiable", values: input };

  revalidatePath(SPACES.parent, "layout");
  redirect(`${familyRequestPath(id)}?modifiee=1`);
}

export async function cancelRequestAction(id: string): Promise<void> {
  const user = await requireAccess(FAMILY_REQUESTS_PATH);
  // The id is only a lookup key: the write is scoped to her own open request.
  const existing = await ownRequest(user.id, String(id));
  if (!existing) notFound();

  let result: Awaited<ReturnType<typeof cancelRequest>>;
  try {
    result = await cancelRequest(user.id, existing.id, new Date());
  } catch (error) {
    logWriteError("request not cancelled", { userId: user.id, requestId: existing.id }, error);
    redirect(`${familyRequestPath(existing.id)}?erreur=generique`);
  }

  // The answers that waited on it are declined; each professional is told (D-76).
  if (result.declined.length > 0) {
    const origin = await siteOrigin();
    const declined = result.declined;
    after(() => notifyDeclined(declined, origin));
  }

  revalidatePath(SPACES.parent, "layout");
  redirect(
    `${familyRequestPath(existing.id)}?${result.result === "ok" ? "annulee=1" : "erreur=nonModifiable"}`,
  );
}

/**
 * « Accepter et réserver », confirmed in the summary: opens the fee's Stripe
 * Checkout and sends her there (D-90). Nothing is booked here: the payment
 * books when Stripe reports it, through the webhook or the return page. A
 * refusal reads today's message; an earlier Checkout found paid is confirmed
 * instead of opening a second one.
 */
export async function acceptAnswerAction(requestId: string, applicationId: string): Promise<void> {
  const user = await requireAccess(FAMILY_REQUESTS_PATH);
  const id = String(requestId);
  if (!UUID.test(id)) notFound();

  let result: StartResult;
  try {
    result = await startCheckout({
      user: { id: user.id, email: user.email },
      requestId: id,
      applicationId: String(applicationId),
      siteUrl: await siteOrigin(),
      now: new Date(),
    });
  } catch (error) {
    logWriteError("checkout not opened", { userId: user.id, requestId: id }, error);
    redirect(`${familyRequestPath(id)}?paiement=erreur`);
  }

  if (result.kind === "stripe") redirect(result.url);
  if (result.kind === "dejaPaye") {
    redirect(`${PAYMENT_RETURN_PATH}?session_id=${encodeURIComponent(result.sessionId)}`);
  }
  // Its own key: « nonModifiable » here is about booking, not about editing.
  if (result.kind === "refus") redirect(`${familyRequestPath(id)}?refus=${result.reason}`);
  redirect(`${familyRequestPath(id)}?paiement=erreur`);
}

/**
 * « Republier ma demande » (D-70): the waiting answers are declined and told,
 * and the request goes out again: an urgent one by e-mail at once, a normal
 * one in the next digest.
 */
export async function republishRequestAction(requestId: string): Promise<void> {
  const user = await requireAccess(FAMILY_REQUESTS_PATH);
  const id = String(requestId);
  if (!UUID.test(id)) notFound();

  let result: RepublishResult;
  try {
    result = await republishRequest(user.id, id, new Date());
  } catch (error) {
    logWriteError("request not republished", { userId: user.id, requestId: id }, error);
    redirect(`${familyRequestPath(id)}?erreur=generique`);
  }

  if (!result.ok) redirect(`${familyRequestPath(id)}?refus=republication`);

  const origin = await siteOrigin();
  const { urgent, declined } = result;
  after(async () => {
    await notifyDeclined(declined, origin);
    if (urgent) await notifyUrgentRequest(id, origin);
  });

  revalidatePath(SPACES.parent, "layout");
  redirect(`${familyRequestPath(id)}?republiee=1`);
}

/** « Lui envoyer cette demande »: one of her open requests, sent in priority to a validated professional (D-71). */
export async function sendInPriorityAction(profileId: string, requestId: string): Promise<void> {
  const user = await requireAccess(FAMILY_REQUESTS_PATH);
  const profile = String(profileId);
  const id = String(requestId);
  if (!UUID.test(profile) || !UUID.test(id)) notFound();

  let result: Awaited<ReturnType<typeof setPriority>>;
  try {
    result = await setPriority(user.id, id, profile, new Date());
  } catch (error) {
    logWriteError("priority not set", { userId: user.id, requestId: id }, error);
    redirect(`${priorityPath(profile)}?erreur=1`);
  }

  if (result !== "ok") redirect(`${priorityPath(profile)}?erreur=1`);

  const origin = await siteOrigin();
  after(() => notifyPriority(id, origin));

  revalidatePath(SPACES.parent, "layout");
  redirect(`${priorityPath(profile)}?envoyee=1`);
}
