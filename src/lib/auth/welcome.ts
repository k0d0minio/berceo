import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db, users, type User } from "@/db";
import { sendEmail } from "@/lib/email/send";
import { welcomeFamilyEmail } from "@/lib/email/templates";

import { SPACES } from "./routing";

/**
 * The family's welcome e-mail, sent once, when the address is first verified.
 * The claim is one conditional UPDATE, so two clicks on the same link race for
 * one row and only the winner sends. A failed send releases the claim and is
 * logged; it never blocks the family from reaching their space.
 */
export async function sendWelcomeIfDue(user: User, siteUrl: string): Promise<void> {
  if (user.role !== "parent" || user.welcomeSentAt) return;

  const claimed = await db
    .update(users)
    .set({ welcomeSentAt: new Date() })
    .where(and(eq(users.id, user.id), isNull(users.welcomeSentAt)))
    .returning({ id: users.id });
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
    await db.update(users).set({ welcomeSentAt: null }).where(eq(users.id, user.id));
  }
}
