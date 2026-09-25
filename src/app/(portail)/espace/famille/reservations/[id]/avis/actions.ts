"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { rateFromForm } from "@/lib/avis/submit";
import { familyRatingPath } from "@/lib/avis/paths";
import type { RatingState } from "@/lib/avis/rules";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { UUID } from "@/lib/demandes/requests";

/*
 * « Envoyer mon avis » (avis-etoiles, D-117): the family rates the professional who came (D-115: Ponctualité, Communication, Soin, Confiance).
 * The side is `famille` because this is her route; the user is the
 * session's; the bound id is a lookup key only, and the write is scoped to her
 * own garde in its SQL. Only four whole scores are read from the form.
 */
export async function rateFamilyAction(bookingId: string, _state: RatingState, form: FormData): Promise<RatingState> {
  const id = String(bookingId);
  if (!UUID.test(id)) notFound();
  const user = await requireAccess(familyRatingPath(id));

  const { stored, ...state } = await rateFromForm("famille", user.id, id, form);
  if (!stored) return state;
  revalidatePath(SPACES.parent, "layout");
  redirect(`${familyRatingPath(id)}?merci=1`);
}
