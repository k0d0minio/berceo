"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { requireAccess } from "@/lib/auth/guard";
import { logWriteError, UUID } from "@/lib/demandes/requests";
import { siteOrigin } from "@/lib/site-origin";

import { sendMessage } from "./conversations";
import { notifyNewMessage } from "./notify";
import { conversationPath } from "./paths";
import { normalizeBody, type Side } from "./rules";

/*
 * « Envoyer » (E-01). The side and the conversation are bound on the page and
 * checked again here (a bound argument can be rewritten by the caller): the
 * guard refuses a side that is not the session's own space, and `sendMessage`
 * holds the party and the closing rule in its write. The message's id comes
 * from the form, so a retried or double-clicked send inserts once and sends
 * one e-mail (D-90); the e-mail leaves after the response, only for a message
 * this call inserted.
 */

export type SendState = {
  /** The id of the last message this form sent: the composer clears itself on it. */
  sent?: string;
  error?: "vide" | "tropLong" | "fermee" | "generique";
};

export async function sendMessageAction(
  side: Side,
  conversationId: string,
  _state: SendState,
  form: FormData,
): Promise<SendState> {
  const s: Side = side === "professionnelle" ? "professionnelle" : "famille";
  const id = String(conversationId);
  const path = conversationPath(s, id);
  const user = await requireAccess(path);

  // The browser's id; a form posted without one (its script not yet run) gets one here.
  const given = String(form.get("messageId") ?? "");
  const messageId = UUID.test(given) ? given : crypto.randomUUID();
  const body = normalizeBody(String(form.get("message") ?? ""));
  if (!body.ok) return { error: body.reason };

  let result: Awaited<ReturnType<typeof sendMessage>>;
  try {
    result = await sendMessage(user.id, s, id, messageId, body.body, new Date());
  } catch (error) {
    logWriteError("message not sent", { userId: user.id, conversationId: id }, error);
    return { error: "generique" };
  }

  if (!result.ok) return { error: result.reason === "fermee" ? "fermee" : "generique" };

  if (result.inserted) {
    const origin = await siteOrigin();
    after(() => notifyNewMessage(messageId, origin));
  }

  revalidatePath(path);
  return { sent: messageId };
}
