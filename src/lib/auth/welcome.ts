import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { after } from "next/server";

import { db, users, type User } from "@/db";
import { sendEmail } from "@/lib/email/send";
import { welcomeFamilyEmail } from "@/lib/email/templates";

import { SPACES } from "./routing";

/**
 * The family's welcome e-mail, sent once, when the address is first verified.
 * The claim is one conditional UPDATE, so two clicks on the same link race for
 * one row and only the winner sends. A failed send releases the claim and is
 * logged; it never blocks the family from reaching their space. The family's
 * home asks again on every visit (`scheduleWelcomeIfDue`), so a released claim
 * is tried again until one send goes out (D-165).
 */
export async function sendWelcomeIfDue(user: User, siteUrl: string): Promise<void> {
  if (user.role !== "parent" || user.welcomeSentAt) return;

  let claimed: { id: string }[];
  try {
    claimed = await db
      .update(users)
      .set({ welcomeSentAt: new Date() })
      .where(and(eq(users.id, user.id), isNull(users.welcomeSentAt)))
      .returning({ id: users.id });
  } catch (error) {
    console.error("[comptes] welcome claim failed", { userId: user.id, error });
    return;
  }
  if (claimed.length === 0) return;

  try {
    await sendEmail(
      user.email,
      welcomeFamilyEmail({
        siteUrl,
        prenom: user.firstName,
        url: `${siteUrl}${SPACES.parent}`,
      }),
      `welcome-${user.id}`,
    );
  } catch (error) {
    console.error("[comptes] welcome e-mail failed", { userId: user.id, error });
    await db
      .update(users)
      .set({ welcomeSentAt: null })
      .where(eq(users.id, user.id))
      .catch((releaseError) =>
        console.error("[comptes] welcome claim not released", { userId: user.id, releaseError }),
      );
  }
}

/**
 * Asks for the welcome after the response, so neither the verification
 * confirmer's redirect nor the family's home waits on Resend (D-166). The home
 * calls it on every visit: a send that failed and released its claim is tried
 * again there (D-165). `siteUrl` is read by the caller before this call, since
 * `headers()` is not available inside `after()`.
 */
export function scheduleWelcomeIfDue(user: User, siteUrl: string): void {
  if (user.role !== "parent" || user.welcomeSentAt) return;
  after(() => sendWelcomeIfDue(user, siteUrl));
}
