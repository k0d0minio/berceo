"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { siteUrl } from "@/app/site";
import { db, userConsents, users } from "@/db";
import { consentRows } from "@/lib/auth/consent";
import { currentUser } from "@/lib/auth/current-user";
import { RETURN_COOKIE, RETURN_COOKIE_OPTIONS, returnToStore } from "@/lib/auth/retour";
import { authOutcome } from "@/lib/auth/errors";
import { landingFor, SIGN_IN_PATH, withReturn } from "@/lib/auth/routing";
import {
  CODE_PATH,
  DEVICE_COOKIE,
  DEVICE_COOKIE_OPTIONS,
  needsSecondFactor,
  normalizeCode,
} from "@/lib/auth/second-factor";
import { sendSignInCode } from "@/lib/auth/second-factor-send";
import { checkSignInCode, isDeviceTrusted, trustDevice, type CodeCheck } from "@/lib/auth/second-factor-store";
import { getAuth } from "@/lib/auth/server";
import { deleteOrphanIdentity, orphanByEmail, userByAuthId } from "@/lib/auth/users";
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
  | "inscriptionIncomplete"
  | "inscriptionEnCours"
  | "suspendu"
  | "generique"
  | "renvoye"
  | "confirmation"
  | "codeRenvoye"
  | "codeAttendre"
  | "codeEnvoiEchoue"
  | "codeIncorrect"
  | "codeEpuise"
  | "codeExpire"
  | "codeInvalide";

export type SignUpState = {
  errors?: FieldErrors<SignUpField>;
  message?: FormMessage;
  /** What was typed, minus the passwords, so a refused form keeps it. */
  values?: { prenom: string; nom: string; email: string; telephone: string; formule: string };
};

export async function signUp(
  role: SignUpRole,
  retour: string | null,
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
    formule: input.formule,
  };
  // A family picks one of the four plans before her account (abonnements-inscription-famille).
  const checked = validateSignUp(input, { needsPlan: role === "parent" });
  if (!checked.ok) return { errors: checked.errors, values };

  const { firstName, lastName, email, phone, password, plan } = checked.values;
  const createIdentity = () =>
    getAuth().signUp.email({
      email,
      password,
      // "|" keeps the first name recoverable even when it is itself compound
      // ("Marie Claire"): webhook.ts's prenomFor() splits on it, never on
      // whitespace, for the users row race on the first verification e-mail.
      name: `${firstName}|${lastName}`,
    });

  let { data, error } = await createIdentity();

  if (error && authOutcome(error) === "existe") {
    // An address that already has an account reads exactly like a new one (D-34).
    // An orphan a failed sign-up left behind is replaced by this one, once (D-160).
    let orphan: OrphanOutcome;
    try {
      orphan = await replaceOrphan(email);
    } catch (replaceError) {
      console.error("[comptes] orphan identity not replaced", { replaceError });
      return { message: "generique", values };
    }
    if (orphan === "aucune") redirect("/verification-email");
    // Too young to tell from a sign-up still writing its row (D-172).
    if (orphan === "recente") return { message: "inscriptionEnCours", values };
    ({ data, error } = await createIdentity());
  }

  if (error) {
    const outcome = authOutcome(error);
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

  // The row id is ours, so the users row, with the plan picked, and its two consent rows go in one batch.
  const id = crypto.randomUUID();
  try {
    await db.batch([
      db.insert(users).values({ id, authUserId, email, firstName, lastName, phone, role, signupPlan: plan }),
      db.insert(userConsents).values(consentRows(id)),
    ]);
  } catch (writeError) {
    console.error("[comptes] users row not written after sign-up", { authUserId, writeError });
    // The identity goes too, so the address is free again (D-159); should this
    // fail as well, the next sign-up with the address replaces it (D-160).
    try {
      await deleteOrphanIdentity(authUserId);
    } catch (deleteError) {
      console.error("[comptes] orphan identity not removed after a failed sign-up", {
        authUserId,
        deleteError,
      });
    }
    return { message: "generique", values };
  }

  // The way back through the e-mail confirmation (D-129): checked again here, a family's only.
  const back = returnToStore(role, retour);
  if (back) (await cookies()).set(RETURN_COOKIE, back, RETURN_COOKIE_OPTIONS);

  redirect("/verification-email");
}

