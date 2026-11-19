"use server";

import { contact } from "@/content/contact";
import { fill, words } from "@/content/locale";
import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/email/templates";

import { contactRecipient } from "./config";
import { contactErrors, readContact, type ContactError, type ContactField } from "./rules";

/*
 * The contact form's server action (JAM-327). It sends one e-mail through
 * Resend to the address of `CONTACT_EMAIL`, with the writer's address in
 * `Reply-To`. Nothing is stored. The answer never holds the destination
 * address. A robot that fills the trap field gets the confirmation and no
 * e-mail leaves. A refused field or a failed send keeps what was typed.
 */

export type ContactState = {
  sent?: boolean;
  failed?: boolean;
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
