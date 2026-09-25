"use server";

import { revalidatePath } from "next/cache";

import { requireAccess } from "@/lib/auth/guard";
import { ownProfile, setNights } from "@/lib/disponibilites/nights";
import { AVAILABILITY_PATH } from "@/lib/disponibilites/paths";
import { availabilityWindow, validateNights } from "@/lib/disponibilites/rules";

/*
 * The one save of « Mes disponibilités »: the selected nights, marked
 * (« Disponible ») or cleared (« Indisponible »). The form carries only dates
 * and the button pressed; the profile is the session's, found from its user,
 * never from the form. The set is checked against today's window in Brussels
 * and refused whole when one date is out of it, so nothing is stored in part.
 * Messages are catalogue keys; the calendar looks the words up.
 */

export type NightsState = {
  ok?: boolean;
  message?: "enregistre" | "horsFenetre" | "vide" | "nonValide" | "generique";
};

export async function saveNightsAction(
  _previous: NightsState,
  form: FormData,
): Promise<NightsState> {
  const user = await requireAccess(AVAILABILITY_PATH);
  const profile = await ownProfile(user.id);
  if (!profile || profile.status !== "valide") return { message: "nonValide" };

  const etat = form.get("etat");
  if (etat !== "disponible" && etat !== "indisponible") return { message: "generique" };

  const values = form.getAll("nuit").map((value) => (typeof value === "string" ? value : ""));
  const checked = validateNights(values, availabilityWindow(new Date()));
  if (!checked.ok) return { message: checked.reason };

  try {
    await setNights(profile.id, checked.dates, etat === "disponible");
  } catch (error) {
    // The error's name only: Drizzle's message lists the query's parameters.
    console.error("[disponibilites] nights not saved", {
      userId: user.id,
      error: error instanceof Error ? error.name : typeof error,
    });
    return { message: "generique" };
  }

  revalidatePath(AVAILABILITY_PATH);
  return { ok: true, message: "enregistre" };
}
