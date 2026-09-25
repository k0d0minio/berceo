"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";

import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { notifyUrgentRequest } from "@/lib/demandes/notify";
import { FAMILY_REQUESTS_PATH, NEW_REQUEST_PATH, familyRequestPath } from "@/lib/demandes/paths";
import {
  cancelRequest,
  logWriteError,
  ownRequest,
  publishRequest,
  updateRequest,
  type PublishResult,
} from "@/lib/demandes/requests";
import { isChangeable } from "@/lib/demandes/rules";
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
 * words up.
 */

export type RequestState = {
  errors?: RequestErrors;
  message?: "generique" | "nonModifiable";
  /** What was typed, so a refused form keeps it. */
  values?: RequestInput;
};

/** This deployment's own address, so the e-mails of a UAT request point at UAT. */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

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

  let result: PublishResult;
  try {
    result = await publishRequest(user.id, checked.values, urgent, now);
  } catch (error) {
    logWriteError("request not published", { userId: user.id }, error);
    return { message: "generique", values: input };
  }

  if (!result.ok) {
    if (result.reason === "commune") redirect(`${PROFILE_PATH}?completer=1`);
    return { errors: { date: "doublon" }, values: input };
  }

  if (urgent) {
    const origin = await siteOrigin();
    const id = result.id;
    // After the response: the family sees her request at once, the e-mails follow.
    after(() => notifyUrgentRequest(id, origin));
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
  if (!isChangeable(existing, now)) return { message: "nonModifiable", values: input };

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

  revalidatePath(SPACES.parent, "layout");
  redirect(
    `${familyRequestPath(existing.id)}?${result === "ok" ? "annulee=1" : "erreur=nonModifiable"}`,
  );
}
