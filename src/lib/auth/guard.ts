import "server-only";

import { notFound, redirect } from "next/navigation";

import type { User } from "@/db";
import { mustRenewDeclarations } from "@/lib/professionnelle/declarations";
import { NEW_DECLARATIONS_PATH } from "@/lib/professionnelle/paths";

import { currentUser } from "./current-user";
import { accessFor, landingFor, pathnameOf, signInWithReturn, withReturn } from "./routing";
import { CODE_PATH } from "./second-factor";
import { SUSPENDED_PATH } from "./suspension";

/**
 * The server-side gate every space page calls with its own path. The proxy
 * only refreshes the session and bounces signed-out visitors; the role is
 * checked here, where the `users` row is read.
 *
 * `path` may carry the page's query (`withQuery`): the role is read on the
 * pathname alone, and the way back through sign-in keeps both (D-150).
 *
 * A professional whose submitted file carries declarations of an older
 * version accepts the new ones before any other page of her space opens, at
 * sign-in and on every later visit (onboarding-retour-1).
 *
 * A professional or a founder whose device owes the code (comptes-2fa) goes
 * to the code page first, with the way back, before the declarations. Her
 * own role decides what she may see: a professional on /admin still gets
 * the 404, and a founder sent from /admin learns nothing new.
 */
export async function requireAccess(path: string): Promise<User> {
  const who = await currentUser();
  const pathname = pathnameOf(path);

  if (who.status === "needs-code") {
    if (accessFor(who.user.role, pathname).kind === "not-found") notFound();
    redirect(withReturn(CODE_PATH, path));
  }

  if (who.status !== "ok") {
    // /admin never confirms it exists, not even to a signed-out visitor.
    if (accessFor(null, pathname).kind === "not-found") notFound();
    if (who.status === "no-row") redirect("/connexion?erreur=compte");
    // A suspended account's session ends here, and the sign-in page says why (D-134).
    if (who.status === "suspended") redirect(SUSPENDED_PATH);
    redirect(signInWithReturn(path));
  }

  const access = accessFor(who.user.role, pathname);
  if (access.kind === "not-found") notFound();
  if (access.kind === "redirect") redirect(access.to);
  if (
    who.user.role === "professionnel" &&
    pathname !== NEW_DECLARATIONS_PATH &&
    (await mustRenewDeclarations(who.user.id))
  ) {
    redirect(NEW_DECLARATIONS_PATH);
  }
  return who.user;
}

/** The account pages are for signed-out visitors: a signed-in user goes to their space, or to the code she owes. */
export async function redirectIfSignedIn(retour?: string | null): Promise<void> {
  const who = await currentUser();
  if (who.status === "ok") redirect(landingFor(who.user.role, retour));
  if (who.status === "needs-code") redirect(withReturn(CODE_PATH, retour));
}
