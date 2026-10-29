"use server";

import { revalidatePath } from "next/cache";

import { familyMayNow } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { setMark } from "@/lib/favoris/favourites";
import { SEARCH_PATH } from "@/lib/recherche/slugs";
import { FAMILY_PROFESSIONALS_PATH, professionalProfilePath } from "@/lib/reservations/paths";
import { publicProfile } from "@/lib/reservations/profiles";

/*
 * « Ajouter à mes professionnelles » and « Retirer de mes professionnelles »
 * (favoris-marquer). The family is the session's, never the form's. The
 * profile id and the wanted state are bound on the page, so both are checked
 * again here: the subscription's gate (`favori`), since a subscription can
 * end between the page and the click, and a validated profile, as
 * `publicProfile` reads it. A refusal changes nothing, and the page shows the
 * invitation line or no mark at its next render. « Mes professionnelles »
 * (favoris-liste) re-reads its list after the write.
 */
export async function markAction(profileId: string, marked: boolean): Promise<void> {
  const user = await requireAccess(FAMILY_PROFESSIONALS_PATH);
  if (!(await familyMayNow(user.id, "favori", new Date()))) return;
  const profile = await publicProfile(profileId);
  if (!profile) return;
  await setMark(user.id, profile.id, marked === true);
  revalidatePath(professionalProfilePath(profile.id));
  revalidatePath(SEARCH_PATH);
  revalidatePath(FAMILY_PROFESSIONALS_PATH);
}
