import { SPACES } from "@/lib/auth/routing";

/** A professional's full profile, as a family sees it (D-75). */
export const FAMILY_PROFESSIONALS_PATH = `${SPACES.parent}/professionnelles`;

export function professionalProfilePath(profileId: string, requestId?: string): string {
  const path = `${FAMILY_PROFESSIONALS_PATH}/${profileId}`;
  return requestId ? `${path}?demande=${requestId}` : path;
}

/** « Lui envoyer ma demande en priorité »: choose a request or publish one (D-71). */
export function priorityPath(profileId: string): string {
  return `${FAMILY_PROFESSIONALS_PATH}/${profileId}/priorite`;
}

/** « Mes réservations »: the family's bookings. */
export const FAMILY_BOOKINGS_PATH = `${SPACES.parent}/reservations`;

export function familyBookingPath(id: string): string {
  return `${FAMILY_BOOKINGS_PATH}/${id}`;
}

/** « Mes gardes »: the professional's bookings. */
export const PROFESSIONAL_BOOKINGS_PATH = `${SPACES.professionnel}/gardes`;

export function professionalBookingPath(id: string): string {
  return `${PROFESSIONAL_BOOKINGS_PATH}/${id}`;
}
