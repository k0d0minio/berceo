import "server-only";

import { formatDate } from "@/lib/demandes/format";
import { sendEmail } from "@/lib/email/send";
import { newMessageEmail } from "@/lib/email/templates";

import { messageNotice } from "./conversations";
import { conversationPath } from "./paths";

/**
 * The e-mail of a new message (E-03, D-90): to the other party, once per
 * message, with who wrote and the night but never the text. It runs after the
 * response (`after()`), only when the send action actually inserted the
 * message, and carries the message's id as its idempotency key, so a retry
 * never sends twice; a failed send is logged with ids only and never undoes
 * the message. The link points at the deployment that sent it.
 */
export async function notifyNewMessage(messageId: string, siteUrl: string): Promise<void> {
  try {
    const notice = await messageNotice(messageId);
    if (!notice) return;
    await sendEmail(
      notice.recipient.email,
      newMessageEmail({
        siteUrl,
        prenom: notice.recipient.firstName,
        auteur: notice.senderFirstName,
        date: formatDate(notice.nightDate),
        url: `${siteUrl}${conversationPath(notice.recipient.side, notice.conversationId)}`,
      }),
      `message-${messageId}`,
    );
  } catch (error) {
    console.error("[messagerie] new-message e-mail not sent", {
      messageId,
      error: error instanceof Error ? error.name : typeof error,
    });
  }
}
