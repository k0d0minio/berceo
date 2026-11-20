"use server";

import { headers } from "next/headers";

import { contact } from "@/content/contact";
import { fill, words } from "@/content/locale";
import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/email/templates";
import { countInWindow } from "@/lib/settings";

import { contactRecipient, limitSecret } from "./config";
import { CONTACT_LIMIT_PREFIX, limitKey, visitorAddress, windowExpiry, withinLimit } from "./rate-limit";
import { contactErrors, readContact, type ContactError, type ContactField } from "./rules";

/*
 * The contact form's server action (JAM-327). It sends one e-mail through
 * Resend to the address of `CONTACT_EMAIL`, with the writer's address in
 * `Reply-To`. Nothing is stored. The answer never holds the destination
 * address. A robot that fills the trap field gets the confirmation and no
 * e-mail leaves. A refused field or a failed send keeps what was typed.
 *
 * The send limit (JAM-341): 5 messages for each hour and each visitor
 * (`rate-limit.ts`). Only a message that can go is counted. The sixth is
 * refused and no e-mail leaves. The visitor's address is read from the request
 * and hashed with a key at once: it is never stored and never logged. If the
 * counter cannot be read, the limit stays closed: no e-mail leaves and the
 * form shows the failed send.
 */

export type ContactState = {
  sent?: boolean;
  failed?: boolean;
  limited?: boolean;
  errors?: Partial<Record<ContactField, ContactError>>;
  values?: { nom: string; email: string; message: string };
};

export async function sendContact(_state: ContactState, form: FormData): Promise<ContactState> {
  const { trap, ...input } = readContact(form);
  if (trap) return { sent: true };

  const errors = contactErrors(input);
  if (Object.keys(errors).length > 0) return { errors, values: input };

  const to = contactRecipient();
  if (!to) return { failed: true, values: input };

  try {
    const now = new Date();
    const count = await countInWindow({
      key: limitKey(visitorAddress(await headers()), limitSecret()),
      prefix: CONTACT_LIMIT_PREFIX,
      now,
      expiredAt: windowExpiry(now),
    });
    if (!withinLimit(count)) return { limited: true, values: input };
  } catch (error) {
    console.error("contact: the send limit was not read", error);
    return { failed: true, values: input };
  }

  const t = words(contact).courriel;
  const from = fill(t.de, { nom: input.nom, email: input.email });
  // The subject is one line: a name holds no line break after this.
  const subject = fill(t.objet, { nom: input.nom }).replace(/\s+/g, " ");
  try {
    await sendEmail(
      to,
      {
        subject,
        text: `${from}\n\n${input.message}`,
        html: `<p>${escapeHtml(from)}</p><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`,
      },
      undefined,
      { replyTo: input.email },
    );
  } catch (error) {
    console.error("contact: the message was not sent", error);
    return { failed: true, values: input };
  }
  return { sent: true };
}
