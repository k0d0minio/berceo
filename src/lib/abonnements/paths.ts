import { SPACES } from "@/lib/auth/routing";

/** « Votre abonnement »: the four plans, or the family's plan and its renewal date. */
export const SUBSCRIPTION_PATH = `${SPACES.parent}/abonnement`;

/** Where Stripe sends the family back once she paid (`success_url`). */
export const SUBSCRIPTION_RETURN_PATH = `${SUBSCRIPTION_PATH}/retour`;
