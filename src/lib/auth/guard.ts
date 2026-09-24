import "server-only";

import { notFound, redirect } from "next/navigation";

import type { User } from "@/db";

import { currentUser } from "./current-user";
import { accessFor, landingFor, signInWithReturn } from "./routing";

/**
 * The server-side gate every space page calls with its own path. The proxy
 * only refreshes the session and bounces signed-out visitors; the role is
 * checked here, where the `users` row is read.
 */
export async function requireAccess(pathname: string): Promise<User> {
  const who = await currentUser();

  if (who.status !== "ok") {
    // /admin never confirms it exists, not even to a signed-out visitor.
    if (accessFor(null, pathname).kind === "not-found") notFound();
    if (who.status === "no-row") redirect("/connexion?erreur=compte");
    redirect(signInWithReturn(pathname));
  }

  const access = accessFor(who.user.role, pathname);
  if (access.kind === "not-found") notFound();
  if (access.kind === "redirect") redirect(access.to);
  return who.user;
}

/** The account pages are for signed-out visitors: a signed-in user goes to their space. */
export async function redirectIfSignedIn(retour?: string | null): Promise<void> {
  const who = await currentUser();
  if (who.status === "ok") redirect(landingFor(who.user.role, retour));
}
