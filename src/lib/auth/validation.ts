/**
 * The sign-up and password forms' rules, as pure functions so the tests can
 * hold them to the spec: every field required, a well-formed e-mail, a Belgian
 * or international phone stored as E.164, a password of 8 to 128 characters
 * with no composition rule, a matching confirmation, and the consent ticked.
 *
 * Errors are catalogue keys (`comptes.erreurs`), never sentences, so the words
 * stay in `src/content/`.
 */

export type FieldError =
  | "requis"
  | "email"
  | "telephone"
  | "motDePasseCourt"
  | "motDePasseLong"
  | "confirmation"
  | "consentement";

export type SignUpField =
  | "prenom"
  | "nom"
  | "email"
  | "telephone"
  | "motDePasse"
  | "confirmation"
  | "consentement";

export type SignUpInput = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  confirmation: string;
  consentement: boolean;
};

export type SignUpValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export type FieldErrors<F extends string> = Partial<Record<F, FieldError>>;

export type Validated<V, F extends string> =
  | { ok: true; values: V }
  | { ok: false; errors: FieldErrors<F> };

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** Trimmed and lower-cased: the form Neon Auth and `users.email` both store. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** One @, something on each side, a dot in the domain, no spaces. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/**
 * A phone number in E.164, or null when it cannot be one.
 *
 * Accepts the way Belgians write their numbers (`0470 12 34 56`,
 * `02/123.45.67`), the international forms (`+32 470…`, `0032 470…`) and any
 * other country's `+` number. Separators (spaces, dots, dashes, slashes,
 * brackets) are dropped. A national number starts with 0 and has 9 digits
 * (landline) or 10 (mobile).
 */
export function normalizePhone(raw: string): string | null {
  // "(0)" after a country code is the trunk digit (+32 (0)470…); E.164 drops it.
  const compact = raw
    .trim()
    .replace(/^((?:\+|00)\d{1,3})\s*\(0\)/, "$1")
    .replace(/[\s.\-/()]/g, "");
  if (compact === "") return null;

  let international: string;
  if (compact.startsWith("+")) {
    international = compact.slice(1);
  } else if (compact.startsWith("00")) {
    international = compact.slice(2);
  } else if (/^0\d{8,9}$/.test(compact)) {
    international = `32${compact.slice(1)}`;
  } else {
    return null;
  }

  // A trunk 0 written after Belgium's code (+32 0470…) is dropped as well.
  if (/^320\d{8,9}$/.test(international)) international = `32${international.slice(3)}`;

  // E.164: a country code that does not start with 0, 8 to 15 digits in all.
  if (!/^[1-9]\d{7,14}$/.test(international)) return null;
  return `+${international}`;
}

/** The password and its confirmation, shared by sign-up and the reset page. */
export function passwordErrors(
  password: string,
  confirmation: string,
): FieldErrors<"motDePasse" | "confirmation"> {
  const errors: FieldErrors<"motDePasse" | "confirmation"> = {};

  if (password === "") errors.motDePasse = "requis";
  else if (password.length < PASSWORD_MIN) errors.motDePasse = "motDePasseCourt";
  else if (password.length > PASSWORD_MAX) errors.motDePasse = "motDePasseLong";

  if (confirmation === "") errors.confirmation = "requis";
  else if (confirmation !== password) errors.confirmation = "confirmation";

  return errors;
}

export function validateSignUp(
  input: SignUpInput,
): Validated<SignUpValues, SignUpField> {
  const errors: FieldErrors<SignUpField> = {};

  const firstName = input.prenom.trim();
  const lastName = input.nom.trim();
  if (firstName === "") errors.prenom = "requis";
  if (lastName === "") errors.nom = "requis";

  const email = normalizeEmail(input.email);
  if (email === "") errors.email = "requis";
  else if (!isValidEmail(email)) errors.email = "email";

  const phone = normalizePhone(input.telephone);
  if (input.telephone.trim() === "") errors.telephone = "requis";
  else if (phone === null) errors.telephone = "telephone";

  Object.assign(errors, passwordErrors(input.motDePasse, input.confirmation));

  if (!input.consentement) errors.consentement = "consentement";

  if (Object.keys(errors).length > 0 || phone === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    values: { firstName, lastName, email, phone, password: input.motDePasse },
  };
}

/** Reads a sign-up form. A missing field reads as empty, never as undefined. */
export function readSignUpForm(form: FormData): SignUpInput {
  const text = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    prenom: text("prenom"),
    nom: text("nom"),
    email: text("email"),
    telephone: text("telephone"),
    motDePasse: text("motDePasse"),
    confirmation: text("confirmation"),
    consentement: form.get("consentement") === "on",
  };
}

/**
 * The roles a sign-up form may create. The role reaches the server action as
 * an argument the client can rewrite, so it is checked at runtime: admins are
 * granted by `npm run admin:grant`, never signed up (D-33).
 */
export const SIGN_UP_ROLES = ["parent", "professionnel"] as const;
export type SignUpRole = (typeof SIGN_UP_ROLES)[number];

export function isSignUpRole(value: unknown): value is SignUpRole {
  return (SIGN_UP_ROLES as readonly unknown[]).includes(value);
}
