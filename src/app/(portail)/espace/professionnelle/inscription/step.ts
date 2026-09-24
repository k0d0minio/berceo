import "server-only";

import { redirect } from "next/navigation";

import type { User } from "@/db";
import { requireAccess } from "@/lib/auth/guard";
import { loadFile, type ProfessionalFile } from "@/lib/professionnelle/file";
import { STEPS, canOpenStep, firstIncompleteStep, type Step } from "@/lib/professionnelle/rules";

export const SPACE = "/espace/professionnelle";
export const ONBOARDING = `${SPACE}/inscription`;

/**
 * The gate every onboarding page passes: a professional, whose file is still a
 * draft, on a step whose earlier steps are complete. Anything else is sent
 * where it belongs: a submitted file to her space, a step opened too early to
 * the first incomplete one.
 */
export async function openStep(
  step: Step,
): Promise<{ user: User; file: ProfessionalFile; done: Step[] }> {
  const user = await requireAccess(`${ONBOARDING}/${step}`);
  const file = await loadFile(user.id);

  if (file.profile.status !== "brouillon") redirect(SPACE);
  if (!canOpenStep(file.state, step)) redirect(`${ONBOARDING}/${firstIncompleteStep(file.state)}`);

  const first = firstIncompleteStep(file.state);
  const done = STEPS.slice(0, STEPS.indexOf(first));
  return { user, file, done };
}
