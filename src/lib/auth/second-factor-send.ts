import "server-only";

import { siteUrl } from "@/app/site";
import type { User } from "@/db";
import { sendEmail } from "@/lib/email/send";
import { signInCodeEmail } from "@/lib/email/templates";

import { issueSignInCode, type IssuedCode } from "./second-factor-store";

export type SentCode = "sent" | "too-soon" | "failed";

/**
 * Makes a code for `user` and sends it to her account's address. `too-soon`
 * when one left less than 60 seconds ago (nothing is sent). `failed` when
 * the e-mail did not leave: the code row stays, so « Renvoyer le code »
 * replaces it after the gap. Never throws.
 */
export async function sendSignInCode(user: User): Promise<SentCode> {
  let issued: IssuedCode;
  try {
    issued = await issueSignInCode(user.id);
  } catch (error) {
    console.error("[comptes] sign-in code not issued", { userId: user.id, error });
    return "failed";
  }
  if (issued.outcome === "too-soon") return "too-soon";

  try {
    await sendEmail(user.email, signInCodeEmail({ siteUrl, prenom: user.firstName, code: issued.code }));
    return "sent";
  } catch (error) {
    console.error("[comptes] sign-in code e-mail failed", { userId: user.id, error });
    return "failed";
  }
}
