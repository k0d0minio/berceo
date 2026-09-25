"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { rateFromForm } from "@/lib/avis/submit";
import { professionalRatingPath } from "@/lib/avis/paths";
import type { RatingState } from "@/lib/avis/rules";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { UUID } from "@/lib/demandes/requests";

/*
 * « Envoyer mon avis » (avis-etoiles, D-117): the professional rates the family she came to (D-115: Accueil, Communication, Clarté des consignes, Respect du cadre).
 * The side is `professionnelle` because this is her route; the user is the
 * session's; the bound id is a lookup key only, and the write is scoped to her
 * own garde in its SQL. Only four whole scores are read from the form.
 */
export async function rateProfessionalAction(bookingId: string, _state: RatingState, form: FormData): Promise<RatingState> {
  const id = String(bookingId);
  if (!UUID.test(id)) notFound();
  const user = await requireAccess(professionalRatingPath(id));

  const { stored, ...state } = await rateFromForm("professionnelle", user.id, id, form);
  if (!stored) return state;
  revalidatePath(SPACES.professionnel, "layout");
  redirect(`${professionalRatingPath(id)}?merci=1`);
}