type OrphanOutcome = "remplacee" | "recente" | "aucune";

/**
 * Whether the address's identity was an orphan (no `users` row) and is now
 * deleted (`remplacee`), is one still inside the grace (`recente`), or is no
 * orphan at all (`aucune`: a real account, or no identity).
 */
async function replaceOrphan(email: string): Promise<OrphanOutcome> {
  const orphan = await orphanByEmail(email);
  if (!orphan) return "aucune";
  if (!orphan.pastGrace) return "recente";
  return (await deleteOrphanIdentity(orphan.authUserId)) ? "remplacee" : "aucune";
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
    if (outcome === "suspendu") return { message: "suspendu", email };
    console.error("[comptes] sign-in failed", { code: error.code, status: error.status });
    return { message: "generique", email };
  }

  const authUserId = data?.user?.id;
  const row = authUserId ? await userByAuthId(authUserId) : null;
  if (!row) {
    console.error("[comptes] signed-in identity has no users row", { authUserId });
    // Its sign-up never finished: the session ends, and signing up again with
    // the same address replaces the identity (D-171).
    await getAuth().signOut();
    return { message: "inscriptionIncomplete", email };
  }
  if (row.suspendedAt) {
    // A suspended account signs in to nothing (D-134): its new session ends at once.
    await getAuth().signOut();
    return { message: "suspendu", email };
  }

  // A professional or a founder gives a code on a device no code trusted yet (comptes-2fa).
  if (needsSecondFactor(row.role)) {
    const token = (await cookies()).get(DEVICE_COOKIE)?.value;
    if (!(await isDeviceTrusted(row.id, token))) {
      const sent = await sendSignInCode(row);
      // The page opens either way: a failed e-mail is said there, and « Renvoyer le code » replaces it.
      redirect(codePage(retour, sent === "failed"));
    }
  }

  redirect(landingFor(row.role, retour));
}

/** The code page's address, with the way back and, when the e-mail did not leave, the notice. */
function codePage(retour: string | null, sendFailed: boolean): string {
  const page = withReturn(CODE_PATH, retour);
  if (!sendFailed) return page;
  return `${page}${page.includes("?") ? "&" : "?"}envoi=echec`;
}

export type SignInCodeState = { message?: FormMessage };

/**
 * The code page's one action (comptes-2fa). « Valider le code » checks the six
 * digits and trusts the device; « Renvoyer le code » (`intention=renvoyer`)
 * sends a new code. Only a session that owes the code may call it: anyone
 * else goes where she belongs.
 */
export async function signInCode(
  retour: string | null,
  _previous: SignInCodeState,
  form: FormData,
): Promise<SignInCodeState> {
  const who = await currentUser();
  if (who.status === "ok") redirect(landingFor(who.user.role, retour));
  if (who.status !== "needs-code") redirect(SIGN_IN_PATH);

  if (form.get("intention") === "renvoyer") {
    const sent = await sendSignInCode(who.user);
    if (sent === "too-soon") return { message: "codeAttendre" };
    if (sent === "failed") return { message: "codeEnvoiEchoue" };
    return { message: "codeRenvoye" };
  }

  const code = normalizeCode(String(form.get("code") ?? ""));
  if (!code) return { message: "codeInvalide" };

  let check: CodeCheck = "none";
  let token = "";
  try {
    check = await checkSignInCode(who.user.id, code);
    if (check === "ok") ({ token } = await trustDevice(who.user.id));
  } catch (error) {
    console.error("[comptes] sign-in code check failed", { userId: who.user.id, error });
    return { message: "generique" };
  }
  if (check === "wrong") return { message: "codeIncorrect" };
  if (check === "dead") return { message: "codeEpuise" };
  if (check !== "ok") return { message: "codeExpire" };

  // The browser keeps the raw token for 30 days; the row keeps its hash.
  (await cookies()).set(DEVICE_COOKIE, token, DEVICE_COOKIE_OPTIONS);
  redirect(landingFor(who.user.role, retour));
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

  // The e-mail's link is built by the webhook from the site's address, never
  // from this value; it is only what Neon Auth is given (D-149).
  const { error } = await getAuth().requestPasswordReset({
    email,
    redirectTo: `${siteUrl}/nouveau-mot-de-passe`,
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
