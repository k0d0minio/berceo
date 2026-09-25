import { SPACES } from "@/lib/auth/routing";

/** The family's requests, inside her space (and so behind its guard). */
export const FAMILY_REQUESTS_PATH = `${SPACES.parent}/demandes`;

/** The publish form; `?urgente=1` opens it for tonight or tomorrow night (D-60). */
export const NEW_REQUEST_PATH = `${FAMILY_REQUESTS_PATH}/nouvelle`;
export const NEW_URGENT_REQUEST_PATH = `${NEW_REQUEST_PATH}?urgente=1`;

/** The open requests in a professional's communes. */
export const PROFESSIONAL_REQUESTS_PATH = `${SPACES.professionnel}/demandes`;

export function familyRequestPath(id: string): string {
  return `${FAMILY_REQUESTS_PATH}/${id}`;
}
