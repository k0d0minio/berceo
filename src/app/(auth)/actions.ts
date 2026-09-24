"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db, userConsents, users } from "@/db";
import { consentRows } from "@/lib/auth/consent";
import { authOutcome } from "@/lib/auth/errors";
import { landingFor, SIGN_IN_PATH } from "@/lib/auth/routing";
import { getAuth } from "@/lib/auth/server";
import {
  isSignUpRole,
  isValidEmail,
  normalizeEmail,
  passwordErrors,
  readSignUpForm,
  validateSignUp,
  type FieldErrors,
  type SignUpField,
  type SignUpRole,
} from "@/lib/auth/validation";

/*
 * The account forms' server actions. Every message they return is a catalogue
 * key (src/content/comptes.ts), never text; the forms look the words up.
 */

export type FormMessage =
  | "identifiants"
  | "nonVerifie"
  | "lienInvalide"
  | "compteIndisponible"
  | "generique"
  | "renvoye"
  | "confirmation";

export type SignUpState = {
  errors?: FieldErrors<SignUpField>;
  message?: FormMessage;
  /** What was typed, minus the passwords, so a refused form keeps it. */
  values?: { prenom: string; nom: string; email: string; telephone: string };
};

export async function signUp(
  role: SignUpRole,
  _previous: SignUpState,
  form: FormData,
): Promise<SignUpState> {
  // A server action's arguments come from the client: never trust the bound role.
  if (!isSignUpRole(role)) {
    console.error("[comptes] sign-up refused: role not allowed", {
      role: String(role).slice(0, 32),
    });
    return { message: "generique" };
  }

  const input = readSignUpForm(form);
  const values = {
    prenom: input.prenom,
    nom: input.nom,
    email: input.email,
    telephone: input.telephone,
  };
  const checked = validateSignUp(input);
  if (!checked.ok) return { errors: checked.errors, values };

  const { firstName, lastName, email, phone, password } = checked.values;
  const { data, error } = await getAuth().signUp.email({
    email,
    password,
    // "|" keeps the first name recoverable even when it is itself compound
    // ("Marie Claire"): webhook.ts's prenomFor() splits on it, never on
    // whitespace, for the users row race on the first verification e-mail.
    name: `${firstName}|${lastName}`,
  });

  if (error) {
    const outcome = authOutcome(error);
    // An address that already has an account reads exactly like a new one (D-34).
    if (outcome === "existe") redirect("/verification-email");
    if (outcome === "motDePasseCourt" || outcome === "motDePasseLong") {
      return { errors: { motDePasse: outcome }, values };
    }
    console.error("[comptes] sign-up refused by Neon Auth", { code: error.code, status: error.status });
    return { message: "generique", values };
  }

  const authUserId = data?.user?.id;
  if (!authUserId) {
    console.error("[comptes] sign-up returned no user");
    return { message: "generique", values };
  }

  // The row id is ours, so the users row and its two consent rows go in one batch.
  const id = crypto.randomUUID();
  try {
    await db.batch([
      db.insert(users).values({ id, authUserId, email, firstName, lastName, phone, role }),
      db.insert(userConsents).values(consentRows(id)),
    ]);
  } catch (writeError) {
    console.error("[comptes] users row not written after sign-up", { authUserId, writeError });
    return { message: "generique", values };
  }

  redirect("/verification-email");
}

export type SignInState = {
  message?: FormMessage;
  email?: string;
};

export async function signIn(
  retour: string | null,
  _previous: SignInState,
  form: FormData,
): Promise<SignInState> {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const password = String(form.get("motDePasse") ?? "");
  if (!email || !password) return { message: "identifiants", email };

  const { data, error } = await getAuth().signIn.email({ email, password });
  if (error) {
    const outcome = authOutcome(error);
    if (outcome === "nonVerifie") return { message: "nonVerifie", email };
    if (outcome === "identifiants") return { message: "identifiants", email };
    console.error("[comptes] sign-in failed", { code: error.code, status: error.status });
    return { message: "generique", email };
  }

  const authUserId = data?.user?.id;
  const [row] = authUserId
    ? await db.select().from(users).where(eq(users.authUserId, authUserId)).limit(1)
    : [];
  if (!row) {
    console.error("[comptes] signed-in identity has no users row", { authUserId });
    return { message: "compteIndisponible", email };
  }

  redirect(landingFor(row.role, retour));
}

/** Always the same neutral answer: whether the address exists is never said. */
export async function resendVerification(form: FormData): Promise<void> {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (isValidEmail(email)) {
    const { error } = await getAuth().sendVerificationEmail({ email });
    if (error) console.error("[comptes] resend verification failed", { code: error.code });
  }
  redirect(`${SIGN_IN_PATH}?renvoye=1`);
}

export type ResetRequestState = { sent?: boolean; invalid?: boolean; email?: string };

export async function requestPasswordReset(
  _previous: ResetRequestState,
  form: FormData,
): Promise<ResetRequestState> {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!isValidEmail(email)) return { invalid: true, email };

  const origin = (await headers()).get("origin") ?? "";
  const { error } = await getAuth().requestPasswordReset({
    email,
    redirectTo: `${origin}/nouveau-mot-de-passe`,
  });
  // Logged, never shown: the answer is the guide's neutral line either way.
  if (error) console.error("[comptes] reset request failed", { code: error.code, status: error.status });
  return { sent: true };
}

export type NewPasswordState = {
  errors?: FieldErrors<"motDePasse" | "confirmation">;
  message?: FormMessage;
};

export async function setNewPassword(
  token: string,
  _previous: NewPasswordState,
  form: FormData,
): Promise<NewPasswordState> {
  const password = String(form.get("motDePasse") ?? "");
  const errors = passwordErrors(password, String(form.get("confirmation") ?? ""));
  if (Object.keys(errors).length > 0) return { errors };

  const { error } = await getAuth().resetPassword({ newPassword: password, token });
  if (error) {
    const outcome = authOutcome(error);
    if (outcome === "motDePasseCourt" || outcome === "motDePasseLong") {
      return { errors: { motDePasse: outcome } };
    }
    if (outcome !== "lienInvalide") {
      console.error("[comptes] password reset failed", { code: error.code, status: error.status });
    }
    return { message: outcome === "lienInvalide" ? "lienInvalide" : "generique" };
  }

  redirect(`${SIGN_IN_PATH}?mdp=1`);
}

export async function signOut(): Promise<void> {
  await getAuth().signOut();
  redirect(SIGN_IN_PATH);
}
