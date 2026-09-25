import "server-only";

import { Resend } from "resend";

import type { RenderedEmail } from "./templates";

/**
 * Sends one e-mail through Resend. The sender is `EMAIL_FROM` (D-28: the
 * operator's, once a domain is verified) and the key `RESEND_API_KEY`;
 * neither is in git. A missing variable or a refused send throws: the caller
 * logs it and answers non-2xx, never pretends the e-mail left.
 *
 * `idempotencyKey` makes Resend send once per key for 24 hours, whatever
 * instance the request lands on: Neon retries a webhook with the same event id.
 */
let client: Resend | null = null;

function resend(): Resend {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set — e-mail is unavailable. See .env.example.");
  client = new Resend(key);
  return client;
}

export async function sendEmail(
  to: string,
  email: RenderedEmail,
  idempotencyKey?: string,
  options?: {
    /** Where an answer goes: a founder's own address on her « Contacter l'utilisateur » (D-138). */
    replyTo?: string;
  },
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set — e-mail is unavailable. See .env.example.");

  const { error } = await resend().emails.send(
    {
      from,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(options?.replyTo ? { replyTo: options.replyTo } : {}),
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );
  if (error) {
    throw new Error(`Resend refused the e-mail: ${error.name} — ${error.message}`);
  }
}
