import { SPACES } from "@/lib/auth/routing";

/** The family's profile page, inside her space (and so behind its guard). */
export const PROFILE_PATH = `${SPACES.parent}/profil`;

/** The professionals' charter, read inside her space so the signed-in shell stays (round 2, JAM-301). */
export const FAMILY_CHARTER_PATH = `${SPACES.parent}/charte`;

/** The sleep consultation, booked inside her space so the signed-in shell stays (JAM-582). */
export const FAMILY_SLEEP_CONSULTATION_PATH = `${SPACES.parent}/consultation-sommeil`;
