"use server";

import { revalidatePath } from "next/cache";

import { getAuth } from "@/lib/auth/server";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { saveFamilyProfile } from "@/lib/famille/profile";
import {
  readProfileForm,
  validateProfile,
  type ProfileErrors,
  type ProfileInput,
} from "@/lib/famille/validation";

/*
 * The family profile's server action. The user is the session's, never the
 * form's: `requireAccess` answers for a parent and sends anyone else to their
 * own space (or to sign in), so no other role reaches the write. Messages are
 * catalogue keys; the form looks the words up.
 */

export type ProfileState = {
  errors?: ProfileErrors;
  message?: "generique";
  saved?: boolean;
  /** What was typed, so a refused form keeps it. */
  values?: ProfileInput;
};

export async function saveProfile(_previous: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireAccess(PROFILE_PATH);

  const input = readProfileForm(form);
  const checked = validateProfile(input);
  if (!checked.ok) return { errors: checked.errors, values: input };

  const values = checked.values;
  try {
    await saveFamilyProfile(user.id, values);
  } catch (writeError) {
    // Never the error itself: Drizzle's message lists the query's parameters,
    // which here are the family's address and phone.
    const cause = (writeError as { cause?: { code?: unknown } } | null)?.cause;
    console.error("[famille] profile not saved", {
      userId: user.id,
      error: writeError instanceof Error ? writeError.name : typeof writeError,
      code: typeof cause?.code === "string" ? cause.code : undefined,
    });
    return { message: "generique", values: input };
  }

  // Neon Auth keeps a display name from sign-up; keep it in step with the row.
  // The row is the source of truth, so a refusal here is logged, not shown.
  try {
    const { error } = await getAuth().updateUser({
      name: `${values.firstName} ${values.lastName}`,
    });
    if (error) {
      console.warn("[famille] Neon Auth name not updated", { code: error.code, status: error.status });
    }
  } catch (authError) {
    console.warn("[famille] Neon Auth name not updated", { authError });
  }

  revalidatePath(SPACES.parent, "layout");
  return { saved: true };
}
