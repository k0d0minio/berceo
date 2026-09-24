import { redirect } from "next/navigation";

import { SPACE } from "./step";

/* The onboarding has no page of its own: the space sends her to the right step. */
export default function InscriptionPage() {
  redirect(SPACE);
}
