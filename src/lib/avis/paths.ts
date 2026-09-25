import { SPACES } from "@/lib/auth/routing";
import { familyBookingPath, professionalBookingPath } from "@/lib/reservations/paths";

/** The family's rating form for one of her gardes (avis-etoiles). */
export function familyRatingPath(bookingId: string): string {
  return `${familyBookingPath(bookingId)}/avis`;
}

/** The professional's rating form for one of her gardes (avis-etoiles). */
export function professionalRatingPath(bookingId: string): string {
  return `${professionalBookingPath(bookingId)}/avis`;
}

/** « Avis après les gardes »: the founders' list (G-03, D-118). */
export const ADMIN_RATINGS_PATH = `${SPACES.admin}/avis`;
