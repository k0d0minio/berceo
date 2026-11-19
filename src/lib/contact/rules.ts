/*
 * The contact form's rules (JAM-327): three required fields, a message of
 * 2,000 characters at most, and a hidden trap field that only a robot fills.
 * Pure: the server action in `send.ts` calls them, and so does the test.
 */

export const MESSAGE_MAX = 2000;

/** The trap field's name: hidden from people, so a value in it marks a robot. */
export const TRAP_FIELD = "site_web";

export type ContactInput = { nom: string; email: string; message: string };
export type ContactField = keyof ContactInput;
export type ContactError = "nom" | "email" | "message" | "messageLong";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readContact(form: FormData): ContactInput & { trap: string } {
  const text = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  return { nom: text("nom"), email: text("email"), message: text("message"), trap: text(TRAP_FIELD) };
}

/** The fields that block the form, each with its reason. Empty when the message can go. */
export function contactErrors(input: ContactInput): Partial<Record<ContactField, ContactError>> {
  const errors: Partial<Record<ContactField, ContactError>> = {};
  if (!input.nom) errors.nom = "nom";
  // One line only: a line break in a header field is how a form is made to send to others.
  if (!EMAIL.test(input.email) || /[\r\n]/.test(input.email) || input.email.length > 254) errors.email = "email";
  if (!input.message) errors.message = "message";
  else if ([...input.message].length > MESSAGE_MAX) errors.message = "messageLong";
  return errors;
}
