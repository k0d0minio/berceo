import { FAMILY_BOOKINGS_PATH } from "@/lib/reservations/paths";
import { SPACES } from "@/lib/auth/routing";

/** Where Stripe sends the family back once she paid (`success_url`, D-90). */
export const PAYMENT_RETURN_PATH = `${FAMILY_BOOKINGS_PATH}/paiement`;

/** Where « Retour » on Stripe's page sends her (`cancel_url`, D-92). */
export const PAYMENT_ABANDON_PATH = `${FAMILY_BOOKINGS_PATH}/paiement/abandon`;

/** The founders' list of fees (D-93). */
export const ADMIN_PAYMENTS_PATH = `${SPACES.admin}/paiements`;
